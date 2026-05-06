const colors = ['#cc0505','#ff8c21','#f7b62b','#b8cf3f','#78b95a', '#9b30ff'];
const streetsByDay = {};
const keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e.preventDefault();
}
function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}
// modern Chrome requires { passive: false } when adding event
let supportsPassive = false;
try {
  window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function () { supportsPassive = true; } 
  }));
} catch(e) {}
let wheelOpt = supportsPassive ? { passive: false } : false;
let wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
// call this to Disable
function disableScroll() {
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}
// call this to Enable
function enableScroll() {
  window.removeEventListener('DOMMouseScroll', preventDefault, false);
  window.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
  window.removeEventListener('touchmove', preventDefault, wheelOpt);
  window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}
function reloadScrollBars() {
    document.documentElement.style.overflow = 'auto';  // firefox, chrome
    document.body.scroll = "yes"; // ie only
}
function unloadScrollBars() {
    document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    document.body.scroll = "no"; // ie only
}
unloadScrollBars();
//disableScroll();

const toggle = document.getElementById("toggle-panel")
const panel = document.getElementById("side-panel")

toggle.addEventListener("click", () => {
    panel.classList.toggle("hidden")
})

let map;

document.querySelector('#clear-button').addEventListener('click', () => {
  layers.forEach(layer => layer.remove());
  console.log('cleared');
  
})

document.addEventListener('DOMContentLoaded', () => {
    loadMap();
    let mapZoomControls = document.querySelector('div.leaflet-top:nth-child(1)');
    // map = document.getElementById('map');
    // map.style.position = '';
    mapZoomControls.style.visibility = 'hidden';
});

const checkboxes = document.querySelectorAll('.day-checkbox');
const checkboxLabels = document.querySelectorAll('.checkbox-label');
const dayRows = document.querySelectorAll('.day-row');

checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', (e) => {
    //e.target.id, e.target.checked
    //show or hide on map
})});

let activeRow = null;

