// Ambil parameter folder dari QR
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
const folderToOpen = getQueryParam("folder");

// Fetch data JSON
fetch("data.json")
  .then(res => res.json())
  .then(data => build(data));

function build(data) {
  const tree = {};

  data.forEach(d => {
    tree[d.status] ??= {};
    tree[d.status][d.judul] ??= {};    
    tree[d.status][d.judul][d.instrumen] ??= {};
    tree[d.status][d.judul][d.instrumen][d.jenis] ??= {};
    tree[d.status][d.judul][d.instrumen][d.jenis][d.kode] ??= [];
    tree[d.status][d.judul][d.instrumen][d.jenis][d.kode].push(d);
  });

  render(tree);
  // Jika ada folder dari QR, buka otomatis
  if (folderToOpen) {
    document.querySelectorAll(".folder-name").forEach(el => {
      if (el.textContent.trim() === folderToOpen) {
        const icon = el.parentElement.querySelector(".icon");
        const nextUl = el.parentElement.nextElementSibling;
        if (nextUl && icon) {
          nextUl.style.display = "block";
          icon.textContent = "-";
        }
        selectItem(el);
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
}

function render(tree) {
  const container = document.getElementById("arsip");
  container.innerHTML = "";

  for (const status in tree) {
    container.innerHTML += `
      <h3 onclick="toggle(this)">
        <span class="icon">○</span> ${status}
      </h3>
      <ul style="display:none">
        ${Object.keys(tree[status]).map(judul => `
          <li>
            📁 <a href="#" onclick="toggle(this);return false;">
              <span class="icon">○</span> ${judul}
            </a>
            <ul style="display:none">
              ${Object.keys(tree[status][judul]).map(instrumen => `
                <li>
                  📂 <a href="#" onclick="toggle(this);return false;">
                    <span class="icon">○</span> ${instrumen}
                  </a>
                  <ul style="display:none">
                    ${Object.keys(tree[status][judul][instrumen]).map(jenis => `
                      <li>
                        📂 <a href="#" onclick="toggle(this);return false;">
                          <span class="icon">○</span> ${jenis}
                        </a>
                        <ul style="display:none">
                          ${Object.keys(tree[status][judul][instrumen][jenis]).map(kode => `
                            <li>
                              📂 <a href="#" onclick="toggle(this);return false;">
                                <span class="icon">○</span> ${kode}
                              </a>
                              <ul style="display:none">
                                ${tree[status][judul][instrumen][jenis][kode].map(p => `
                                  <li>
                                    📄 <a onclick="openPDF('pdf/${p.file}')">
                                      ${p.periode}
                                    </a>
                                  </li>
                                `).join("")}
                              </ul>                                  
                            </li>
                          `).join("")}
                        </ul>
                      </li>
                    `).join("")}
                  </ul>
                </li>
              `).join("")}
            </ul>
          </li>
        `).join("")}
      </ul>
    `;
  }
}

function toggle(el) {
  const next = el.nextElementSibling;
  if (next) {
    const icon = el.querySelector(".icon");
    if (next.style.display === "none") {
      next.style.display = "block";
      if (icon) icon.textContent = "▼";
    } else {
      next.style.display = "none";
      if (icon) icon.textContent = "○";
    }
  }

  function selectItem(el) {
    document.querySelectorAll(".active-item").forEach(item => item.classList.remove("active-item"));
    el.parentElement.classList.add("active-item");
  }

  function openFolderByName(folderName) {
    document.querySelectorAll(".folder-name").forEach(el => {
    // cek folder target
    if (el.textContent.trim() === folderName) {
      // buka folder target
      const icon = el.parentElement.querySelector(".icon");
      const nextUl = el.parentElement.nextElementSibling;
      if (nextUl && icon) {
        nextUl.style.display = "block";
        icon.textContent = "-";
      }

      // tandai aktif
      selectItem(el);

      // scroll ke folder
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // opsional: buka PDF pertama otomatis
      const firstPdfLink = nextUl?.querySelector("a");
      if (firstPdfLink) firstPdfLink.click();
    } else {
      // semua folder lain tetap tertutup
      const nextUl = el.parentElement.nextElementSibling;
      const icon = el.parentElement.querySelector(".icon");
      if (nextUl && icon) {
        nextUl.style.display = "none";
        icon.textContent = "+";
      }
      el.parentElement.classList.remove("active-item");
    }
  });
}

function openPDF(url) {
  // Jika link Google Drive
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
      // Pakai Google Docs Viewer agar tampil di iframe
      url = `https://docs.google.com/gview?url=${encodeURIComponent(directLink)}&embedded=true`;
    }
  }
  document.getElementById("pdfViewer").src = url;
}









