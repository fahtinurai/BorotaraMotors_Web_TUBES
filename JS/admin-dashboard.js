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
// TAB NAVIGATION
// ==============================
const menuLinks = document.querySelectorAll(".admin-menu-link");
const panels = document.querySelectorAll(".admin-section-panel");

menuLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const targetPanelId = link.getAttribute("data-panel");
    if (!targetPanelId) return;

    menuLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    panels.forEach(panel => {
      if (panel.id === targetPanelId) {
        panel.classList.add("active-panel");
      } else {
        panel.classList.remove("active-panel");
      }
    });

    const mainEl = document.querySelector(".admin-main") || document.scrollingElement;
    if (mainEl) {
      mainEl.scrollTop = 0;
    }

    if (targetPanelId === "panel-assign") {
      renderAssignFormOptions();
      renderAssignTable();
    }
    if (targetPanelId === "panel-followup") {
      renderFollowUpTable();
    }
  });
});

// tombol cepat di kartu "Perlu Perbaikan"
const gotoFollowUpBtn = document.getElementById("gotoFollowUpBtn");
if (gotoFollowUpBtn) {
  gotoFollowUpBtn.addEventListener("click", () => {
    const followLink = Array.from(menuLinks).find(l => l.getAttribute("data-panel") === "panel-followup");
    if (followLink) {
      followLink.click();
    }
  });
}

// ==============================
// STORAGE HELPERS
// ==============================
function loadUserKeys() {
  const raw = localStorage.getItem("userKeys");
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}
function saveUserKeys(arr) {
  localStorage.setItem("userKeys", JSON.stringify(arr));
}

function loadVehicles() {
  const raw = localStorage.getItem("vehiclesData");
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}
function saveVehicles(arr) {
  localStorage.setItem("vehiclesData", JSON.stringify(arr));
}

function loadDriverVehicles() {
  const raw = localStorage.getItem("driverVehicles");
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}
function saveDriverVehicles(arr) {
  localStorage.setItem("driverVehicles", JSON.stringify(arr));
}

// NEW: tiket perbaikan global (driver -> teknisi -> admin)
function loadRepairQueue() {
  const raw = localStorage.getItem("repairQueue");
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

// ==============================
// PANEL HOME
// ==============================
const homeUserName      = document.getElementById("homeUserName");
const homeUserRole      = document.getElementById("homeUserRole");
const homeUserKey       = document.getElementById("homeUserKey");
const homeGenKeyBtn     = document.getElementById("homeGenKeyBtn");
const homeAddUserBtn    = document.getElementById("homeAddUserBtn");
const homeUserError     = document.getElementById("homeUserError");

const homeUserTableBody = document.getElementById("homeUserTableBody");
const homeSearchInput   = document.getElementById("homeSearchInput");

const driverCountEl       = document.getElementById("driverCount");
const techCountEl         = document.getElementById("techCount");
const driverActivityValEl = document.getElementById("driverActivityVal");
const techActivityValEl   = document.getElementById("techActivityVal");

// kartu Home "Perlu Perbaikan"
const followUpCountHomeEl = document.getElementById("followUpCountHome");

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
  if (driverActivityValEl) driverActivityValEl.textContent = driverCount * 10;
  if (techActivityValEl)   techActivityValEl.textContent   = teknisiCount * 10;

  updateFollowUpStatsOnHome();
}

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

if (homeGenKeyBtn && homeUserKey) {
  homeGenKeyBtn.addEventListener("click", () => {
    const roleVal = homeUserRole ? homeUserRole.value.toLowerCase() : "";
    const prefix = roleVal === "driver"
      ? "DRV"
      : roleVal === "teknisi"
      ? "TEK"
      : "KEY";
    const randomPart = Math.floor(10000 + Math.random() * 90000);
    homeUserKey.value = ${prefix}-${randomPart};
  });
}

if (homeAddUserBtn && homeUserName && homeUserRole && homeUserKey) {
  homeAddUserBtn.addEventListener("click", () => {
    if (homeUserError) homeUserError.textContent = "";

    const usernameVal = homeUserName.value.trim();
    const roleVal     = homeUserRole.value.trim().toLowerCase();
    const keyVal      = homeUserKey.value.trim();

    if (!usernameVal || !roleVal || !keyVal) {
      homeUserError.textContent = "Semua field wajib diisi.";
      return;
    }

    let data = loadUserKeys();
    data.push({
      username: usernameVal,
      role: roleVal,
      key: keyVal
    });
    saveUserKeys(data);

    renderHomeTableFromStorage();

    homeUserName.value = "";
    homeUserKey.value  = "";

    alert("User berhasil ditambahkan!");
  });
}

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

