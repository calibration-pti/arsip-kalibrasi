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
      <h3 onclick="toggle(this)">▶ ${status}</h3>
      <ul style="display:none">
        ${Object.keys(tree[status]).map(judul => `
          <li>
            📁 <a href="#" onclick="toggle(this);return false;">${judul}</a>
            <ul style="display:none">
              ${Object.keys(tree[status][judul]).map(jenis => `
                <li>
                  📂 <a href="#" onclick="toggle(this);return false;">${instrumen}</a>
                  <ul style="display:none">
                    ${Object.keys(tree[status][judul][instrumen]).map(jenis => `
                      <li>
                        📂 <a href="#" onclick="toggle(this);return false;">${jenis}</a>
                        <ul style="display:none">
                          ${Object.keys(tree[status][judul][instrumen][jenis]).map(kode => `
                            <li>
                              📂 <a href="#" onclick="toggle(this);return false;">${kode}</a>
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
    next.style.display = next.style.display === "none" ? "block" : "none";
  }
}

function openPDF(path) {
  document.getElementById("pdfViewer").src = path;
}



