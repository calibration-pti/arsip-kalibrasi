let allData = [];

// ambil data
fetch("data.json")
  .then(res => res.json())
  .then(data => {
    allData = data;
    buildTree(data);
  });

// ================== BUILD TREE ==================
function buildTree(data) {
  const tree = {};
  data.forEach(d => {
    tree[d.status] ??= {};
    tree[d.status][d.judul] ??= {};
    tree[d.status][d.judul][d.jenis] ??= {};
    tree[d.status][d.judul][d.jenis][d.kode] ??= [];
    tree[d.status][d.judul][d.jenis][d.kode].push(d);
  });

  const container = document.getElementById("arsip");
  container.innerHTML = "";

  for (const status in tree) {
    container.innerHTML += `
      <div class="tree-item">
        <span class="icon" onclick="toggle(this)">+</span>
        <span class="folder-name">${status}</span>
      </div>
      <ul style="display:none">
        ${Object.keys(tree[status]).map(judul => `
          <li>
            <div class="tree-item">
              <span class="icon" onclick="toggle(this)">+</span>
              <span class="folder-name">${judul}</span>
            </div>
            <ul style="display:none">
              ${Object.keys(tree[status][judul]).map(jenis => `
                <li>
                  <div class="tree-item">
                    <span class="icon" onclick="toggle(this)">+</span>
                    <span class="folder-name">${jenis}</span>
                  </div>
                  <ul style="display:none">
                    ${Object.keys(tree[status][judul][jenis]).map(kode => `
                      <li>
                        <div class="tree-item">
                          <span class="icon" onclick="toggle(this)">+</span>
                          <span class="folder-name">${kode}</span>
                        </div>
                        <ul style="display:none">
                          ${tree[status][judul][jenis][kode].map(p => `
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
    `;
  }
}

// ================== TOGGLE ==================
function toggle(el) {
  const ul = el.parentElement.nextElementSibling;
  if (!ul) return;
  const open = ul.style.display === "block";
  ul.style.display = open ? "none" : "block";
  el.textContent = open ? "+" : "-";
}

// ================== SEARCH ==================
function searchArsip(keyword) {
  const box = document.getElementById("searchResult");
  box.innerHTML = "";

  if (!keyword || keyword.length < 2) return;

  keyword = keyword.toLowerCase();

  const hasil = allData.filter(d =>
    d.kode.toLowerCase().includes(keyword)
  );

  if (hasil.length === 0) {
    box.innerHTML = "<p>❌ Arsip tidak ditemukan</p>";
    return;
  }

  const group = {};
  hasil.forEach(d => {
    group[d.status] ??= [];
    group[d.status].push(d);
  });

  for (const status in group) {
    box.innerHTML += `<h4>${status}</h4>`;
    group[status].forEach(d => {
      box.innerHTML += `
        <div class="search-item">
          <b>${d.kode}</b> (${d.jenis})<br>
          <small>${d.periode}</small><br>
          <a onclick="openPDF('${d.file}')">Buka PDF</a>
        </div>
      `;
    });
  }
}

// ================== PDF VIEWER ==================
function openPDF(url) {
  if (url.includes("drive.google.com")) {
    const id = url.match(/\/d\/([^/]+)/)?.[1];
    if (id) {
      url = `https://docs.google.com/gview?url=https://drive.google.com/uc?id=${id}&embedded=true`;
    }
  }
  document.getElementById("pdfViewer").src = url;
}
