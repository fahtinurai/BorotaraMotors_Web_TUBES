// ============================
// NAVBAR DRIVER BURGER (responsive)
// ============================
const driverBurger = document.getElementById("driverBurger");
const driverNavCenter = document.querySelector(".driver-nav-center");

if (driverBurger && driverNavCenter) {
  driverBurger.addEventListener("click", () => {
    driverNavCenter.classList.toggle("show");
  });
}

// ============================
// LOGOUT DRIVER
// ============================
const logoutBtnDriver = document.getElementById("logoutBtnDriver");
if (logoutBtnDriver) {
  logoutBtnDriver.addEventListener("click", () => {
    localStorage.removeItem("activeDriver");
    localStorage.removeItem("activeDriverVehicles");
    window.location.href = "login-driver.html";
  });
}

// ============================
// TAB NAVIGATION (Home / Laporan Kerusakan)
// ============================
const menuLinks = document.querySelectorAll(".driver-menu-link");
const panels = document.querySelectorAll(".driver-section-panel");
const quickActionButtons = document.querySelectorAll("[data-open-panel]");

function activatePanel(panelId) {
  menuLinks.forEach(l => {
    const p = l.getAttribute("data-panel");
    if (p === panelId) {
      l.classList.add("active");
    } else {
      l.classList.remove("active");
    }
  });

  panels.forEach(panel => {
    if (panel.id === panelId) {
      panel.classList.add("active-panel");
    } else {
      panel.classList.remove("active-panel");
    }
  });

  const mainEl = document.querySelector(".driver-main");
  if (mainEl) {
    mainEl.scrollTo({ top: 0, behavior: "smooth" });
  }
}

menuLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetPanelId = link.getAttribute("data-panel");
    if (!targetPanelId) return;
    activatePanel(targetPanelId);
  });
});

quickActionButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetPanelId = btn.getAttribute("data-open-panel");
    if (!targetPanelId) return;
    activatePanel(targetPanelId);
  });
});

// ============================
// STORAGE HELPERS
// ============================

// Laporan kerusakan milik semua driver
// format elemen: { plate, brand, issue, note, ts, driverUsername }
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

