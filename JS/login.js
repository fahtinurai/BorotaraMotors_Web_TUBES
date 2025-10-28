// ============================
// DATA DUMMY LOGIN
// ============================
const dummyAccounts = {
  admin:   { email: "admin@gmail.com",   password: "admin123" },
  driver:  { email: "driver",  password: "driver123" },
  teknisi: { email: "teknisi", password: "teknisi123" },
};

// =======================
// Ambil elemen-elemen DOM
// =======================

// dropdown role (Admin / Driver / Teknisi)
const roleSelect = document.getElementById('roleSelect');

// teks di atas form ("Welcome Admin !")
const welcomeText = document.getElementById('welcomeText');

// tombol login ("Log In as Admin")
const loginBtn = document.getElementById('loginBtn');

// input password + tombol mata
const passwordInput = document.getElementById('passwordInput');
const togglePassBtn = document.getElementById('togglePassBtn');

// input email + elemen error
const emailInput = document.getElementById('emailInput');
const errorMsg = document.getElementById('errorMsg');


// =====================================
// Ubah teks welcome & tombol saat ganti role
// =====================================
if (roleSelect && welcomeText && loginBtn) {
  roleSelect.addEventListener('change', () => {
    const role = roleSelect.value; // "admin", "driver", "teknisi"
    const capRole = role.charAt(0).toUpperCase() + role.slice(1); // "Admin"

    // update tampilan
    welcomeText.textContent = `Welcome ${capRole} !`;
    loginBtn.textContent = `Log In as ${capRole}`;
  });
}


// =======================
// Toggle show/hide password
// =======================
if (togglePassBtn && passwordInput) {
  togglePassBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';

    if (isHidden) {
      // tampilkan password
      passwordInput.type = 'text';
      togglePassBtn.textContent = '🙈';
    } else {
      // sembunyikan password
      passwordInput.type = 'password';
      togglePassBtn.textContent = '👁';
    }
  });
}


// =======================
// Klik tombol login
// =======================
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    // reset error dulu
    if (errorMsg) {
      errorMsg.textContent = "";
    }

    const emailVal = emailInput ? emailInput.value.trim() : "";
    const passVal  = passwordInput ? passwordInput.value.trim() : "";

    // Validasi kosong
    if (!emailVal || !passVal) {
      if (errorMsg) {
        errorMsg.textContent = "Email dan password wajib diisi.";
      }
      return;
    }

    // Validasi format email super sederhana
    if (!emailVal.includes("@")) {
      if (errorMsg) {
        errorMsg.textContent = "Format email tidak valid.";
      }
      return;
    }

    // Tentukan role aktif
    // - kalau ada dropdown roleSelect (halaman login gabungan)
    // - kalau tidak ada dropdown (misal login-driver.html), kita tebak dari teks tombol
    let role = "driver"; // default fallback

    if (roleSelect) {
      role = roleSelect.value.toLowerCase(); // "admin" | "driver" | "teknisi"
    } else if (loginBtn.textContent.toLowerCase().includes("admin")) {
      role = "admin";
    } else if (loginBtn.textContent.toLowerCase().includes("teknisi")) {
      role = "teknisi";
    } else if (loginBtn.textContent.toLowerCase().includes("driver")) {
      role = "driver";
    }

    // Ambil kredensial dummy sesuai role
    const expected = dummyAccounts[role];

    if (!expected) {
      if (errorMsg) {
        errorMsg.textContent = "Role tidak dikenal.";
      }
      return;
    }

    // Cek kecocokan email & password
    if (emailVal !== expected.email || passVal !== expected.password) {
      if (errorMsg) {
        errorMsg.textContent = "Email atau password salah!";
      }
      return;
    }

    // Sampai sini berarti lolos login dummy
    alert(`Login sukses sebagai ${role.toUpperCase()}!`);

    // Redirect ke dashboard sesuai role
    if (role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else if (role === "driver") {
      window.location.href = "driver-dashboard.html";
    } else if (role === "teknisi") {
      window.location.href = "teknisi-dashboard.html";
    } else {
      // fallback terakhir kalo role gak kebaca
      window.location.href = "driver-dashboard.html";
    }
  });
}
