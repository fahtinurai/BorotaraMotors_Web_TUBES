// ==============================
// NAVBAR BURGER RESPONSIVE
// ==============================
const burger = document.getElementById("adminBurger");
const navCenter = document.querySelector(".admin-nav-center");

if (burger && navCenter) {
  burger.addEventListener("click", () => {
    navCenter.classList.toggle("show");
  });
}

// ==============================
// LOGOUT
// ==============================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    window.location.href = "login-admin.html";
  });
}

// ==============================
// TAB NAVIGATION (Home / Buat Key / Tambah Kendaraan)
// ==============================
const menuLinks = document.querySelectorAll(".admin-menu-link");
const panels = document.querySelectorAll(".admin-section-panel");

menuLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const targetPanelId = link.getAttribute("data-panel");
    if (!targetPanelId) return;

    // navbar active visual
    menuLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    // show only the requested panel
    panels.forEach(panel => {
      if (panel.id === targetPanelId) {
        panel.classList.add("active-panel");
      } else {
        panel.classList.remove("active-panel");
      }
    });

    // scroll to top of content for better UX
    const mainEl = document.querySelector(".admin-main");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});


// =========================================================
// SHARED STORAGE HELPERS
// =========================================================
//
// userKeys = daftar akun/user yang di-manage admin.
// format: [{ username:"budi_teknisi", role:"teknisi", key:"TEK-44110" }, ...]
//
function loadUserKeys() {
  const raw = localStorage.getItem("userKeys");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveUserKeys(arr) {
  localStorage.setItem("userKeys", JSON.stringify(arr));
}

//
// vehiclesData = daftar kendaraan yang ditambahkan admin.
// format: [{ brand:"Toyota Avanza", plate:"B 1234 ASD" }, ...]
//
function loadVehicles() {
  const raw = localStorage.getItem("vehiclesData");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveVehicles(arr) {
  localStorage.setItem("vehiclesData", JSON.stringify(arr));
}


// =========================================================
// PANEL HOME
// - Dashboard statistik
// - Tambah / hapus user driver & teknisi
// - Tabel driver & teknisi
// =========================================================

// elemen form tambah user (home)
const homeUserName      = document.getElementById("homeUserName");
const homeUserRole      = document.getElementById("homeUserRole");
const homeUserKey       = document.getElementById("homeUserKey");
const homeGenKeyBtn     = document.getElementById("homeGenKeyBtn");
const homeAddUserBtn    = document.getElementById("homeAddUserBtn");
const homeUserError     = document.getElementById("homeUserError");

// elemen tabel & search home
const homeUserTableBody = document.getElementById("homeUserTableBody");
const homeSearchInput   = document.getElementById("homeSearchInput");

// elemen statistik di dashboard atas
const driverCountEl       = document.getElementById("driverCount");
const techCountEl         = document.getElementById("techCount");
const driverActivityValEl = document.getElementById("driverActivityVal");
const techActivityValEl   = document.getElementById("techActivityVal");

// render tabel HOME pakai userKeys (cuma driver & teknisi)
function renderHomeTableFromStorage() {
  if (!homeUserTableBody) return;
  homeUserTableBody.innerHTML = "";

  const data = loadUserKeys().filter(u => (
    u.role === "driver" || u.role === "teknisi"
  ));

  data.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.role}</td>
      <td>${user.key}</td>
      <td class="aksi-buttons">
        <button class="btn-delete">🗑 Hapus</button>
      </td>
    `;
    homeUserTableBody.appendChild(row);
  });

  recalcUserStats();
}

// hitung ulang statistik dashboard (jumlah driver/teknisi)
function recalcUserStats() {
  const data = loadUserKeys();
  let driverCount = 0;
  let teknisiCount = 0;

  data.forEach(u => {
    if (u.role === "driver") driverCount++;
    if (u.role === "teknisi") teknisiCount++;
  });

  if (driverCountEl)       driverCountEl.textContent = driverCount;
  if (techCountEl)         techCountEl.textContent   = teknisiCount;
  if (driverActivityValEl) driverActivityValEl.textContent = driverCount * 10; // dummy metric
  if (techActivityValEl)   techActivityValEl.textContent   = teknisiCount * 10; // dummy metric
}

// generate key otomatis driver/teknisi di panel HOME
if (homeGenKeyBtn && homeUserKey) {
  homeGenKeyBtn.addEventListener("click", () => {
    const roleVal = homeUserRole ? homeUserRole.value : "";
    const prefix = roleVal === "driver"
      ? "DRV"
      : roleVal === "teknisi"
      ? "TEK"
      : "KEY";
    const randomPart = Math.floor(10000 + Math.random() * 90000);
    homeUserKey.value = `${prefix}-${randomPart}`;
  });
}

// tambah user driver/teknisi dari panel HOME
if (homeAddUserBtn && homeUserName && homeUserRole && homeUserKey && homeUserTableBody) {
  homeAddUserBtn.addEventListener("click", () => {
    if (homeUserError) homeUserError.textContent = "";

    const usernameVal = homeUserName.value.trim();
    const roleVal     = homeUserRole.value.trim();
    const keyVal      = homeUserKey.value.trim();

    if (!usernameVal || !roleVal || !keyVal) {
      homeUserError.textContent = "Semua field wajib diisi.";
      return;
    }

    // ambil userKeys lama
    let data = loadUserKeys();

    // tambahkan user baru (driver / teknisi)
    data.push({
      username: usernameVal,
      role: roleVal,
      key: keyVal
    });

    // simpan balik
    saveUserKeys(data);

    // refresh tabel HOME & statistik
    renderHomeTableFromStorage();

    // reset form
    homeUserName.value = "";
    homeUserKey.value = "";

    alert("User berhasil ditambahkan!");
  });
}

// hapus user dari tabel HOME (khusus driver/teknisi)
if (homeUserTableBody) {
  homeUserTableBody.addEventListener("click", (e) => {
    if (!e.target.classList.contains("btn-delete")) return;

    const row = e.target.closest("tr");
    const uname = row.children[0].textContent.trim();

    const yakin = confirm("Hapus user ini?");
    if (!yakin) return;

    let data = loadUserKeys();
    data = data.filter(u => u.username !== uname);

    saveUserKeys(data);

    renderHomeTableFromStorage();

    alert("User dihapus.");
  });
}

// search filter di panel HOME
if (homeSearchInput && homeUserTableBody) {
  homeSearchInput.addEventListener("input", () => {
    const q = homeSearchInput.value.toLowerCase();
    const rows = homeUserTableBody.querySelectorAll("tr");
    rows.forEach(row => {
      const username = row.children[0]?.textContent.toLowerCase() || "";
      const role     = row.children[1]?.textContent.toLowerCase() || "";
      const key      = row.children[2]?.textContent.toLowerCase() || "";
      const match = (
        username.includes(q) ||
        role.includes(q) ||
        key.includes(q)
      );
      row.style.display = match ? "" : "none";
    });
  });
}



// =========================================================
// PANEL BUAT KEY (Full CRUD userKeys: admin / driver / teknisi)
// =========================================================

const generateKeyBtn = document.getElementById("generateKeyBtn");
const keyValueInput  = document.getElementById("keyValue");
const submitKeyBtn   = document.getElementById("submitKeyBtn");
const keyUsername    = document.getElementById("keyUsername");
const keyRole        = document.getElementById("keyRole");
const keyTableBody   = document.getElementById("keyTableBody");

let editingKeyRow = null; // baris mana yang sedang diedit (null = tambah baru)

// render tabel Buat Key dari localStorage
function renderKeyTableFromStorage() {
  if (!keyTableBody) return;
  keyTableBody.innerHTML = "";

  const all = loadUserKeys();
  all.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.role}</td>
      <td>${user.key}</td>
      <td class="aksi-buttons">
        <button class="btn-edit">✎ Edit</button>
        <button class="btn-delete">🗑 Hapus</button>
      </td>
    `;
    // simpan username lama untuk referensi update nanti
    row.dataset.usernameBefore = user.username;
    keyTableBody.appendChild(row);
  });
}

