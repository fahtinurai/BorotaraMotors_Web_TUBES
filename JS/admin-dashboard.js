// ==============================
// Toggle menu tengah kalau layar kecil
// ==============================
const burger = document.getElementById("adminBurger");
const navCenter = document.querySelector(".admin-nav-center");

if (burger && navCenter) {
  burger.addEventListener("click", () => {
    navCenter.classList.toggle("show");
  });
}

// ==============================
// Handle logout klik
// ==============================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    // nanti diarahkan balik ke halaman login admin
    window.location.href = "login-admin.html";
  });
}

// ==============================
// Fitur Generate Key
// ==============================
const generateKeyBtn = document.getElementById("generateKeyBtn");
const keyValueInput = document.getElementById("keyValue");

if (generateKeyBtn && keyValueInput) {
  generateKeyBtn.addEventListener("click", () => {
    // generate key acak 6 digit
    const randomKey = Math.floor(100000 + Math.random() * 900000);
    keyValueInput.value = randomKey;
  });
}

// ==============================
// Fitur Buat Key (dummy)
// ==============================
const submitKeyBtn = document.getElementById("submitKeyBtn");
const keyUsername = document.getElementById("keyUsername");
const keyRole = document.getElementById("keyRole");
const keyTableBody = document.getElementById("keyTableBody");

if (submitKeyBtn && keyUsername && keyRole && keyValueInput && keyTableBody) {
  submitKeyBtn.addEventListener("click", () => {
    const username = keyUsername.value.trim();
    const role = keyRole.value.trim();
    const keyVal = keyValueInput.value.trim();

    if (!username || !keyVal) {
      alert("Harap isi username dan key terlebih dahulu!");
      return;
    }

    // buat baris baru di tabel
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

    keyTableBody.appendChild(newRow);

    // reset form
    keyUsername.value = "";
    keyValueInput.value = "";

    alert("Key berhasil ditambahkan (dummy)!");
  });
}

// ==============================
// Fitur hapus/edit dummy
// ==============================
if (keyTableBody) {
  keyTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
      e.target.closest("tr").remove();
    } else if (e.target.classList.contains("btn-edit")) {
      alert("Edit key ini (fitur dummy).");
    }
  });
}
