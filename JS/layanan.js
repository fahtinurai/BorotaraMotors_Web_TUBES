// NAV TOGGLE (mobile burger)
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
});

// NAV ACTIVE LINK (ubah warna font saat diklik)
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    // hapus class 'active' dari semua link
    navLinks.forEach(l => l.classList.remove('active'));

    // tambahkan 'active' ke link yang diklik
    link.classList.add('active');
  });
});

// ========== AUTO ACTIVE LINK BERDASARKAN HALAMAN ==========
const currentUrl = window.location.href;

navLinks.forEach(link => {
  if (link.href === currentUrl) {
    link.classList.add('active');
  }
});

// === NAVBAR: dropdown login ===
const loginBtn = document.getElementById("loginBtn");
const loginDropdown = document.getElementById("loginDropdown");

if (loginBtn && loginDropdown) {
  loginBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // jangan langsung ketutup lagi
    loginDropdown.classList.toggle("show");
    loginBtn.classList.toggle("active"); // buat muter panah ▼ (chevron)
  });

  // klik di luar -> tutup dropdown
  document.addEventListener("click", (e) => {
    if (!loginDropdown.contains(e.target) && !loginBtn.contains(e.target)) {
      loginDropdown.classList.remove("show");
      loginBtn.classList.remove("active");
    }
  });
}


// === TAB PAKET SERVIS ===
const tabButtons = document.querySelectorAll(".paket-tab-link");
const panels = document.querySelectorAll(".paket-panel");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target"); // contoh: "toyota"

    // 1. reset semua tombol tab
    tabButtons.forEach((b) => b.classList.remove("active"));
    // 2. aktifkan tombol yg diklik
    btn.classList.add("active");

    // 3. sembunyikan semua panel
    panels.forEach((p) => p.classList.remove("active"));
    // 4. tampilkan panel yg sesuai
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }
  });
});