// tombol "Generate Key" acak (panel Buat Key)
if (generateKeyBtn && keyValueInput) {
  generateKeyBtn.addEventListener("click", () => {
    const randomKey = Math.floor(100000 + Math.random() * 900000);
    keyValueInput.value = randomKey;
  });
}

// klik tombol utama (Buat Key / Simpan Perubahan)
if (submitKeyBtn && keyUsername && keyRole && keyValueInput && keyTableBody) {
  submitKeyBtn.addEventListener("click", () => {
    const username = keyUsername.value.trim();
    const role     = keyRole.value.trim();
    const keyVal   = keyValueInput.value.trim();

    if (!username || !keyVal) {
      alert("Harap isi username dan key terlebih dahulu!");
      return;
    }

    let data = loadUserKeys();

    // MODE EDIT
    if (editingKeyRow) {
      // username lama sebelum diedit
      const oldUsername = editingKeyRow.dataset.usernameBefore;

      // update tampilan tabel
      editingKeyRow.children[0].textContent = username;
      editingKeyRow.children[1].textContent = role;
      editingKeyRow.children[2].textContent = keyVal;
      editingKeyRow.dataset.usernameBefore  = username;

      // update localStorage
      data = data.map(u => {
        if (u.username === oldUsername) {
          return {
            username,
            role,
            key: keyVal
          };
        }
        return u;
      });
      saveUserKeys(data);

      // reset state
      editingKeyRow = null;
      submitKeyBtn.textContent = "Buat Key";

      // reset form
      keyUsername.value = "";
      keyValueInput.value = "";

      // refresh panel HOME (supaya daftar driver/teknisi & statistik update)
      renderHomeTableFromStorage();

      alert("Key berhasil diubah!");
      return;
    }

    // MODE TAMBAH BARU
    // tambah row baru ke tabel tampilan
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${username}</td>
      <td>${role}</td>
      <td>${keyVal}</td>
      <td class="aksi-buttons">
        <button class="btn-edit">✎ Edit</button>
        <button class="btn-delete">🗑 Hapus</button>
      </td>
    `;
    newRow.dataset.usernameBefore = username;
    keyTableBody.appendChild(newRow);

    // push data baru ke localStorage
    data.push({
      username,
      role,
      key: keyVal
    });
    saveUserKeys(data);

    // kosongkan form
    keyUsername.value = "";
    keyValueInput.value = "";

    // refresh panel HOME juga
    renderHomeTableFromStorage();

    alert("Key berhasil ditambahkan!");
  });
}

// delegasi Edit / Hapus di tabel Buat Key
if (keyTableBody) {
  keyTableBody.addEventListener("click", (e) => {
    // HAPUS USER
    if (e.target.classList.contains("btn-delete")) {
      const row = e.target.closest("tr");
      const uname = row.children[0].textContent.trim();

      const yakin = confirm("Hapus key ini?");
      if (!yakin) return;

      // hapus dari tabel
      row.remove();

      // hapus dari localStorage
      let data = loadUserKeys();
      data = data.filter(u => u.username !== uname);
      saveUserKeys(data);

      // refresh panel HOME (karena jumlah user bisa berubah)
      renderHomeTableFromStorage();

      return;
    }

    // EDIT USER
    if (e.target.classList.contains("btn-edit")) {
      const row = e.target.closest("tr");
      const usernameCell = row.children[0];
      const roleCell     = row.children[1];
      const keyCell      = row.children[2];

      // isi form dengan nilai lama
      keyUsername.value   = usernameCell.textContent.trim();
      keyRole.value       = roleCell.textContent.trim();
      keyValueInput.value = keyCell.textContent.trim();

      // simpan state row yg lagi diedit
      editingKeyRow = row;

      // simpan username lama ke dataset supaya nanti bisa update di localStorage
      row.dataset.usernameBefore = usernameCell.textContent.trim();

      // ubah tombol submit jadi mode edit
      submitKeyBtn.textContent = "Simpan Perubahan";

      // scroll ke form
      keyUsername.scrollIntoView({ behavior: "smooth", block: "center" });

      return;
    }
  });
}


// =========================================================
// PANEL KENDARAAN
// - tambah / edit / hapus kendaraan
// - simpan di localStorage (vehiclesData)
// - validasi plat "B 1234 ASD"
// =========================================================

const vehicleBrandInput   = document.getElementById("vehicleBrand");
const vehiclePlateInput   = document.getElementById("vehiclePlate");
const addVehicleBtn       = document.getElementById("addVehicleBtn");
const vehicleTableBody    = document.getElementById("vehicleTableBody");
const vehicleError        = document.getElementById("vehicleError");

// regex format plat
const platePattern = /^[A-Z] [0-9]{4} [A-Z]{3}$/;

// baris kendaraan yang sedang diedit
let editingVehicleRow = null;

// render tabel kendaraan dari localStorage
function renderVehicleTableFromStorage() {
  if (!vehicleTableBody) return;
  vehicleTableBody.innerHTML = "";

  const fleet = loadVehicles();
  fleet.forEach(v => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${v.brand}</td>
      <td>${v.plate}</td>
      <td class="aksi-buttons">
        <button class="btn-edit">✎ Edit</button>
        <button class="btn-delete">🗑 Hapus</button>
      </td>
    `;
    // simpan plat lama (ID unik kita)
    row.dataset.plateBefore = v.plate;
    vehicleTableBody.appendChild(row);
  });
}

