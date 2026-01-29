// Ambil parameter folder dari QR
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
const folderToOpen = getQueryParam("folder");

let arsipData = [];

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    arsipData = data;
    build(data);
  });

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
             📁<span class="folder-name" onclick="selectItem(this)">${judul}</span>
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
  const ul = iconEl.parentElement.nextElementSibling;
  if (!ul) return;

  const open = ul.style.display === "block";
  ul.style.display = open ? "none" : "block";
  iconEl.textContent = open ? "+" : "-";
}

document.getElementById("searchInput").addEventListener("input", e => {
  const key = e.target.value.toLowerCase();
  const box = document.getElementById("searchResult");
  box.innerHTML = "";

  if (key.length < 2) return;

  const results = arsipData.filter(d =>
    d.kode.toLowerCase().includes(key)
  );

  const grouped = {};
  results.forEach(d => {
    if (!grouped[d.status]) grouped[d.status] = {};
    if (!grouped[d.status][d.jenis]) grouped[d.status][d.jenis] = [];
    grouped[d.status][d.jenis].push(d);
  });

  for (const status in grouped) {
    box.innerHTML += `<h4>${status}</h4>`;

    for (const jenis in grouped[status]) {
      box.innerHTML += `<strong>${jenis}</strong>`;

      grouped[status][jenis].forEach(p => {
        box.innerHTML += `
          <div class="search-item" onclick="openPDF('${p.file}')">
            ${p.kode} – ${p.periode}
          </div>
        `;
      });
    }
  }
});

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