dayRows.forEach((row, index) => {
  row.addEventListener('click', (e) => {
    if (e.target.closest('input, .street-list-element')) return;

    const list = row.querySelector('.street-list');
    const streets = streetsByDay[index] || [];

    if (activeRow === row) {
      row.classList.remove('active');
      list.classList.remove('active');
      activeRow = null;
      return;
    }
    if (activeRow) {
      activeRow.classList.remove('active');
      activeRow.querySelector('.street-list')?.classList.remove('active');
    }
    if (list.children.length === 0) {
      streets.forEach(street => {
        const li = document.createElement('li');
        li.classList.add('street-list-element');
        li.textContent = street;
        list.appendChild(li);
      });

    }
    row.classList.add('active');
    list.classList.add('active');
    activeRow = row;

  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.day-row') && activeRow) {
    activeRow.classList.remove('active');
    activeRow.querySelector('.street-list')?.classList.remove('active');
    activeRow = null;
  }
});


function initStreetListeners() {
  document.getElementById('trash-list-div').addEventListener('click', (e) => {
    const li = e.target.closest('.street-list-element');
    if (!li) return;
    console.log(li.textContent);
    addToMap(li.textContent, colors[5], true, false);
  });
}

initStreetListeners();

let form = document.querySelector('#street-input-form');
let input = document.querySelector('#street-input');

form.addEventListener('submit', (e) => {
  console.log(input.value);
  console.log(e.cancelable);
  e.preventDefault();

  if(!input.value) {return}

  let streetName = input.value;
  console.log(streetName);
  addToMap(streetName, colors[5], true, true);
  
  //addAllStreets();
  //fetchStreetsWithDates({street: streetName});
});

function loadMap() {
    map = L.map('map', {
      renderer: L.canvas(),
      // smoothFactor: 2
    }).setView([52.40270467269032, 16.93801440270164], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
};

const layers = [];
let layerGroup = L.layerGroup();

function addToMap(streetName, color, shouldRedirect = false, shouldAdd = false) {
  const data = getStreetData(streetName)
  const layer = L.geoJSON(data, {style: { color: color } })
  layerGroup.addLayer(layer);
  layers.push(layer);

  if (shouldAdd) {
    layer.addTo(map);
  }
  //console.log(data);
  //map.fitBounds(layer.getBounds());
  const bounds = layer.getBounds();

  if (shouldRedirect) {
    setTimeout(() => {
      map.flyToBounds(bounds, {
        duration: 1.6
      });
    }, 200);
  }
};

let streetsJSONData;
let streetIndex;

async function loadStreetsJSONData() {
  const res = await fetch("/data/streets_poznan.geojson");
  streetsJSONData = await res.json();

  streetIndex = buildStreetIndex(streetsJSONData);
};

function getStreetData(name) {
  return streetsJSONData.features.filter(f =>
    f.properties.name === name
  );
};

await loadStreetsJSONData();

//TODO: delete later
async function addAllStreets() {
  const streets = await fetch("/data/streets_poznan.geojson")
  .then(r => r.json());

  L.geoJSON(streets).addTo(map);
};

let currentDate = new Date();
//console.log(currentDate);

function checkNext5Days() {
  let nextDaysArray = [];
  for (let i = 0; i < 5; i++) {
    let day = new Date();
    day.setDate(currentDate.getDate() + i);
    nextDaysArray.push(day);
  }
  return nextDaysArray;
};

async function fetchStreetsWithDates({street, date}) {
  const params = new URLSearchParams();
  if (street) params.append('street', street);
  if (date) params.append('date', date);

  const response = await fetch(`/api/streets?${params.toString()}`);
  const data = await response.json();
  return data;
};

function toUpperCaseFirstLetter(streetName) {
  return streetName.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

function formatStreetCount(count) {
  if (count === 1) return '1 ulica';
  if (count >= 2 && count <= 4) return `${count} ulice`;
  return `${count} ulic`;
}

async function getFutureGarbageCollection() {
  let futureDaysArray = checkNext5Days();

  const isoDates = futureDaysArray.map(day => day.toISOString().split('T')[0]);
  const dataArray = await Promise.all(isoDates.map(day => fetchStreetsWithDates({date: day})));
  
  for (let i = 0; i < dataArray.length; i++) {
    const data = dataArray[i];
    if (data.length == 0) continue;
    
    const grouped = Object.groupBy(data, ({street_name}) => street_name);

    const dataReducer = (el1, el2) => ({street_name: el2.street_name, street_number: [...el1.street_number,el2.street_number]});
    let result = [];

    for (const property in grouped) {
      const reduced = grouped[property].reduce(dataReducer ,{street_number: []});
      result.push(reduced);
    }
    
    streetsByDay[i] = result.map(item =>
      toUpperCaseFirstLetter(item.street_name));
    
    const count = result.length;
    const span = dayRows[i].querySelector('.no-of-streets');
    span.textContent = formatStreetCount(count);

    for (const item of result) {
      //console.log(result);
      let streetName =  toUpperCaseFirstLetter(item.street_name);
      const color = colors[i];
      console.log(streetName + ' added to map')
      addToMap(streetName, color, false, true);
    }
  }
};

getFutureGarbageCollection();

//fetch("https://overpass-api.de/api/status").then(res => console.log(res)) //api status

function buildStreetIndex(geojson) {
  const index = {};

  geojson.features.forEach(feature => {
    const name = feature.properties.name?.toLowerCase();
    if (!name) return;

    if (!index[name]) {
      index[name] = [];
    }
    index[name].push(feature);
  });
  return index;
};

// to do autocomplete
function searchStreet(prefix) {
  prefix = prefix.toLowerCase();

  return Object.keys(streetIndex)
    .filter(name => name.toLowerCase().includes(prefix));
    // .slice(0, 10);
};

function findStreet(name) {
  return streetIndex[name.toLowerCase()] || [];
}
