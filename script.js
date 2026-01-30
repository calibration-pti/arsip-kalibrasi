function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

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

  autoOpenFromQR();

function autoOpenFromQR() {
  const target = getParam("open");
  if (!target) return;
  
  const paths = target.split("%");
  let currentPath = "";

  paths.forEach(part => {
    currentPath = currentPath ? currentPath + "%" + part : part;

    const el = document.querySelector(`[data-path="${currentPath}"]`);
    if (el) {
      const ul = el.nextElementSibling;
      if (ul && ul.style.display === "none") {
        toggle(el);
      }
      lastEl = el; // simpan elemen terakhir
    }
  });
  
  // 🔥 HIGHLIGHT ELEMEN TERAKHIR
  if (lastEl) {
    lastEl.classList.add("highlight");

    // optional: scroll otomatis ke item
    lastEl.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

  
}

function render(tree) {
  const container = document.getElementById("arsip");
  container.innerHTML = "";

  for (const status in tree) {
    container.innerHTML += `
      <h3 data-path="${status}" onclick="toggle(this)">
        <span class="icon">○</span> ${status}
      </h3>
      <ul style="display:none">
        ${Object.keys(tree[status]).map(judul => `
          <li>
            📁 <a href="#" data-path="${status}|${judul}" onclick="toggle(this);return false;">
              <span class="icon">○</span> ${judul}
            </a>
            <ul style="display:none">
              ${Object.keys(tree[status][judul]).map(instrumen => `
                <li>
                  📂 <a href="#" data-path="${status}|${judul}|${instrumen}" onclick="toggle(this);return false;">
                    <span class="icon">○</span> ${instrumen}
                  </a>
                  <ul style="display:none">
                    ${Object.keys(tree[status][judul][instrumen]).map(jenis => `
                      <li>
                        📂 <a href="#" data-path="${status}|${judul}|${instrumen}|${jenis}" onclick="toggle(this);return false;">
                          <span class="icon">○</span> ${jenis}
                        </a>
                        <ul style="display:none">
                          ${Object.keys(tree[status][judul][instrumen][jenis]).map(kode => `
                            <li>
                              📂 <a href="#" data-path="${status}|${judul}|${instrumen}|${jenis}|${kode}" onclick="toggle(this);return false;">
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

let rawData = [];

fetch("data.json")
  .then(res => res.json())
  .then(data => {
    rawData = data;   // ← INI WAJIB
    build(data);      // tree kamu
  });

function searchKode(keyword) {
  const table = document.getElementById("searchResult");
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  if (!keyword) {
    table.style.display = "none";   // ⬅ sembunyikan
    return;
  }
  const key = keyword.toLowerCase();

  const hasil = rawData.filter(d =>
    String(d.kode).toLowerCase().includes(key)
  );

  table.style.display = "table";   // ⬅ tampilkan
  
  if (hasil.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4"><i>Data tidak ditemukan</i></td>
      </tr>
    `;
    return;
  }

  hasil.forEach(h => {
    tbody.innerHTML += `
      <tr>
        <td>${h.kode}</td>
        <td>${h.status}</td>
        <td>${h.judul}</td>
        <td>${h.instrumen}</td>
        <td>${h.jenis}</td>
      </tr>
    `;
  });
}










