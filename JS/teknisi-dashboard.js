// =========================
// RESPONSIVE NAV
// =========================
const techBurger = document.getElementById("techBurger");
const techNavCenter = document.querySelector(".tech-nav-center");

if (techBurger && techNavCenter) {
  techBurger.addEventListener("click", () => {
    techNavCenter.classList.toggle("show");
  });
}

// =========================
// LOGOUT
// =========================
const techLogoutBtn = document.getElementById("techLogoutBtn");
if (techLogoutBtn) {
  techLogoutBtn.addEventListener("click", () => {
    localStorage.removeItem("activeTeknisi");
    window.location.href = "login-teknisi.html";
  });
}

// =========================
// TAB NAVIGATION
// =========================
const techMenuLinks = document.querySelectorAll(".tech-menu-link");
const techPanels = document.querySelectorAll(".tech-section-panel");

function activatePanel(panelId) {
  techMenuLinks.forEach(l => {
    const pid = l.getAttribute("data-panel");
    if (pid === panelId) {
      l.classList.add("active");
    } else {
      l.classList.remove("active");
    }
  });
  techPanels.forEach(p => {
    if (p.id === panelId) {
      p.classList.add("active-panel");
    } else {
      p.classList.remove("active-panel");
    }
  });

  const mainEl = document.querySelector(".tech-main");
  if (mainEl) {
    mainEl.scrollTo({ top: 0, behavior: "smooth" });
  }
}

techMenuLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetPanelId = link.getAttribute("data-panel");
    if (targetPanelId) {
      activatePanel(targetPanelId);
    }
  });
});

// =========================
// STORAGE HELPERS
// =========================

// Dipakai bareng driver-dashboard.js dan admin-dashboard.js
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

