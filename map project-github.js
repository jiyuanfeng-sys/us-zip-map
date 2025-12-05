// Initialize the map, center on the USA
const map = L.map('map').setView([39.5, -98.35], 4);

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Global variables
let zipLayer = null;
let highlighted = new Set();

// Load GeoJSON (assuming the file is in the same directory as the HTML)
fetch('us_zcta_simplified.geojson')
  .then(r => r.json())
  .then(data => {
    // Style function
    function style(feature) {
      const z = feature.properties.ZCTA5CE20 || feature.properties.ZCTA5;
      const isHi = highlighted.has(String(z).padStart(5,'0'));
      return {
        color: isHi ? '#ff3333' : '#666',
        weight: isHi ? 2.5 : 0.5,
        fillColor: isHi ? '#ffaaaa' : '#f2f2f2',
        fillOpacity: isHi ? 0.7 : 0.5
      };
    }

    // Bind tooltip
    function onEachFeature(feature, layer) {
      const z = feature.properties.ZCTA5CE20 || feature.properties.ZCTA5;
      layer.bindTooltip(String(z), {sticky:true});
    }

    // Add GeoJSON layer to the map
    zipLayer = L.geoJSON(data, { style, onEachFeature }).addTo(map);

    // Zoom to the bounds of all ZIP areas
    map.fitBounds(zipLayer.getBounds());
  });

// Highlight control button
document.getElementById('applyBtn').addEventListener('click', () => {
  const txt = document.getElementById('zipInput').value;
  const arr = txt.split(',').map(s => s.trim()).filter(s => s.length>0).map(s => String(s).padStart(5,'0'));
  highlighted = new Set(arr);

  if (zipLayer) {
    zipLayer.setStyle(function(feature){
      const z = feature.properties.ZCTA5CE20 || feature.properties.ZCTA5;
      const isHi = highlighted.has(String(z).padStart(5,'0'));
      return {
        color: isHi ? '#ff3333' : '#666',
        weight: isHi ? 2.5 : 0.5,
        fillColor: isHi ? '#ffaaaa' : '#f2f2f2',
        fillOpacity: isHi ? 0.7 : 0.5
      };
    });

    // Zoom to the first highlighted ZIP code
    if (arr.length>0) {
      let found = false;
      zipLayer.eachLayer(layer => {
        const z = layer.feature.properties.ZCTA5CE20 || layer.feature.properties.ZCTA5;
        if (String(z).padStart(5,'0') === arr[0]) {
          map.fitBounds(layer.getBounds(), { maxZoom: 13 });
          found = true;
        }
      });
      if (!found) alert('ZIP code not found: ' + arr[0]);
    }
  }
});
