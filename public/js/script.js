//wyswietlanie ulic w zaleznosci ile dni do wywozki, np 3dni do wywozki kolor zielony, 2dni zolty, 1dzien czerwony
//panel ladniejszy zrobic, wysuwany z boku moze
//autodopasowanie w pasku wyszukiwania
//focus na dana ulice przy wyszukiwaniu
// const PURPLE = '#7700ffff'
// const RED = '#cc0505'
// const ORANGE = '#e28924'
// const GREEN = '#78b95a'

const colors = [
  '#cc0505',
  '#ff8c21',
  '#f7b62b',
  '#b8cf3f',
  '#78b95a',
  '#9b30ff'
];

let keys = {37: 1, 38: 1, 39: 1, 40: 1};
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

const dayLists = document.querySelectorAll('.day-row');

dayLists.forEach(daylist => {
  daylist.addEventListener('click', (e) => {
    if (e.target.tagName === 'INPUT') return;

    let list = daylist.querySelector('.street-list');

    if (!list) {
      list = document.createElement('ul');
      list.classList.add('street-list');
      list.classList.toggle('active');
      
      let streets = ['dupa', 'dupa 2', 'dupa 3'];
      streets.forEach(street => {
        const li = document.createElement('li');
        li.textContent = street;
        list.appendChild(li);
      });
      
      daylist.appendChild(list);
    } else {
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

  if(!input.value) {
    return
  }

  let streetName = input.value;
  console.log(streetName);
  addToMap(streetName, colors[5]);

  
  //checkDifferenceInCalendarDays(currentDate, testDate);

  //fetchStreetsWithDates({street: streetName});
});

//delete later
let geoJSON = {
  "type": "FeatureCollection",
  "generator": "overpass-turbo",
  "copyright": "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.",
  "timestamp": "2025-11-18T19:52:00Z",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "@id": "way/37094082",
        "highway": "residential",
        "highway:category:pl": "4",
        "highway:owner": "ZDM Poznań",
        "lit": "yes",
        "maxspeed": "30",
        "name": "Adama Asnyka",
        "oneway": "yes",
        "oneway:bicycle": "no",
        "res": "residential",
        "source:highway:category": "ZDM Poznań",
        "source:highway:category:url": "http://www.zdm.poznan.pl/content/pliki/Spis_drog_publicznych_w_administarcji_ZDM_stan_na_luty_2016.pdf",
        "source:maxspeed": "PL:zone30",
        "surface": "asphalt"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [
            16.905258,
            52.4098024
          ],
          [
            16.9052763,
            52.4098595
          ],
          [
            16.9056083,
            52.4104666
          ],
          [
            16.9058374,
            52.4109133
          ],
          [
            16.9058718,
            52.4109759
          ]
        ]
      },
      "id": "way/37094082"
    },
    {
      "type": "Feature",
      "properties": {
        "@id": "way/216489177",
        "cycleway": "opposite",
        "highway": "residential",
        "highway:category:pl": "4",
        "highway:owner": "ZDM Poznań",
        "lit": "yes",
        "maxspeed": "30",
        "name": "Plac Adama Asnyka",
        "oneway": "yes",
        "oneway:bicycle": "no",
        "short_name": "Plac Asnyka",
        "source:highway:category": "ZDM Poznań",
        "source:highway:category:url": "http://www.zdm.poznan.pl/content/pliki/Spis_drog_publicznych_w_administarcji_ZDM_stan_na_luty_2016.pdf",
        "source:maxspeed": "PL:zone30",
        "source:name": "e-MODGiK",
        "surface": "asphalt",
        "teryt:name": "Plac Asnyka"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [
            16.9056083,
            52.4104666
          ],
          [
            16.9056404,
            52.41046
          ],
          [
            16.9061486,
            52.4103581
          ],
          [
            16.9062075,
            52.4103532
          ],
          [
            16.9062723,
            52.4103622
          ],
          [
            16.9063182,
            52.4103793
          ],
          [
            16.9063489,
            52.4104033
          ],
          [
            16.9065487,
            52.4107713
          ],
          [
            16.90656,
            52.4107937
          ],
          [
            16.9065801,
            52.4108335
          ]
        ]
      },
      "id": "way/216489177"
    }
  ]
};

function getOverpassData(streetName) {
  const query = `
  [out:json][timeout:120];
  area(3602989158)->.searchArea;
  (
    way["highway"]["name"~"${streetName}"](area.searchArea);
  );
  (._;>;);
  out skel qt;
  >;
  `;

  return fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "poznan-thrash-app (contact: kacper.ptak00@gmail.com)"
      },
      body: "data=" + encodeURIComponent(query)
  })
  .then(res => res.json())
  .then(data => osmtogeojson(data));
};

function loadMap() {
    map = L.map('map').setView([52.40270467269032, 16.93801440270164], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
};

function addToMap(streetName, color) {
    getOverpassData(streetName)
        .then(data => {L.geoJSON(data, {style: {'color': `${color}`}}).addTo(map);
              console.log(data);
              redirectToBounds(getEdgeCoordsOfStreet(data));
            })
        .catch(err => console.error(err));
};

function redirectToBounds(coords) {
  let bounds = new L.LatLngBounds(coords);
  map.flyToBounds(bounds);
};

function checkDifferenceInCalendarDays(currentDate, futureDate) {
  fetch(`http://localhost:3000/api/diff?from=${currentDate}&to=${futureDate}`)
  .then(res => res.json())
  .then(data => console.log(data));
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

    for (const item of result) {
      let streetName =  toUpperCaseFirstLetter(item.street_name);
      const color = colors[i];
      console.log(streetName + ' added to map')
      //addToMap(streetName, color);
    }
  }
};

getFutureGarbageCollection();

//fetch("https://overpass-api.de/api/status").then(res => console.log(res)) //api status

function getEdgeCoordsOfStreet(street_object) {
  const array = [];
  street_object.features.forEach(street_object => array.push(street_object.geometry.coordinates));
  const coordsArray = array.flat();

  const highestY = coordsArray.reduce((previous, current) => {
    return current[0] > previous[0] ? current : previous;
  });

  const lowestY = coordsArray.reduce((previous, current) => {
    return current[0] < previous[0] ? current : previous;
  });

  const highestX = coordsArray.reduce((previous, current) => {
    return current[1] > previous[1] ? current : previous;
  });

  const lowestX = coordsArray.reduce((previous, current) => {
    return current[1] < previous[1] ? current : previous;
  });
  
  return [[lowestX[1], lowestY[0]], [highestX[1], highestY[0]]];
}