// Data teknisi yang login (diset dari login.js saat teknisi login)
function loadActiveTeknisi() {
  const raw = localStorage.getItem("activeTeknisi");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// =========================
// DOM ELEMENTS
// =========================

// summary angka kartu status
const countWaitingEl = document.getElementById("countWaiting");
const countProcessEl = document.getElementById("countProcess");
const countFollowEl  = document.getElementById("countFollow");
const countDoneEl    = document.getElementById("countDone");

// tabel pekerjaan
const jobTableBody   = document.getElementById("jobTableBody");
const jobSearchInput = document.getElementById("jobSearchInput");

// header profil teknisi
const techAvatarEl = document.getElementById("techAvatar");
const techNameTopEl = document.getElementById("techNameTop");
const techKeyTopEl  = document.getElementById("techKeyTop");

// form detail tiket
const ticketIdInput        = document.getElementById("ticketIdInput");
const ticketPlateInput     = document.getElementById("ticketPlateInput");
const ticketBrandInput     = document.getElementById("ticketBrandInput");
const ticketDriverInput    = document.getElementById("ticketDriverInput");
const ticketIssueInput     = document.getElementById("ticketIssueInput");
const ticketExtraInput     = document.getElementById("ticketExtraInput");
const ticketTechNoteInput  = document.getElementById("ticketTechNoteInput");
const ticketStatusSelect   = document.getElementById("ticketStatusSelect");
const saveTicketBtn        = document.getElementById("saveTicketBtn");
const techFormError        = document.getElementById("techFormError");

// ID tiket yang lagi diedit
let editingTicketId = null;

// =========================
// RENDER HEADER TEKNISI
// =========================
function renderTeknisiHeader() {
  const akt = loadActiveTeknisi();
  if (!akt) {
    if (techNameTopEl) techNameTopEl.textContent = "Teknisi";
    if (techKeyTopEl)  techKeyTopEl.textContent  = "Key: -";
    if (techAvatarEl)  techAvatarEl.textContent  = "TK";
    return;
  }

  const username = akt.username || "Teknisi";
  const key = akt.key || "-";

  if (techNameTopEl) techNameTopEl.textContent = username;
  if (techKeyTopEl)  techKeyTopEl.textContent  = "Key: " + key;

  if (techAvatarEl) {
    const initials = username
      .trim()
      .split(" ")
      .map(n => n[0] || "")
      .join("")
      .substring(0,2)
      .toUpperCase();
    techAvatarEl.textContent = initials || "TK";
  }
}

// =========================
// RENDER LIST PEKERJAAN
// =========================
function formatStatusLabel(status) {
  if (!status) return "Menunggu";
  if (status === "menunggu")        return "Menunggu";
  if (status === "proses")          return "Proses";
  if (status === "selesai")         return "Selesai";
  if (status === "butuh_follow_up") return "Butuh Follow Up";
  return status;
}

function renderStats(list) {
  const waiting = list.filter(i => i.statusTeknisi === "menunggu").length;
  const proses  = list.filter(i => i.statusTeknisi === "proses").length;
  const follow  = list.filter(i => i.statusTeknisi === "butuh_follow_up").length;
  const done    = list.filter(i => i.statusTeknisi === "selesai").length;

  if (countWaitingEl) countWaitingEl.textContent = waiting;
  if (countProcessEl) countProcessEl.textContent = proses;
  if (countFollowEl)  countFollowEl.textContent  = follow;
  if (countDoneEl)    countDoneEl.textContent    = done;
}

function renderJobTable() {
  if (!jobTableBody) return;
  jobTableBody.innerHTML = "";

  const list = loadRepairQueue();

  list.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.plate || "-"}</td>
      <td>${item.brand || "-"}</td>
      <td>${item.issue || "-"}</td>
      <td>${item.driverExtraNeeds || item.note || "-"}</td>
      <td>${item.driverUsername || "-"}</td>
      <td>${formatStatusLabel(item.statusTeknisi)}</td>
      <td class="aksi-buttons">
        <button class="row-btn-detail" data-ticket-id="${item.id}">Detail</button>
      </td>
    `;
    jobTableBody.appendChild(tr);
  });

  renderStats(list);
}

// filter pencarian di tabel teknisi
if (jobSearchInput && jobTableBody) {
  jobSearchInput.addEventListener("input", () => {
    const q = jobSearchInput.value.toLowerCase();
    const rows = jobTableBody.querySelectorAll("tr");

    rows.forEach(row => {
      const plate  = row.children[0]?.textContent.toLowerCase() || "";
      const brand  = row.children[1]?.textContent.toLowerCase() || "";
      const issue  = row.children[2]?.textContent.toLowerCase() || "";
      const extra  = row.children[3]?.textContent.toLowerCase() || "";
      const driver = row.children[4]?.textContent.toLowerCase() || "";
      const match = (
        plate.includes(q) ||
        brand.includes(q) ||
        issue.includes(q) ||
        extra.includes(q) ||
        driver.includes(q)
      );
      row.style.display = match ? "" : "none";
    });
  });
}

// saat teknisi klik "Detail", kita load tiket itu ke form kanan
if (jobTableBody) {
  jobTableBody.addEventListener("click", (e) => {
    const btn = e.target;
    if (!btn.classList.contains("row-btn-detail")) return;

    const ticketId = btn.getAttribute("data-ticket-id");
    const list = loadRepairQueue();
    const item = list.find(it => it.id === ticketId);
    if (!item) return;

    if (ticketIdInput)       ticketIdInput.value       = item.id || "";
    if (ticketPlateInput)    ticketPlateInput.value    = item.plate || "";
    if (ticketBrandInput)    ticketBrandInput.value    = item.brand || "";
    if (ticketDriverInput)   ticketDriverInput.value   = item.driverUsername || "";
    if (ticketIssueInput)    ticketIssueInput.value    = item.issue || "";
    if (ticketExtraInput)    ticketExtraInput.value    = item.driverExtraNeeds || item.note || "";
    if (ticketTechNoteInput) ticketTechNoteInput.value = item.techNote || "";
    if (ticketStatusSelect)  ticketStatusSelect.value  = item.statusTeknisi || "menunggu";

    editingTicketId = item.id;

    // pindahkan UI ke panel detail
    activatePanel("panel-detail");
  });
}

// SIMPAN UPDATE dari teknisi:
// - statusTeknisi bisa jadi "butuh_follow_up", nanti Admin akan lihat
// - techNote disimpan
if (saveTicketBtn) {
  saveTicketBtn.addEventListener("click", () => {
    if (techFormError) techFormError.textContent = "";

    if (!editingTicketId) {
      if (techFormError) techFormError.textContent = "Tidak ada ticket yang dipilih.";
      return;
    }

    const list = loadRepairQueue();
    const idx = list.findIndex(it => it.id === editingTicketId);
    if (idx === -1) {
      if (techFormError) techFormError.textContent = "Ticket tidak ditemukan.";
      return;
    }

    list[idx].techNote = ticketTechNoteInput ? ticketTechNoteInput.value.trim() : "";
    list[idx].statusTeknisi = ticketStatusSelect ? ticketStatusSelect.value : "menunggu";
    list[idx].lastUpdate = new Date().toISOString();

    saveRepairQueue(list);

    alert("Perubahan disimpan.");

    // refresh tabel + statistik
    renderJobTable();
  });
}

// INIT
renderTeknisiHeader();

renderJobTable();

renderJobTable();

