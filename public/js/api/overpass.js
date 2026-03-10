const overpassURL = "https://overpass-api.de/api/interpreter"

export async function getOverpassData(streetName, retries = 3) {
	const query = `
	[out:json][timeout:25];
	area(3602989158)->.searchArea;

	way["highway"]["name"="${streetName}"](area.searchArea);

	out geom;
	`;

	try {
		const res = await fetch(overpassURL, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: "data=" + encodeURIComponent(query)
		});

		const text = await res.text();

		if (!text.trim().startsWith("{")) {

			if (retries > 0) {
				console.warn("Overpass busy, retrying...");
				await new Promise(r => setTimeout(r, 2000));
				return getOverpassData(streetName, retries - 1);
			}
			throw new Error("Overpass returned non-JSON response");
		}

		const data = JSON.parse(text);
		console.log("raw:", data);
		const geo = osmtogeojson(data);	
		console.log("geojson:", geo);
		return geo;

	} catch (err) {
		console.error("Overpass error:", err);
		return null;
	}
}