// klik tombol Tambah Kendaraan / Simpan Perubahan
if (addVehicleBtn && vehicleBrandInput && vehiclePlateInput && vehicleTableBody) {
  addVehicleBtn.addEventListener("click", () => {
    if (vehicleError) vehicleError.textContent = "";

    const brandVal = vehicleBrandInput.value.trim();
    const plateVal = vehiclePlateInput.value.trim().toUpperCase();

    if (!brandVal || !plateVal) {
      vehicleError.textContent = "Merek dan plat wajib diisi.";
      return;
    }

    if (!platePattern.test(plateVal)) {
      vehicleError.textContent = 'Format plat tidak valid. Contoh: "B 1234 ASD"';
      return;
    }

    let fleet = loadVehicles();

    // MODE EDIT kendaraan
    if (editingVehicleRow) {
      const oldPlate = editingVehicleRow.dataset.plateBefore;

      // update tampilan tabel
      editingVehicleRow.children[0].textContent = brandVal;
      editingVehicleRow.children[1].textContent = plateVal;
      editingVehicleRow.dataset.plateBefore = plateVal;

      // update array localStorage
      fleet = fleet.map(v => {
        if (v.plate === oldPlate) {
          return { brand: brandVal, plate: plateVal };
        }
        return v;
      });
      saveVehicles(fleet);

      // reset state
      editingVehicleRow = null;
      addVehicleBtn.textContent = "Tambah Kendaraan";

      vehicleBrandInput.value = "";
      vehiclePlateInput.value = "";

      alert("Data kendaraan berhasil diubah!");
      return;
    }

    // MODE TAMBAH BARU kendaraan
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${brandVal}</td>
      <td>${plateVal}</td>
      <td class="aksi-buttons">
        <button class="btn-edit">✎ Edit</button>
        <button class="btn-delete">🗑 Hapus</button>
      </td>
    `;
    newRow.dataset.plateBefore = plateVal;
    vehicleTableBody.appendChild(newRow);

    // simpan kendaraan baru ke localStorage
    fleet.push({
      brand: brandVal,
      plate: plateVal
    });
    saveVehicles(fleet);

    vehicleBrandInput.value = "";
    vehiclePlateInput.value = "";

    alert("Kendaraan berhasil ditambahkan!");
  });
}

// delegasi tombol Edit / Hapus kendaraan
if (vehicleTableBody) {
  vehicleTableBody.addEventListener("click", (e) => {
    // HAPUS kendaraan
    if (e.target.classList.contains("btn-delete")) {
      const row = e.target.closest("tr");
      const plate = row.children[1].textContent.trim();

      const yakin = confirm("Hapus kendaraan ini?");
      if (!yakin) return;

      // hapus secara visual
      row.remove();

      // hapus dari localStorage
      let fleet = loadVehicles();
      fleet = fleet.filter(v => v.plate !== plate);
      saveVehicles(fleet);

      return;
    }

    // EDIT kendaraan
    if (e.target.classList.contains("btn-edit")) {
      const row = e.target.closest("tr");
      const brandCell = row.children[0];
      const plateCell = row.children[1];

      vehicleBrandInput.value = brandCell.textContent.trim();
      vehiclePlateInput.value = plateCell.textContent.trim();

      editingVehicleRow = row;
      addVehicleBtn.textContent = "Simpan Perubahan";

      row.dataset.plateBefore = plateCell.textContent.trim();

      vehicleBrandInput.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
  });
}


// =========================================================
// INITIAL RENDER SAAT HALAMAN DIBUKA
// =========================================================

// Render tabel Buat Key dari localStorage
renderKeyTableFromStorage();

// Render tabel Kendaraan dari localStorage
renderVehicleTableFromStorage();

// Render tabel Driver/Teknisi di HOME dari localStorage
renderHomeTableFromStorage();

// Sync angka statistik di dashboard HOME
recalcUserStats();
