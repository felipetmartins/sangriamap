// --- Sidebar ---
document.getElementById("toggleSidebar").addEventListener("click", (e) => {
  const sidebar = document.getElementById("sidebar").classList
  sidebar.toggle("active");

  const isOpen = sidebar.contains("active")

  document.getElementById("toggleSidebar").innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>'
});

let activeMarker = undefined;

// --- Inicialização do mapa ---
const map = L.map('map', { crs: L.CRS.Simple, minZoom: 2, maxZoom: 5, center: [0, 0], zoom: 0 });
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
function criarIcone(url, size = 30) {
  const key = `${url}|${size}`;
  if (iconCache[key]) return iconCache[key];
  const ic = L.icon({ iconUrl: url, iconSize: [size, size], iconAnchor: [size / 2, size], popupAnchor: [0, -size] });
  iconCache[key] = ic;
  return ic;
}

// --- Dados dos marcadores ---
const iconDefaults = {
  wb: 'icons/wb.svg', mercado: 'icons/mercado.svg', shemhazai: 'icons/shemhazai.svg', sepulkros: 'icons/sepulkros.svg',
  noctarin: 'icons/noctarin.svg', bastien: 'icons/bastien.svg', mortak: 'icons/mortak.svg', draekhar: 'icons/draekhar.svg',
  carmesyne: 'icons/carmesyne.svg', skarn: 'icons/skarn.svg', umbrellis: 'icons/umbrellis.svg', eventos: 'icons/evento.svg',
  invasao: 'icons/invasao.svg', normal: 'icons/default.svg', chefes: 'icons/chefe.svg', rathma: 'icons/rathma.svg'
};

const ordemCategorias = [
  'chefes','wb','conquista','eventos','invasao','mercado','bastien','carmesyne','draekhar',
  'mortak','noctarin','sepulkros','skarn','umbrellis','normal'
];

const grupos = {};
const listaDiv = document.getElementById("lista-marcadores");

marcadores.forEach(p => {
  const iconUrl = p.icone ? p.icone : (iconDefaults[p.tipo] || iconDefaults.normal);
  const size = p.size ? p.size : 26;
  const icon = criarIcone(iconUrl, size);
  
  const conteudoPopup = `
    <div class="popup-card">
      ${p.link ? `<a href="${p.link}" target="_blank">${p.nome}</a>` : `<h2>${p.nome}</h2>`} 
      <hr>
      <p><strong>Categoria:</strong> ${categorias[p.tipo] || "Outros"}</p>
      <p><strong>Coordenadas:</strong> x: ${p.x}, y: ${p.y}</p>
    </div>
  `;

  const marker = L.marker(map.unproject([p.x, p.y], map.getMaxZoom()), { icon })
    .bindPopup(conteudoPopup, { maxWidth: 300 });

  marker.on('mouseover', () =>
    marker.openPopup()
  );

  marker.on('click', (e) => {
    if (activeMarker != marker) {
      marker.openPopup()
      activeMarker = marker
    } else {
      marker.closePopup()
      activeMarker = undefined
    }
    e.originalEvent.stopImmediatePropagation()
  }
  );

  marker.getPopup().on('remove', function () {
    if (activeMarker == marker)
      setTimeout(() => activeMarker = undefined, 100)
    else activeMarker = undefined
  });

  marker.on('mouseout', () => {
    if (activeMarker != marker) {
      marker.closePopup()
    }
  });

  marker._tipo = p.tipo;
  marker._nome = p.nome;
  
  if (p.tipo === "chefes") {
    const atoTag = p.ato ? `Ato ${p.ato}` : "Ato x";
    marker._tags = [atoTag];
  } else {
    marker._tags = [];
  }

  if (!grupos[p.tipo]) grupos[p.tipo] = [];
  grupos[p.tipo].push(marker);

  marker.addTo(map);
});

function checkIfNoMarkersVisible() {
  let algumVisivel = false;
  for (let tipo in grupos) {
    grupos[tipo].forEach(marker => { if (map.hasLayer(marker)) algumVisivel = true; });
  }

  if (algumVisivel) {
    document.getElementById("showAll").classList.add("active");
    document.getElementById("hideAll").classList.remove("active");
  } else {
    document.getElementById("hideAll").classList.add("active");
    document.getElementById("showAll").classList.remove("active");
    map.fitBounds(bounds);
  }
}

