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
  
}

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
              <span class="folder-name" onclick="selectItem(this)">${judul}</span>
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

function selectItem(el) {
  // hapus active-item sebelumnya
  document.querySelectorAll(".active-item").forEach(item => item.classList.remove("active-item"));

  el.parentElement.classList.add("active-item");
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











