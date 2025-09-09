// --- Toggle da sidebar ---
document.getElementById("toggleSidebar").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("active");
});

// --- Inicialização do mapa ---
const map = L.map('map', { crs: L.CRS.Simple, minZoom: 2.3, maxZoom: 5, center: [0,0], zoom: 0 });
const mapWidth = 6144, mapHeight = 6144;
const southWest = map.unproject([0, mapHeight], map.getMaxZoom());
const northEast = map.unproject([mapWidth, 0], map.getMaxZoom());
const bounds = new L.LatLngBounds(southWest, northEast);

L.tileLayer('tiles/{z}/{x}/{y}.png', {
  minZoom: 0,
  maxZoom: map.getMaxZoom(),
  bounds: bounds,
  noWrap: true
}).addTo(map);

map.fitBounds(bounds);

// --- Coordenadas do mouse ---
const coordsDiv = document.getElementById('coords');
map.on('mousemove', e => {
  const pixel = map.project(e.latlng, map.getMaxZoom());
  coordsDiv.innerHTML = `x: ${Math.floor(pixel.x)}, y: ${Math.floor(pixel.y)}`;
});

const iconCache = {};
function criarIcone(url, size = 32) {
  const key = `${url}|${size}`;
  if (iconCache[key]) return iconCache[key];
  const ic = L.icon({ iconUrl: url, iconSize: [size, size], iconAnchor: [size/2, size], popupAnchor: [0, -size] });
  iconCache[key] = ic;
  return ic;
}

// --- Dados dos marcadores ---
const iconDefaults = {
  wb: 'icons/wb.svg', mercado: 'icons/mercado.svg', conquista: 'icons/conquista.svg',
  sepulkros: 'icons/sepulkros.svg', noctarin: 'icons/noctarin.svg', bastien: 'icons/bastien.svg',
  mortak: 'icons/mortak.svg', draekhar: 'icons/draekhar.svg', carmesyne: 'icons/carmesyne.svg',
  skarn: 'icons/skarn.svg', umbrellis: 'icons/umbrellis.svg', eventos: 'icons/evento.svg', invasao: 'icons/invasao.svg', normal: 'icons/default.svg'
};

// --- Coordenadas dos marcadores ---
const pontos = [
  {x:3484,y:4466,nome:"Mercado sombrio (Mestre das missões diárias)",tipo:"mercado"},
  {x:1211,y:2293,nome:"Shemhazai (Conquista: A Essência da Luminância)",tipo:"conquista"},
  {x:4930,y:2370,nome:"Chefe Mundial (WB)",tipo:"wb"},
  {x:4547,y:2926,nome:"Chefe Mundial (WB)",tipo:"wb"},
  {x:4110,y:3715,nome:"Piracema (Todos os dias às 19:30)",tipo:"eventos",icone:"icons/fish.svg"},
  {x:3679,y:4255,nome:"Coliseu PVP ⚔️",tipo:"eventos",icone:"icons/coliseu.svg"},
  {x:3293,y:3920,nome:"Classe: Noctarin",tipo:"noctarin"},
  {x:3138,y:3640,nome:"Evolução: Noctarin",tipo:"noctarin"},
  {x:4730,y:3525,nome:"Classe: Mortak",tipo:"mortak"},
  {x:982,y:2815,nome:"Evolução: Mortak",tipo:"mortak"},
  {x:3120,y:4105,nome:"Classe: Sepulkros",tipo:"sepulkros"},
  {x:3945,y:5175,nome:"Evolução: Sepulkros",tipo:"sepulkros"},
  {x:1260,y:2700,nome:"Classe: Bastien",tipo:"bastien"},
  {x:1560,y:2680,nome:"Evolução: Bastien",tipo:"bastien"},
  {x:3780,y:2655,nome:"Classe: Draekhar",tipo:"draekhar"},
  {x:4263,y:1190,nome:"Evolução: Draekhar",tipo:"draekhar"},
  {x:4232,y:1490,nome:"Classe: Skarn",tipo:"skarn"},
  {x:2414,y:1430,nome:"Evolução: Skarn",tipo:"skarn"},
  {x:2996,y:1010,nome:"Classe: Carmesyne",tipo:"carmesyne"},
  {x:2193,y:1150,nome:"Evolução: Carmesyne",tipo:"carmesyne"},
  {x:3257,y:3153,nome:"Classe: Umbrellis",tipo:"umbrellis"},
  {x:1060,y:1410,nome:"Evolução: Umbrellis",tipo:"umbrellis"},
  {x:5394,y:2465,nome:"Invasão Solarus - Solarus",tipo:"eventos", icone:'icons/invasao.svg'},
  {x:4331,y:2975,nome:"Invasão Solarus - Azariel",tipo:"eventos", icone:'icons/invasao.svg'},
  {x:640,y:1415,nome:"Invasão Solarus - Raziel",tipo:"eventos", icone:'icons/invasao.svg'},
  {x:4485,y:2286,nome:"Invasão Megara - Jakira",tipo:"eventos", icone:'icons/invasao.svg'},
  {x:936,y:2880,nome:"Invasão Megara - Stravos",tipo:"eventos", icone:'icons/invasao.svg'},
  {x:973,y:1850,nome:"Invasão Drácula - Cassius",tipo:"eventos", icone:'icons/invasao.svg'},
  {x:1252,y:2811,nome:"Invasão Drácula - Valencia",tipo:"eventos", icone:'icons/invasao.svg'},
  {x:2724,y:4535,nome:"Invasão Drácula - Drácula",tipo:"eventos", icone:'icons/invasao.svg'}
];

