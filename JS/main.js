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


// LOGIN DROPDOWN
const loginBtn = document.getElementById('loginBtn');
const loginDropdown = document.getElementById('loginDropdown');

loginBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // biar nggak langsung ketutup
  loginDropdown.classList.toggle('show');
  loginBtn.classList.toggle('active');
});

// klik di luar dropdown -> tutup
document.addEventListener('click', (e) => {
  if (!loginDropdown.contains(e.target) && !loginBtn.contains(e.target)) {
    loginDropdown.classList.remove('show');
    loginBtn.classList.remove('active');
  }
});