// ==============================
// PANEL BUAT KEY (CRUD USERS)
// ==============================
const generateKeyBtn = document.getElementById("generateKeyBtn");
const keyValueInput  = document.getElementById("keyValue");
const submitKeyBtn   = document.getElementById("submitKeyBtn");
const keyUsername    = document.getElementById("keyUsername");
const keyRole        = document.getElementById("keyRole");
const keyTableBody   = document.getElementById("keyTableBody");

let editingKeyRow = null;

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
    row.dataset.usernameBefore = user.username;
    keyTableBody.appendChild(row);
  });
}

if (generateKeyBtn && keyValueInput) {
  generateKeyBtn.addEventListener("click", () => {
    const randomKey = Math.floor(100000 + Math.random() * 900000);
    keyValueInput.value = randomKey;
  });
}

if (submitKeyBtn && keyUsername && keyRole && keyValueInput) {
  submitKeyBtn.addEventListener("click", () => {
    const username = keyUsername.value.trim();
    const role     = keyRole.value.trim().toLowerCase();
    const keyVal   = keyValueInput.value.trim();

    if (!username || !keyVal) {
      alert("Harap isi username dan key terlebih dahulu!");
      return;
    }

    let data = loadUserKeys();

    if (editingKeyRow) {
      const oldUsername = editingKeyRow.dataset.usernameBefore;

      editingKeyRow.children[0].textContent = username;
      editingKeyRow.children[1].textContent = role;
      editingKeyRow.children[2].textContent = keyVal;
      editingKeyRow.dataset.usernameBefore  = username;

      data = data.map(u => {
        if (u.username === oldUsername) {
          return { username, role, key: keyVal };
        }
        return u;
      });
      saveUserKeys(data);

      editingKeyRow = null;
      submitKeyBtn.textContent = "Buat Key";

      keyUsername.value   = "";
      keyValueInput.value = "";

      renderHomeTableFromStorage();
      alert("Key berhasil diubah!");
      return;
    }

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

    data.push({ username, role, key: keyVal });
    saveUserKeys(data);

    keyUsername.value   = "";
    keyValueInput.value = "";

    renderHomeTableFromStorage();
    alert("Key berhasil ditambahkan!");
  });
}

if (keyTableBody) {
  keyTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const row = e.target.closest("tr");
      const uname = row.children[0].textContent.trim();

      const yakin = confirm("Hapus key ini?");
      if (!yakin) return;

      row.remove();

      let data = loadUserKeys();
      data = data.filter(u => u.username !== uname);
      saveUserKeys(data);

      renderHomeTableFromStorage();
      recalcUserStats();
      return;
    }

    if (e.target.classList.contains("btn-edit")) {
      const row = e.target.closest("tr");
      const usernameCell = row.children[0];
      const roleCell     = row.children[1];
      const keyCell      = row.children[2];

      keyUsername.value   = usernameCell.textContent.trim();
      keyRole.value       = roleCell.textContent.trim().toLowerCase();
      keyValueInput.value = keyCell.textContent.trim();

      editingKeyRow = row;
      row.dataset.usernameBefore = usernameCell.textContent.trim();

      submitKeyBtn.textContent = "Simpan Perubahan";

      keyUsername.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
  });
}

// ==============================
// PANEL KENDARAAN
// ==============================
const vehicleBrandInput   = document.getElementById("vehicleBrand");
const vehiclePlateInput   = document.getElementById("vehiclePlate");
const addVehicleBtn       = document.getElementById("addVehicleBtn");
const vehicleTableBody    = document.getElementById("vehicleTableBody");
const vehicleError        = document.getElementById("vehicleError");

const platePattern = /^[A-Z] [0-9]{4} [A-Z]{3}$/;
let editingVehicleRow = null;

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
    row.dataset.plateBefore = v.plate;
    vehicleTableBody.appendChild(row);
  });
}

