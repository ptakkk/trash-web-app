import fs from "fs";
import osmtogeojson from "osmtogeojson";

const overpassURL = "https://overpass-api.de/api/interpreter";

async function downloadStreets() {

  const query = `
[out:json][timeout:120];
area(3602989158)->.searchArea;

way["highway"]["name"](area.searchArea);

out geom;
`;

  const res = await fetch(overpassURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "data=" + encodeURIComponent(query)
  });

  const data = await res.json();

  const geo = osmtogeojson(data);

  const excludedHighways = [
		"platform",
		"service",
		"footway",
		"parking",
		"path",
		"cycleway",
		"pedestrian"
	];

	geo.features = geo.features.filter(f =>
		f.properties.name && !excludedHighways.includes(f.properties.highway)
	);

  fs.writeFileSync(
    "./data/streets_poznan.geojson",
    JSON.stringify(geo, null, 2)
  );

  console.log("GeoJSON zapisany");
}

downloadStreets();