function toggleMarker(marker, li) {
  if (li.dataset.visible === "true") {
    map.removeLayer(marker);
    li.dataset.visible = "false";
    li.classList.add("hidden-marker");
    marker._visivelUsuario = false; // <- marca que o usuário escondeu
  } else {
    marker.addTo(map);
    li.dataset.visible = "true";
    li.classList.remove("hidden-marker");
    map.flyTo(marker.getLatLng(), 5);
    marker.openPopup();
    marker._visivelUsuario = true; // <- marca que o usuário mostrou
  }
  checkIfNoMarkersVisible();
}

function criarCategoria(tipo, markers) {
  const div = document.createElement("div");
  div.classList.add("categoria");
  div.dataset.tipo = tipo;

  const titulo = document.createElement("h4");

  const textoTitulo = document.createElement("span");
  textoTitulo.innerHTML = categorias[tipo] || tipo;

  const eyeIcon = document.createElement("span");
  eyeIcon.className = "eye-icon";
  eyeIcon.innerHTML = '<i class="fa-solid fa-eye"></i>';

  const toggleIcon = document.createElement("span");
  toggleIcon.className = "toggle-icon";
  toggleIcon.innerHTML = '<i class="fa-solid fa-plus"></i>';

  const iconContainer = document.createElement("div");
  iconContainer.className = "icon-container";
  iconContainer.appendChild(eyeIcon);
  iconContainer.appendChild(toggleIcon);

  titulo.appendChild(textoTitulo);
  titulo.appendChild(iconContainer);

  const ul = document.createElement("ul");
  ul.classList.add("lista-marcadores");

  markers.sort((a, b) => a._nome.localeCompare(b._nome)).forEach(marker => {
    const li = document.createElement("li");
    li.innerHTML = marker._nome;
    li.dataset.visible = map.hasLayer(marker) ? "true" : "false";
    if (li.dataset.visible === "false") li.classList.add("hidden-marker");
    li.addEventListener("click", () => toggleMarker(marker, li));
    marker._li = li;
    ul.appendChild(li);
  });

  const toggleLista = () => {
    const estavaVisivel = ul.classList.contains("visible");
    ul.classList.toggle("visible");
    toggleIcon.innerHTML = estavaVisivel ? '<i class="fa-solid fa-plus"></i>' : '<i class="fa-solid fa-minus"></i>';
  };

  const toggleVisibilidade = () => {
    const todosVisiveis = markers.every(marker => map.hasLayer(marker));

    if (todosVisiveis) {
      markers.forEach(marker => {
        map.removeLayer(marker);
        if (marker._li) {
          marker._li.dataset.visible = "false";
          marker._li.classList.add("hidden-marker");
        }
      });
      eyeIcon.innerHTML = '<i class="fa-solid fa-eye-slash gray"></i>';
    } else {
      markers.forEach(marker => {
        if (!map.hasLayer(marker)) marker.addTo(map);
        if (marker._li) {
          marker._li.dataset.visible = "true";
          marker._li.classList.remove("hidden-marker");
        }
      });
      eyeIcon.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
    checkIfNoMarkersVisible();
  };

  toggleIcon.addEventListener("click", toggleLista);
  eyeIcon.addEventListener("click", toggleVisibilidade);

  titulo.addEventListener("click", (e) => {
    if (e.target === titulo || e.target === textoTitulo) {
      toggleLista();
    }
  });

  div.appendChild(titulo);
  div.appendChild(ul);
  return div;
}
const size = map.getSize();

const lat_min = -2, lat_max = 0;
const lng_min = 2, lng_max = 100;
const map_width = 6080, map_height = 6080;

function toCRS(lat, lng) {
  const y = (lat_max - lat) / (lat_max - lat_min) * map_height;
  const x = (lng - lng_min) / (lng_max - lng_min) * map_width;
  return [y, x];
}

const convertPathLoc = (path) =>
  path.map(pair => map.unproject(pair, map.getMaxZoom()))

// Alfa, o Lobo Branco (1) ----------------------------------------------------------------------------------
var latlngs = [
  [2760, 4660],
  [2800, 4670],
  [2800, 4640],
  [2800, 4590],
  [2810, 4570],
  [2810, 4530],
  [2780, 4530],
  [2740, 4530],
  [2710, 4520],
  [2680, 4520],
  [2640, 4530],
  [2640, 4560],
  [2650, 4570],
  [2690, 4570],
  [2720, 4560],
  [2730, 4540],
  [2750, 4530],
  [2790, 4530],
  [2840, 4520],
  [2850, 4540],
  [2860, 4570],
  [2880, 4600],
  [2880, 4620],
  [2870, 4650],
  [2850, 4650],
  [2820, 4670],
  [2760, 4660],
  ];

var polyline = L.polyline(convertPathLoc(latlngs), {
  color: 'red',
  linecap: 'round',
  linjoin: 'round'
}).addTo(map);
// ----------------------------------------------------------------------------------------------------------

// Alfa, o Lobo Branco (2) ----------------------------------------------------------------------------------
var latlngs = [
  [3120, 4200],
  [3100, 4210],
  [3100, 4220],
  [3080, 4220],
  [3080, 4230],
  [3090, 4250],
  [3100, 4260],
  [3120, 4280],
  [3140, 4300],
  [3150, 4310],
  [3170, 4320],
  [3180, 4320],
  [3200, 4300],
  [3200, 4290],
  [3200, 4270],
  [3210, 4250],
  [3210, 4230],
  [3200, 4200],
  [3180, 4200],
  [3170, 4200],
  [3150, 4200],
  [3120, 4200],
  ];

var polyline = L.polyline(convertPathLoc(latlngs), {
  color: 'red',
  linecap: 'round',
  linjoin: 'round'
}).addTo(map);
// ----------------------------------------------------------------------------------------------------------

// Alfa, o Lobo Branco (3) ----------------------------------------------------------------------------------
var latlngs = [
  [3310, 4520],
  [3340, 4500],
  [3360, 4500],
  [3360, 4530],
  [3350, 4550],
  [3340, 4580],
  [3340, 4590],
  [3320, 4590],
  [3290, 4580],
  [3270, 4610],
  [3250, 4630],
  [3230, 4640],
  [3200, 4630],
  [3210, 4600],
  [3220, 4560],
  [3250, 4540],
  [3260, 4520],
  [3290, 4500],
  [3310, 4520],
  ];

var polyline = L.polyline(convertPathLoc(latlngs), {
  color: 'red',
  linecap: 'round',
  linjoin: 'round'
}).addTo(map);
// ----------------------------------------------------------------------------------------------------------

// Goreswine, o Devastador ----------------------------------------------------------------------------------
var latlngs = [
  [2650, 4740],
  [2650, 4720],
  [2650, 4690],
  [2660, 4660],
  [2650, 4640],
  [2640, 4630],
  [2650, 4610],
  [2670, 4610],
  [2680, 4590],
  [2700, 4580],
  [2720, 4570],
  [2730, 4550],
  [2740, 4530],
  [2770, 4540],
  [2790, 4530],
  [2820, 4520],
  [2840, 4520],
  [2870, 4520],
  [2880, 4520],
  [2900, 4520],
  [2910, 4530],
  [2930, 4540],
  [2940, 4560],
  [2960, 4560],
  [2980, 4570],
  [3010, 4570],
  [3020, 4570],
  [3040, 4550],
  [3050, 4540],
  [3070, 4540],
  [3080, 4530],
  [3100, 4540],
  [3110, 4530],
  [3130, 4520],
  [3150, 4510],
  [3160, 4510],
  [3180, 4520],
  [3200, 4520],
  [3210, 4520],
  [3230, 4530],
  [3250, 4540],
  [3270, 4570],
  [3290, 4580],
  [3310, 4590],
  [3320, 4590],
  [3340, 4590],
  [3350, 4600],
  [3370, 4600],
  [3400, 4600],
  [3420, 4620],
  [3430, 4640],
  [3420, 4670],
  [3400, 4670],
  [3370, 4670],
  [3340, 4680],
  [3320, 4680],
  [3300, 4700],
  ];

var polyline = L.polyline(convertPathLoc(latlngs), {
  color: 'red',
  linecap: 'round',
  linjoin: 'round'
}).addTo(map);
// ----------------------------------------------------------------------------------------------------------

// Tristan, o Caçador de Vampiros ----------------------------------------------------------------------------------
var latlngs = [
  [1560, 4180], [1580, 4190], [1610, 4200], [1620, 4210], [1640, 4240],
  [1660, 4250], [1700, 4220], [1740, 4190], [1760, 4170], [1760, 4150],
  [1770, 4140], [1800, 4140], [1810, 4140], [1820, 4130], [1830, 4120],
  [1850, 4110], [1870, 4110], [1880, 4110], [1890, 4120], [1910, 4120],
  [1930, 4120], [1940, 4120], [1950, 4110], [1970, 4110], [1990, 4120],
  [2010, 4130], [2020, 4130], [2040, 4130], [2060, 4130], [2080, 4130],
  [2100, 4120], [2130, 4110], [2150, 4110], [2160, 4100], [2170, 4070],
  [2180, 4040], [2200, 4030], [2220, 4010], [2230, 4000], [2250, 4000],
  [2270, 4000], [2290, 3990], [2300, 3990], [2310, 3960], [2330, 3950],
  [2340, 3930], [2350, 3930], [2370, 3930], [2380, 3940], [2400, 3950],
  [2420, 3950], [2440, 3950], [2460, 3970], [2470, 3980], [2480, 4000],
  [2490, 4010], [2530, 4000], [2560, 4000], [2590, 4000], [2610, 4010],
  [2630, 4030], [2650, 4050], [2670, 4050], [2700, 4060], [2710, 4080],
  [2710, 4110], [2720, 4140], [2720, 4160], [2730, 4180], [2750, 4190],
  [2780, 4220], [2790, 4250], [2810, 4280], [2830, 4320], [2840, 4320],
  [2870, 4320], [2890, 4320], [2910, 4300], [2940, 4290], [2960, 4270],
  [2970, 4250], [2990, 4230], [3010, 4210], [3030, 4200], [3040, 4210],
  [3050, 4220], [3080, 4230], [3090, 4250], [3110, 4280], [3140, 4300],
  [3180, 4320], [3190, 4320], [3220, 4320], [3230, 4310], [3240, 4320],
  [3260, 4330], [3280, 4320], [3300, 4320], [3320, 4330], [3330, 4340],
  [3340, 4350], [3360, 4340], [3410, 4340], [3420, 4350], [3420, 4360],
  [3440, 4360], [3450, 4350], [3500, 4320], [3510, 4320], [3530, 4320],
  [3550, 4300], [3550, 4260], [3560, 4240], [3570, 4220], [3600, 4200],
  [3630, 4190], [3660, 4180], [3680, 4170], [3680, 4170], [3680, 4140],
  [3680, 4120], [3720, 4120], [3730, 4110], [3770, 4070], [3790, 4050],
  [3790, 4040], [3770, 4040], [3750, 4040], [3740, 4040], [3720, 4030],
  [3710, 4010], [3700, 4000], [3680, 3990], [3650, 3990], [3610, 3990],
  [3600, 3990], [3590, 3980], [3580, 3980], [3570, 3990], [3550, 4000],
  [3510, 4000], [3480, 4000], [3470, 4020], [3460, 4030], [3440, 4050],
  [3410, 4060], [3390, 4060], [3370, 4030], [3360, 4010], [3340, 3990],
  [3330, 3990], [3290, 3990], [3280, 3960], [3290, 3940], [3300, 3930],
  [3320, 3900], [3330, 3890], [3360, 3890], [3360, 3880], [3360, 3830],
  [3360, 3800], [3380, 3800], [3400, 3790], [3430, 3800], [3440, 3800],
  [3460, 3800], [3510, 3800], [3540, 3800], [3560, 3790], [3580, 3780],
  [3590, 3760], [3600, 3740], [3610, 3710], [3630, 3700], [3660, 3680],
  [3680, 3670], [3680, 3680], [3680, 3700], [3690, 3740], [3700, 3760],
  [3720, 3770], [3740, 3780], [3780, 3800], [3800, 3800], [3830, 3800],
  [3860, 3800], [3880, 3790], [3910, 3780], [3930, 3780], [3950, 3780],
  [3970, 3800], [4000, 3800],
  ];

var polyline = L.polyline(convertPathLoc(latlngs), {
  color: 'red',
  linecap: 'round',
  linjoin: 'round'
}).addTo(map);
// ----------------------------------------------------------------------------------------------------------

ordemCategorias.forEach(cat => {
  if (grupos[cat]) {
    listaDiv.appendChild(criarCategoria(cat, grupos[cat]));
  }
});

for (let tipo in grupos) {
  if (!ordemCategorias.includes(tipo)) {
    listaDiv.appendChild(criarCategoria(tipo, grupos[tipo]));
  }
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

  document.querySelectorAll('.eye-icon').forEach(eyeIcon => {
    eyeIcon.innerHTML = visible ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash gray"></i>';
  });

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

function atualizarIcones() {
  const zoom = map.getZoom();
  const minZoom = map.getMinZoom();

  for (let tipo in grupos) {
    grupos[tipo].forEach(marker => {
      const scale = (zoom - minZoom) * 5 + 23;
      const newSize = Math.floor(scale);
      const iconUrl = marker.options.icon.options.iconUrl;

      const newIcon = criarIcone(iconUrl, newSize);
      marker.setIcon(newIcon);
    });
  }
}

map.on("zoom", atualizarIcones);

const searchInput = document.getElementById("searchMarkers");

let marcadoresEncontrados = new Set();

function limparPesquisa() {
  searchInput.value = "";
  marcadoresEncontrados.clear();
  
  for (let tipo in grupos) {
    grupos[tipo].forEach(marker => {
      if (marker._visivel) {
        marker.addTo(map);
      } else {
        if (map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      }
    });
  }
  
  document.querySelectorAll(".categoria li").forEach(li => {
    li.style.display = "";
  });
  
  document.querySelectorAll(".categoria").forEach(categoria => {
    categoria.style.display = "";
  });
}

searchInput.addEventListener("input", () => {
  const termo = searchInput.value.toLowerCase();
  const pesquisaAtiva = termo.length > 0;

  if (!pesquisaAtiva) {
    marcadoresEncontrados.clear();
    for (let tipo in grupos) {
      grupos[tipo].forEach(marker => {
        if (marker._visivelUsuario) {
          marker.addTo(map);
        } else {
          map.removeLayer(marker);
        }
      });
    }

    document.querySelectorAll(".categoria li").forEach(li => li.style.display = "");
    document.querySelectorAll(".categoria").forEach(categoria => categoria.style.display = "");

    map.setZoom(0);
    return;
  }

for (let tipo in grupos) {
  grupos[tipo].forEach(marker => {
    if (!marker._visivelUsuario && map.hasLayer(marker)) {
      map.removeLayer(marker);
    }
  });
}

  document.querySelectorAll(".categoria").forEach(categoria => {
    let algumVisivel = false;
    const tipo = categoria.dataset.tipo;

    categoria.querySelectorAll("li").forEach(li => {
      const texto = li.textContent.toLowerCase();
      const marker = grupos[tipo]?.find(m => m._li === li);
      const temNasTags = marker && marker._tags && marker._tags.some(tag => tag.toLowerCase().includes(termo));
      const correspondeAPesquisa = texto.includes(termo) || temNasTags;

      if (correspondeAPesquisa) {
        li.style.display = "";
        algumVisivel = true;

        if (marker) {
          marcadoresEncontrados.add(marker);
          marker.addTo(map);
        }
      } else {
        li.style.display = "none";
      }
    });

    categoria.style.display = algumVisivel ? "" : "none";

    if (categoria.children[0].children[0].textContent.toLowerCase().includes(termo)) {
      categoria.style.display = "";
      categoria.querySelectorAll("li").forEach(li => {
        li.style.display = "";
        const marker = grupos[tipo]?.find(m => m._li === li);
        if (marker) marker.addTo(map);
      });
    }
  });
});