if (addVehicleBtn && vehicleBrandInput && vehiclePlateInput) {
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

    const isDuplicatePlate = fleet.some(v => {
      if (editingVehicleRow && v.plate === editingVehicleRow.dataset.plateBefore) {
        return false;
      }
      return v.plate.toUpperCase() === plateVal;
    });

    if (isDuplicatePlate) {
      vehicleError.textContent = "Plat ini sudah terdaftar pada kendaraan lain.";
      return;
    }

    if (editingVehicleRow) {
      const oldPlate = editingVehicleRow.dataset.plateBefore;

      editingVehicleRow.children[0].textContent = brandVal;
      editingVehicleRow.children[1].textContent = plateVal;
      editingVehicleRow.dataset.plateBefore = plateVal;

      fleet = fleet.map(v => {
        if (v.plate === oldPlate) {
          return { brand: brandVal, plate: plateVal };
        }
        return v;
      });
      saveVehicles(fleet);

      editingVehicleRow = null;
      addVehicleBtn.textContent = "Tambah Kendaraan";

      vehicleBrandInput.value = "";
      vehiclePlateInput.value = "";

      alert("Data kendaraan berhasil diubah!");
      return;
    }

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

if (vehicleTableBody) {
  vehicleTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      const row = e.target.closest("tr");
      const plate = row.children[1].textContent.trim();

      const yakin = confirm("Hapus kendaraan ini?");
      if (!yakin) return;

      row.remove();

      let fleet = loadVehicles();
      fleet = fleet.filter(v => v.plate !== plate);
      saveVehicles(fleet);
      return;
    }

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

// ==============================
// PANEL ASSIGN KENDARAAN KE DRIVER
// ==============================
const assignDriverSelect  = document.getElementById("assignDriverSelect");
const assignVehicleSelect = document.getElementById("assignVehicleSelect");
const assignBtn           = document.getElementById("assignBtn");
const assignError         = document.getElementById("assignError");
const assignTableBody     = document.getElementById("assignTableBody");

function renderAssignFormOptions() {
  if (!assignDriverSelect || !assignVehicleSelect) return;

  const allUsers = loadUserKeys().filter(u =>
    u.role && u.role.toLowerCase() === "driver"
  );
  assignDriverSelect.innerHTML = "";
  allUsers.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.username;
    opt.textContent = u.username;
    assignDriverSelect.appendChild(opt);
  });

  const allVehicles = loadVehicles();
  assignVehicleSelect.innerHTML = "";
  allVehicles.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v.plate;
    opt.textContent = ${v.plate} • ${v.brand};
    assignVehicleSelect.appendChild(opt);
  });
}

