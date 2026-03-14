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

let activeRow = null;

document.querySelectorAll(".day-row").forEach(row => {
    row.addEventListener("click", e => {
        if (activeRow) activeRow.classList.remove("active")
        row.classList.add("active")
        activeRow = row
        e.stopPropagation()
    });
});

document.addEventListener("click", () => {
    if (activeRow){
        activeRow.classList.remove("active")
        activeRow = null
    }
});

let map;

document.addEventListener('DOMContentLoaded', () => {
    loadMap();
    let mapZoomControls = document.querySelector('div.leaflet-top:nth-child(1)');
    // map = document.getElementById('map');
    // map.style.position = '';
    mapZoomControls.style.visibility = 'hidden';
});

const checkboxes = document.querySelectorAll('.day-checkbox');
const checkboxLabels = document.querySelectorAll('.checkbox-label');

checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', (e) => {
    //e.target.id, e.target.checked
    //show or hide on map
})});

const dayLists = document.querySelectorAll("#trash-list-div .day-row");

dayLists.forEach(daylist => {

  daylist.addEventListener('click', (e) => {

    // jeśli kliknięcie było w checkbox / label, ignorujemy toggle
    if (e.target.closest('input')) return;

    const dayIndex = daylist.dataset.dayIndex; // jeśli go nie ma, możesz np. użyć index w forEach
    const index = Array.from(dayLists).indexOf(daylist);

    const streets = streetsByDay[index] || []; // streetsByDay to Twój obiekt z ulicami

    let list = daylist.querySelector('.street-list');

    if (!list) {
      // tworzę listę tylko raz
      list = document.createElement('ul');
      list.classList.add('street-list', 'active');

      streets.forEach(street => {
        const li = document.createElement('li');
        li.textContent = street;
        list.appendChild(li);
      });

      daylist.appendChild(list);

    } else {
      // toggle pokaz/ukryj
      list.classList.toggle('active');
    }
  });

});

let form = document.querySelector('#street-input-form');
let input = document.querySelector('#street-input');

form.addEventListener('submit', (e) => {
  console.log(input.value);
  console.log(e.cancelable);
  e.preventDefault();

  if(!input.value) {return}

  let streetName = input.value;
  console.log(streetName);
  addToMap(streetName, colors[5], true);
  
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

let layer;

function addToMap(streetName, color, shouldRedirect = false) {
  const data = getStreetData(streetName)

  layer = L.geoJSON(data, {style: { color: color } }).addTo(map);
  console.log(data);
  //map.fitBounds(layer.getBounds());
  const bounds = layer.getBounds();

  setTimeout(() => {
    map.flyToBounds(bounds, {
      duration: 1.6
    });
  }, 200);
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
console.log(currentDate);

function checkNext5Days() {
  let nextDaysArray = [];
  for (let i = 0; i < 5; i++) {
    let day = new Date();
    day.setDate(currentDate.getDate() + i);
    nextDaysArray.push(day);
  }
  return nextDaysArray;
};

//checkNext5Days();  //put this in a cron job later

async function fetchStreetsWithDates({street, date}) {
  const params = new URLSearchParams();
  if (street) params.append('street', street);
  if (date) params.append('date', date);

  const response = await fetch(`http://localhost:3000/api/streets?${params.toString()}`);
  const data = await response.json();
  return data;
};

function toUpperCaseFirstLetter(streetName) {
  return streetName.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

async function getFutureGarbageCollection() {
  let futureDaysArray = checkNext5Days();

  for (let i = 0; i < futureDaysArray.length; i++) {
    const day = futureDaysArray[i];
    const isoDate = day.toISOString().split('T')[0];
    const data = await fetchStreetsWithDates({date: isoDate});

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

    for (const item of result) {
      console.log(result);
      let streetName =  toUpperCaseFirstLetter(item.street_name);
      const color = colors[i];
      console.log(streetName + ' added to map')
      //addToMap(streetName, color, false);
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
