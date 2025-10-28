// ============================
// LOGOUT
// ============================
const logoutBtnDriver = document.getElementById("logoutBtnDriver");
if (logoutBtnDriver) {
  logoutBtnDriver.addEventListener("click", () => {
    // balikkan driver ke login-driver.html (ubah kalau nama file beda)
    window.location.href = "login-driver.html";
  });
}

// ============================
// STORAGE HELPERS
// ============================

// kendaraan yang ditambahkan admin
// format: [{ brand:"Toyota", plate:"B 1234 ASD" }, ...]
function loadVehicles() {
  const raw = localStorage.getItem("vehiclesData");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// laporan kerusakan dari driver
// format: [{ plate:"B 1234 ASD", brand:"Toyota", issue:"AC Rusak", note:"dll" }]
function loadDamageReports() {
  const raw = localStorage.getItem("damageReports");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveDamageReports(arr) {
  localStorage.setItem("damageReports", JSON.stringify(arr));
}

// ============================
// DOM ELEMENTS (FORM)
// ============================
const plateSearchInput = document.getElementById("plateSearchInput");
const searchPlateBtn   = document.getElementById("searchPlateBtn");

const brandInput       = document.getElementById("brandInput");
const issueInput       = document.getElementById("issueInput");
const noteInput        = document.getElementById("noteInput");

const driverError      = document.getElementById("driverError");

const addReportBtn     = document.getElementById("addReportBtn");

// ============================
// DOM ELEMENTS (TABLE)
// ============================
const reportTableBody     = document.getElementById("reportTableBody");
const searchReportInput   = document.getElementById("searchReportInput");

// Row yang sedang diedit (null = mode tambah biasa)
let editingReportIndex = null;


// ============================
// RENDER TABEL LAPORAN
// ============================
function renderReportTable() {
  if (!reportTableBody) return;
  reportTableBody.innerHTML = "";

  const list = loadDamageReports();
  list.forEach((rep, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${rep.brand}</td>
      <td>${rep.plate}</td>
      <td>${rep.issue}</td>
      <td>${rep.note}</td>
      <td class="aksi-buttons">
        <button class="row-btn-edit" data-idx="${idx}">Edit</button>
        <button class="row-btn-del" data-idx="${idx}">Hapus</button>
      </td>
    `;
    reportTableBody.appendChild(tr);
  });
}


// ============================
// CARI MEREK KENDARAAN DARI PLAT
// ============================
if (searchPlateBtn && plateSearchInput && brandInput) {
  searchPlateBtn.addEventListener("click", () => {
    if (driverError) driverError.textContent = "";

    const plateVal = plateSearchInput.value.trim().toUpperCase();
    if (!plateVal) {
      driverError.textContent = "Masukkan plat nomor dulu.";
      return;
    }

    // cari di vehiclesData
    const vehicles = loadVehicles();
    const found = vehicles.find(v => v.plate === plateVal);

    if (!found) {
      brandInput.value = "";
      driverError.textContent = "Kendaraan tidak ditemukan di data admin.";
      return;
    }

    // isi merek kendaraan otomatis
    brandInput.value = found.brand;
  });
}


// ============================
// TAMBAH / SIMPAN LAPORAN
// ============================
if (addReportBtn) {
  addReportBtn.addEventListener("click", () => {
    if (driverError) driverError.textContent = "";

    const plateVal = plateSearchInput.value.trim().toUpperCase();
    const brandVal = brandInput.value.trim();
    const issueVal = issueInput.value.trim();
    const noteVal  = noteInput.value.trim();

    if (!plateVal || !brandVal || !issueVal) {
      // brandVal harus ada (berarti kendaraan ditemukan)
      // issueVal harus ada (apa kendalanya)
      if (driverError) {
        driverError.textContent = "Plat, Merek, dan Kendala wajib diisi.";
      }
      return;
    }

    let reports = loadDamageReports();

    // MODE EDIT
    if (editingReportIndex !== null) {
      reports[editingReportIndex] = {
        plate: plateVal,
        brand: brandVal,
        issue: issueVal,
        note: noteVal
      };

      saveDamageReports(reports);

      editingReportIndex = null;
      addReportBtn.textContent = "Tambah Laporan";

      plateSearchInput.value = "";
      brandInput.value = "";
      issueInput.value = "";
      noteInput.value = "";

      renderReportTable();
      alert("Laporan berhasil di-update!");
      return;
    }

    // MODE TAMBAH BARU
    reports.push({
        plate: plateVal,
        brand: brandVal,
        issue: issueVal,
        note: noteVal
    });
    saveDamageReports(reports);

    plateSearchInput.value = "";
    brandInput.value = "";
    issueInput.value = "";
    noteInput.value = "";

    renderReportTable();
    alert("Laporan berhasil ditambahkan!");
  });
}


// ============================
// EDIT / HAPUS LAPORAN (delegasi event di tabel)
// ============================
if (reportTableBody) {
  reportTableBody.addEventListener("click", (e) => {
    const target = e.target;

    // HAPUS
    if (target.classList.contains("row-btn-del")) {
      const idx = parseInt(target.dataset.idx, 10);
      const yakin = confirm("Hapus laporan ini?");
      if (!yakin) return;

      let reports = loadDamageReports();
      reports.splice(idx, 1);
      saveDamageReports(reports);

      renderReportTable();
      return;
    }

    // EDIT
    if (target.classList.contains("row-btn-edit")) {
      const idx = parseInt(target.dataset.idx, 10);
      const reports = loadDamageReports();
      const rep = reports[idx];
      if (!rep) return;

      // isi form dengan data lama
      plateSearchInput.value = rep.plate;
      brandInput.value       = rep.brand;
      issueInput.value       = rep.issue;
      noteInput.value        = rep.note;

      editingReportIndex = idx;
      addReportBtn.textContent = "Simpan Perubahan";

      plateSearchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}


// ============================
// SEARCH / FILTER TABEL LAPORAN
// ============================
if (searchReportInput && reportTableBody) {
  searchReportInput.addEventListener("input", () => {
    const q = searchReportInput.value.toLowerCase();
    const rows = reportTableBody.querySelectorAll("tr");
    rows.forEach(row => {
      const brand  = row.children[0]?.textContent.toLowerCase() || "";
      const plate  = row.children[1]?.textContent.toLowerCase() || "";
      const issue  = row.children[2]?.textContent.toLowerCase() || "";
      const note   = row.children[3]?.textContent.toLowerCase() || "";
      const match = (
        brand.includes(q) ||
        plate.includes(q) ||
        issue.includes(q) ||
        note.includes(q)
      );
      row.style.display = match ? "" : "none";
    });
  });
}


// ============================
// INISIALISASI SAAT HALAMAN DIBUKA
// ============================
renderReportTable();