function renderAssignTable() {
  if (!assignTableBody) return;
  assignTableBody.innerHTML = "";

  const data = loadDriverVehicles();
  data.forEach(dv => {
    (dv.vehicles || []).forEach(v => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${dv.username}</td>
        <td>${v.plate}</td>
        <td>${v.brand}</td>
        <td class="aksi-buttons">
          <button class="btn-delete" data-user="${dv.username}" data-plate="${v.plate}">🗑 Hapus</button>
        </td>
      `;
      assignTableBody.appendChild(tr);
    });
  });
}

function handleAssignVehicle() {
  if (!assignDriverSelect || !assignVehicleSelect || !assignError) return;

  const username = assignDriverSelect.value.trim();
  const plate    = assignVehicleSelect.value.trim();

  if (!username || !plate) {
    assignError.textContent = "Pilih driver dan kendaraan.";
    return;
  }

  const allVehicles = loadVehicles();
  const kendaraan = allVehicles.find(v => v.plate === plate);
  if (!kendaraan) {
    assignError.textContent = "Data kendaraan tidak ditemukan.";
    return;
  }

  let data = loadDriverVehicles();

  let entry = data.find(dv =>
    dv.username.toLowerCase() === username.toLowerCase()
  );
  if (!entry) {
    entry = {
      username: username,
      vehicles: []
    };
    data.push(entry);
  }

  const already = entry.vehicles.some(v => v.plate === plate);
  if (already) {
    assignError.textContent = "Kendaraan ini sudah diassign ke driver tersebut.";
    return;
  }

  entry.vehicles.push({
    plate: kendaraan.plate,
    brand: kendaraan.brand
  });

  saveDriverVehicles(data);

  assignError.textContent = "";
  renderAssignTable();
  alert("Kendaraan berhasil diassign!");
}

if (assignBtn) {
  assignBtn.addEventListener("click", handleAssignVehicle);
}

if (assignTableBody) {
  assignTableBody.addEventListener("click", (e) => {
    if (!e.target.classList.contains("btn-delete")) return;

    const userFor  = e.target.getAttribute("data-user");
    const plateFor = e.target.getAttribute("data-plate");

    const yakin = confirm(Hapus assign ${plateFor} dari ${userFor}?);
    if (!yakin) return;

    let data = loadDriverVehicles();
    const entry = data.find(dv =>
      dv.username.toLowerCase() === userFor.toLowerCase()
    );
    if (entry) {
      entry.vehicles = entry.vehicles.filter(v => v.plate !== plateFor);
    }
    saveDriverVehicles(data);
    renderAssignTable();
  });
}

// ==============================
// PANEL FOLLOW UP TEKNISI
// ==============================
const followTableBody   = document.getElementById("followTableBody");
const followSearchInput = document.getElementById("followSearchInput");

function formatDateTime(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  const pad = n => (n < 10 ? "0"+n : n);

  const yyyy = d.getFullYear();
  const mm   = pad(d.getMonth()+1);
  const dd   = pad(d.getDate());
  const hh   = pad(d.getHours());
  const mi   = pad(d.getMinutes());

  return ${yyyy}-${mm}-${dd} ${hh}:${mi};
}

// tabel tiket yg statusTeknisi === "butuh_follow_up"
function renderFollowUpTable() {
  if (!followTableBody) return;

  followTableBody.innerHTML = "";

  const queue = loadRepairQueue();
  const needs = queue.filter(item => item.statusTeknisi === "butuh_follow_up");

  needs.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.id || "-"}</td>
      <td>${item.plate || "-"}</td>
      <td>${item.brand || "-"}</td>
      <td>${item.issue || "-"}</td>
      <td>${item.driverUsername || "-"}</td>
      <td>${item.driverExtraNeeds || item.note || "-"}</td>
      <td>${item.techNote || "-"}</td>
      <td>${formatDateTime(item.lastUpdate)}</td>
    `;
    followTableBody.appendChild(tr);
  });

  updateFollowUpStatsOnHome();
}

// live filter panel followup
if (followSearchInput && followTableBody) {
  followSearchInput.addEventListener("input", () => {
    const q = followSearchInput.value.toLowerCase();
    const rows = followTableBody.querySelectorAll("tr");

    rows.forEach(row => {
      const idVal      = row.children[0]?.textContent.toLowerCase() || "";
      const plateVal   = row.children[1]?.textContent.toLowerCase() || "";
      const brandVal   = row.children[2]?.textContent.toLowerCase() || "";
      const issueVal   = row.children[3]?.textContent.toLowerCase() || "";
      const driverVal  = row.children[4]?.textContent.toLowerCase() || "";
      const needVal    = row.children[5]?.textContent.toLowerCase() || "";
      const techVal    = row.children[6]?.textContent.toLowerCase() || "";
      const updVal     = row.children[7]?.textContent.toLowerCase() || "";

      const match = (
        idVal.includes(q)     ||
        plateVal.includes(q)  ||
        brandVal.includes(q)  ||
        issueVal.includes(q)  ||
        driverVal.includes(q) ||
        needVal.includes(q)   ||
        techVal.includes(q)   ||
        updVal.includes(q)
      );

      row.style.display = match ? "" : "none";
    });
  });
}

// update kartu "Perlu Perbaikan" di Home
function updateFollowUpStatsOnHome() {
  const queue = loadRepairQueue();
  const needsLen = queue.filter(item => item.statusTeknisi === "butuh_follow_up").length;
  if (followUpCountHomeEl) {
    followUpCountHomeEl.textContent = needsLen;
  }
}

// ==============================
// INIT PAGE LOAD
// ==============================
renderKeyTableFromStorage();
renderVehicleTableFromStorage();
renderHomeTableFromStorage();
recalcUserStats();
renderAssignFormOptions();
renderAssignTable();
renderFollowUpTable(); // supaya kartu Home langsung akurat saat load