// Session driver aktif
// format: { username:"...", key:"...", role:"driver" }
function loadActiveDriver() {
  const raw = localStorage.getItem("activeDriver");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Kendaraan yang diassign ke driver aktif
// format: [ { plate:"B 1933 SAO", brand:"Avanza" }, ... ]
function loadActiveDriverVehicles() {
  const raw = localStorage.getItem("activeDriverVehicles");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ===== NEW: antrian buat teknisi & admin =====
// repairQueue dipakai teknisi-dashboard & admin-dashboard
// format item:
// {
//   id: "RQ-<timestamp>",
//   plate,
//   brand,
//   issue,
//   note,
//   driverUsername,
//   driverExtraNeeds,
//   techNote,
//   statusTeknisi,      // "menunggu" | "proses" | "selesai" | "butuh_follow_up"
//   lastUpdate
// }
function loadRepairQueue() {
  const raw = localStorage.getItem("repairQueue");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function saveRepairQueue(arr) {
  localStorage.setItem("repairQueue", JSON.stringify(arr));
}

// Driver "nembak" / update tiket ke repairQueue.
// Kalau tiket plat+issue+driver sama sudah ada -> update note/kebutuhan.
// Kalau belum ada -> buat baru statusTeknisi="menunggu".
function upsertRepairQueueFromDriver({
  plate,
  brand,
  issue,
  note,
  driverUsername,
  driverExtraNeeds
}) {
  let q = loadRepairQueue();

  let found = q.find(item =>
    item.plate === plate &&
    item.issue === issue &&
    item.driverUsername === driverUsername
  );

  if (!found) {
    const newId = "RQ-" + Date.now();
    found = {
      id: newId,
      plate,
      brand,
      issue,
      note,
      driverUsername,
      driverExtraNeeds: driverExtraNeeds || "",
      techNote: "",
      statusTeknisi: "menunggu",
      lastUpdate: new Date().toISOString()
    };
    q.push(found);
  } else {
    // update isi dari driver
    found.note = note;
    if (driverExtraNeeds && driverExtraNeeds.trim() !== "") {
      found.driverExtraNeeds = driverExtraNeeds;
    }
    found.lastUpdate = new Date().toISOString();
  }

  saveRepairQueue(q);
}

// helper buat normalisasi plat
function normalizePlate(p) {
  return p.replace(/\s+/g, " ").trim().toUpperCase();
}

// ============================
// DOM ELEMENTS (FORM)
// ============================
const plateSearchInput = document.getElementById("plateSearchInput");
const searchPlateBtn   = document.getElementById("searchPlateBtn");

const brandInput       = document.getElementById("brandInput");
const issueInput       = document.getElementById("issueInput");
const noteInput        = document.getElementById("noteInput");

// OPTIONAL (kalau kamu punya input kebutuhan ekstra driver seperti 'butuh sparepart apa')
// kalau belum ada di HTML-mu, ini bisa stay null aman.
const extraNeedsInput  = document.getElementById("extraNeedsInput");

const driverError      = document.getElementById("driverError");
const addReportBtn     = document.getElementById("addReportBtn");

// ============================
// DOM ELEMENTS (TABLE)
// ============================
const reportTableBody     = document.getElementById("reportTableBody");
const searchReportInput   = document.getElementById("searchReportInput");

// ============================
// DOM ELEMENTS (GREETING / TOP BAR)
// ============================
const greetingEl      = document.getElementById("driverGreeting");
const keyEl           = document.getElementById("driverKeyDisplay");
const nameTopEl       = document.getElementById("driverNameTop");
const keyTopEl        = document.getElementById("driverKeyTop");
const avatarEl        = document.getElementById("driverAvatar");

// STAT
const statTotalBulanEl = document.getElementById("statTotalBulan");
const statTotalSemuaEl = document.getElementById("statTotalSemua");

// NOTIF DOT
const notifDotEl = document.getElementById("notifDot");

// Row yang sedang diedit
let editingReportIndex = null;

// ============================
// GREETING
// ============================
function getGreetingMessageByHour() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 19) return "Selamat Sore";
  return "Selamat Malam";
}

function renderDriverGreeting() {
  const activeDriver = loadActiveDriver();

  if (!activeDriver) {
    if (greetingEl) greetingEl.textContent = "Selamat Datang, Driver!";
    if (keyEl)      keyEl.textContent      = "Key Anda: -";
    if (nameTopEl)  nameTopEl.textContent  = "Driver";
    if (keyTopEl)   keyTopEl.textContent   = "Key: -";
    if (avatarEl)   avatarEl.textContent   = "DR";
    return;
  }

  const greet = getGreetingMessageByHour();
  const username = activeDriver.username || "Driver";
  const driverKey = activeDriver.key || "-";

  if (greetingEl) greetingEl.textContent = `${greet}, ${username}!`;
  if (keyEl)      keyEl.textContent      = `Key Anda: ${driverKey}`;
  if (nameTopEl)  nameTopEl.textContent  = username;
  if (keyTopEl)   keyTopEl.textContent   = `Key: ${driverKey}`;

  if (avatarEl) {
    const initials = username
      .trim()
      .split(" ")
      .map(part => part[0] || "")
      .join("")
      .substring(0,2)
      .toUpperCase();
    avatarEl.textContent = initials || "DR";
  }
}

// ============================
// RENDER TABEL LAPORAN (khusus driver aktif)
// ============================
function renderReportTable() {
  if (!reportTableBody) return;
  reportTableBody.innerHTML = "";

  const activeDriver = loadActiveDriver();
  const currentDriverName = activeDriver ? activeDriver.username : null;

  const allReports = loadDamageReports();
  const list = currentDriverName
    ? allReports.filter(r => r.driverUsername === currentDriverName)
    : allReports;

  // ambil daftar tiket teknisi
  const queue = loadRepairQueue(); // <-- pakai helper yang sudah kita buat di driver-dashboard.js

list.forEach((rep, idx) => {
  const match = queue.find(t =>
    t.driverUsername === rep.driverUsername &&
    t.plate === rep.plate &&
    t.issue === rep.issue
  );

  let statusRaw   = match ? match.statusTeknisi : null;
  let statusLabel = match
    ? formatStatusForDriver(match.statusTeknisi)
    : "Menunggu teknisi";

  // kalau selesai baru, tandai row
  let isFreshDone = false;
  if (match && match.statusTeknisi === "selesai" && match.lastUpdate) {
    const updatedAt = new Date(match.lastUpdate);
    const now = new Date();
    const diffMs = now - updatedAt;
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (diffMs < oneDayMs) {
      isFreshDone = true;
      // tambahkan badge kecil ke status
      statusLabel = `Selesai ✅ <span class="status-badge-finished">Baru</span>`;
    }
  }

  const techNote = match && match.techNote
    ? match.techNote
    : "-";

  const tr = document.createElement("tr");

  // apply highlight kalau baru selesai
  if (isFreshDone) {
    tr.classList.add("report-row-done-recent");
  }

  tr.innerHTML = `
    <td>${rep.brand || "-"}</td>
    <td>${rep.plate || "-"}</td>
    <td>${rep.issue || "-"}</td>
    <td>${rep.note || "-"}</td>
    <td>${statusLabel}</td>
    <td>${techNote}</td>
    <td class="aksi-buttons">
      <button class="row-btn-edit" data-idx="${idx}">Edit</button>
      <button class="row-btn-del" data-idx="${idx}">Hapus</button>
    </td>
  `;
  reportTableBody.appendChild(tr);
});
  updateStats(list);
}
// ============================
// UPDATE STAT
// ============================
function updateStats(list) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const totalSemua = list.length;
  const totalBulanIni = list.filter(rep => {
    if (!rep.ts) return false;
    const d = new Date(rep.ts);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  if (statTotalSemuaEl) statTotalSemuaEl.textContent = totalSemua.toString();
  if (statTotalBulanEl) statTotalBulanEl.textContent = totalBulanIni.toString();

  const oneDayMs = 24 * 60 * 60 * 1000;
  const recently = list.some(rep => {
    if (!rep.ts) return false;
    return now - new Date(rep.ts) < oneDayMs;
  });
  if (notifDotEl) {
    notifDotEl.style.display = recently ? "block" : "none";
  }
}

// ============================
// CARI MEREK DARI PLAT (hanya kendaraan driver ini)
// ============================
if (searchPlateBtn && plateSearchInput && brandInput) {
  searchPlateBtn.addEventListener("click", () => {
    if (driverError) driverError.textContent = "";

    const plateValRaw = plateSearchInput.value;
    const plateValNorm = normalizePlate(plateValRaw);

    if (!plateValNorm) {
      driverError.textContent = "Masukkan plat nomor dulu.";
      return;
    }

    const vehicles = loadActiveDriverVehicles();
    const found = vehicles.find(v => normalizePlate(v.plate) === plateValNorm);

    if (!found) {
      brandInput.value = "";
      driverError.textContent = "Kendaraan tidak ditemukan / bukan kendaraan Anda.";
      return;
    }

    brandInput.value = found.brand;
    driverError.textContent = "";
  });
}

// ============================
// TAMBAH / EDIT LAPORAN
// ============================
if (addReportBtn) {
  addReportBtn.addEventListener("click", () => {
    if (driverError) driverError.textContent = "";

    const plateValRaw = plateSearchInput.value;
    const plateValNorm = normalizePlate(plateValRaw);
    const brandVal = brandInput.value.trim();
    const issueVal = issueInput.value.trim();
    const noteVal  = noteInput.value.trim();
    const extraNeedsVal = extraNeedsInput ? extraNeedsInput.value.trim() : "";

    const activeDriver = loadActiveDriver();
    const currentDriverName = activeDriver ? activeDriver.username : null;

    if (!plateValNorm || !brandVal || !issueVal) {
      if (driverError) {
        driverError.textContent = "Plat, Merek, dan Kendala wajib diisi.";
      }
      return;
    }

    // Pastikan kendaraan memang milik driver ini
    const allowedVehicles = loadActiveDriverVehicles();
    const allowed = allowedVehicles.some(v => normalizePlate(v.plate) === plateValNorm);
    if (!allowed) {
      if (driverError) {
        driverError.textContent = "Anda tidak terdaftar untuk plat tersebut.";
      }
      return;
    }

    let reports = loadDamageReports();

    // MODE EDIT
    if (editingReportIndex !== null) {
      reports[editingReportIndex] = {
        plate: plateValNorm,
        brand: brandVal,
        issue: issueVal,
        note: noteVal,
        ts: new Date().toISOString(),
        driverUsername: currentDriverName || "-"
      };

      saveDamageReports(reports);

      // sinkronkan juga ke repairQueue
      upsertRepairQueueFromDriver({
        plate: plateValNorm,
        brand: brandVal,
        issue: issueVal,
        note: noteVal,
        driverUsername: currentDriverName || "-",
        driverExtraNeeds: extraNeedsVal
      });

      editingReportIndex = null;
      addReportBtn.textContent = "Tambah Laporan";

      plateSearchInput.value = "";
      brandInput.value = "";
      issueInput.value = "";
      noteInput.value = "";
      if (extraNeedsInput) extraNeedsInput.value = "";

      renderReportTable();
      alert("Laporan berhasil di-update!");
      return;
    }

    // MODE TAMBAH BARU
    reports.push({
      plate: plateValNorm,
      brand: brandVal,
      issue: issueVal,
      note: noteVal,
      ts: new Date().toISOString(),
      driverUsername: currentDriverName || "-"
    });
    saveDamageReports(reports);

    // sinkronkan ke repairQueue untuk teknisi/admin
    upsertRepairQueueFromDriver({
      plate: plateValNorm,
      brand: brandVal,
      issue: issueVal,
      note: noteVal,
      driverUsername: currentDriverName || "-",
      driverExtraNeeds: extraNeedsVal
    });

    plateSearchInput.value = "";
    brandInput.value = "";
    issueInput.value = "";
    noteInput.value = "";
    if (extraNeedsInput) extraNeedsInput.value = "";

    renderReportTable();
    alert("Laporan berhasil ditambahkan!");
  });
}

// ============================
// EDIT / HAPUS LAPORAN
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
      const activeDriver = loadActiveDriver();
      const currentDriverName = activeDriver ? activeDriver.username : null;
      const filtered = reports.filter(r => r.driverUsername === currentDriverName);
      const rowToDelete = filtered[idx];

      if (!rowToDelete) return;
      reports = reports.filter(r => r !== rowToDelete);
      saveDamageReports(reports);

      // NOTE: kita tidak otomatis hapus dari repairQueue di sini.
      // Karena kalau laporan udah dikirim ke teknisi, biasanya tetap dicatat historinya.

      renderReportTable();
      return;
    }

    // EDIT
    if (target.classList.contains("row-btn-edit")) {
      const idx = parseInt(target.dataset.idx, 10);

      const activeDriver = loadActiveDriver();
      const currentDriverName = activeDriver ? activeDriver.username : null;
      const allReports = loadDamageReports();
      const filtered = allReports.filter(r => r.driverUsername === currentDriverName);
      const rep = filtered[idx];
      if (!rep) return;

      plateSearchInput.value = rep.plate || "";
      brandInput.value       = rep.brand || "";
      issueInput.value       = rep.issue || "";
      noteInput.value        = rep.note  || "";
      if (extraNeedsInput)   extraNeedsInput.value = ""; // kita gak nyimpen extraNeeds di damageReports, hanya di repairQueue

      editingReportIndex = allReports.indexOf(rep);
      addReportBtn.textContent = "Simpan Perubahan";

      activatePanel("panel-form");

      plateSearchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

// ============================
// SEARCH / FILTER TABEL DI UI
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

function formatStatusForDriver(status) {
  if (!status) return "Menunggu teknisi";
  switch (status) {
    case "menunggu":         return "Menunggu teknisi";
    case "proses":           return "Sedang diperbaiki";
    case "selesai":          return "Selesai ✅";
    case "butuh_follow_up":  return "Butuh approval admin";
    default:                 return status;
  }
}


// ============================
// INIT
// ============================
renderDriverGreeting();
renderReportTable();