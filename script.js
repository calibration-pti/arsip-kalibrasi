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

  // Buka folder dari QR jika ada
  if (folderToOpen) openFolderByName(folderToOpen);
}

// Render tree
function render(tree) {
  const container = document.getElementById("arsip");
  container.innerHTML = "";

  for (const status in tree) {
    container.innerHTML += `
      <div class="tree-item">
        <span class="icon" onclick="toggle(this)">+</span>
        <span class="folder-name" onclick="selectItem(this)">${status}</span>
      </div>
      <ul style="display:none">
        ${Object.keys(tree[status]).map(judul => `
          <li>
            <div class="tree-item">
              <span class="icon" onclick="toggle(this)">+</span>
            📁 <a href="#" <span class="folder-name" onclick="selectItem(this)">${judul}</span>
            </div>
            <ul style="display:none">
              ${Object.keys(tree[status][judul]).map(instrumen => `
                <li>
                  <div class="tree-item">
                    <span class="icon" onclick="toggle(this)">+</span>
                    <span class="folder-name" onclick="selectItem(this)">${instrumen}</span>
                  </div>
                  <ul style="display:none">
                    ${Object.keys(tree[status][judul][instrumen]).map(jenis => `
                      <li>
                        <div class="tree-item">
                          <span class="icon" onclick="toggle(this)">+</span>
                          <span class="folder-name" onclick="selectItem(this)">${jenis}</span>
                        </div>
                        <ul style="display:none">
                          ${Object.keys(tree[status][judul][instrumen][jenis]).map(kode => `
                            <li>
                              <div class="tree-item">
                                <span class="icon" onclick="toggle(this)">+</span>
                                <span class="folder-name" onclick="selectItem(this)">${kode}</span>
                              </div>
                              <ul style="display:none">
                                ${tree[status][judul][instrumen][jenis][kode].map(p => `
                                  <li>
                                    📄 <a onclick="openPDF('${p.file}')">${p.periode}</a>
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

// Toggle folder
function toggle(iconEl) {
  const nextUl = iconEl.parentElement.nextElementSibling;
  if (!nextUl) return;

  if (nextUl.style.display === "none") {
    nextUl.style.display = "block";
    iconEl.textContent = "-";
  } else {
    nextUl.style.display = "none";
    iconEl.textContent = "+";
  }
}

// Tandai folder aktif
function selectItem(el) {
  document.querySelectorAll(".active-item").forEach(item => item.classList.remove("active-item"));
  el.parentElement.classList.add("active-item");
}

// Buka folder target dari QR (hanya folder target terbuka, yang lain tetap tertutup)
function openFolderByName(folderName) {
  document.querySelectorAll(".folder-name").forEach(el => {
    const nextUl = el.parentElement.nextElementSibling;
    const icon = el.parentElement.querySelector(".icon");

    if (el.textContent.trim() === folderName) {
      // buka folder target
      if (nextUl && icon) {
        nextUl.style.display = "block";
        icon.textContent = "-";
      }
      selectItem(el);
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // opsional: buka PDF pertama otomatis
      const firstPdfLink = nextUl?.querySelector("a");
      if (firstPdfLink) firstPdfLink.click();
    } else {
      // tutup semua folder lain
      if (nextUl && icon) {
        nextUl.style.display = "none";
        icon.textContent = "+";
      }
      el.parentElement.classList.remove("active-item");
    }
  });
}

// Buka PDF
function openPDF(url) {
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
      url = `https://docs.google.com/gview?url=${encodeURIComponent(directLink)}&embedded=true`;
    }
  }
  document.getElementById("pdfViewer").src = url;
}