// --- Categorias dos marcadores ---
const categorias = {
  mercado:"🪙 Mercado", wb:"☠️ Chefe Mundial", conquista:"🏆 Conquistas",
  sepulkros:"💀 Sepulkros", noctarin:"🌑 Noctarin", bastien:"🛡 Bastien",
  mortak:"🔥 Mortak", draekhar:"🐉 Draekhar", carmesyne:"❤️ Carmesyne",
  skarn:"🪨 Skarn", umbrellis:"🌂 Umbrellis", eventos:"📌 Eventos", normal:"📍 Outros"
};

const grupos = {};
const listaDiv = document.getElementById("lista-marcadores");

pontos.forEach(p => {
  const iconUrl = p.icone ? p.icone : (iconDefaults[p.tipo] || iconDefaults.normal);
  const size = p.size ? p.size : 28;
  const icon = criarIcone(iconUrl, size);

  const conteudoPopup = `
    <div class="popup-card">
      <h2>${p.nome}</h2>
      <hr>
      <p><strong>Categoria:</strong> ${categorias[p.tipo] || "Outros"}</p>
      <p><strong>Coordenadas:</strong> x:${p.x}, y:${p.y}</p>
    </div>
  `;

  const marker = L.marker(map.unproject([p.x, p.y], map.getMaxZoom()), { icon })
    .bindPopup(conteudoPopup, { maxWidth: 300 });
  marker._tipo = p.tipo;
  marker._nome = p.nome;

  if (!grupos[p.tipo]) grupos[p.tipo] = [];
  grupos[p.tipo].push(marker);

  marker.addTo(map);
});

function checkIfNoMarkersVisible() {
  let algumVisivel = false;
  for (let tipo in grupos) {
    grupos[tipo].forEach(marker => { if (map.hasLayer(marker)) algumVisivel = true; });
  }
  if (!algumVisivel) map.fitBounds(bounds);
}

function toggleMarker(marker, li) {
  if (li.dataset.visible === "true") {
    map.removeLayer(marker);
    li.dataset.visible = "false";
    li.classList.add("hidden-marker");
  } else {
    marker.addTo(map);
    li.dataset.visible = "true";
    li.classList.remove("hidden-marker");
    map.flyTo(marker.getLatLng(), 5);
    marker.openPopup();
  }
  checkIfNoMarkersVisible();
}

function criarCategoria(tipo, markers) {
  const div = document.createElement("div");
  div.classList.add("categoria");

  const titulo = document.createElement("h4");
  titulo.innerHTML = `${categorias[tipo] || tipo} <span class="arrow">▶</span>`;
  const ul = document.createElement("ul");
  ul.classList.add("lista-marcadores");

  markers.forEach(marker => {
    const li = document.createElement("li");
    li.textContent = marker._nome;
    li.dataset.visible = map.hasLayer(marker) ? "true" : "false";
    if (li.dataset.visible === "false") li.classList.add("hidden-marker");
    li.addEventListener("click", () => toggleMarker(marker, li));
    marker._li = li;
    ul.appendChild(li);
  });

  titulo.addEventListener("click", () => {
    const aberta = ul.style.display === "block";
    ul.style.display = aberta ? "none" : "block";
    const arrow = titulo.querySelector(".arrow");
    arrow.style.transform = aberta ? "rotate(0deg)" : "rotate(90deg)";
  });

  div.appendChild(titulo);
  div.appendChild(ul);
  return div;
}

for (let tipo in grupos) {
  listaDiv.appendChild(criarCategoria(tipo, grupos[tipo]));
}

function setAllMarkers(visible) {
  for (let tipo in grupos) {
    grupos[tipo].forEach(marker => {
      if (visible) marker.addTo(map);
      else map.removeLayer(marker);
      if (marker._li) {
        marker._li.dataset.visible = visible ? "true" : "false";
        marker._li.classList.toggle("hidden-marker", !visible);
      }
    });
  }
  checkIfNoMarkersVisible();
}

document.getElementById("showAll").addEventListener("click", () => {
  setAllMarkers(true);
  document.getElementById("showAll").classList.add("active");
  document.getElementById("hideAll").classList.remove("active");
});
document.getElementById("hideAll").addEventListener("click", () => {
  setAllMarkers(false);
  document.getElementById("hideAll").classList.add("active");
  document.getElementById("showAll").classList.remove("active");
});