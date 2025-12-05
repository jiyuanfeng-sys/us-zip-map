// Initialize map centered on USA
const map = L.map('map').setView([39.5, -98.35], 4);

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Global variables
let zipLayer = null;
let highlighted = new Set();

// Load GeoJSON
fetch('./us_zcta_simplified.geojson')
  .then(r => r.json())
  .then(data => {

    const zipField = 'ZCTA5CE20'; // 根据你的 GeoJSON 修改

    // Style function
    function style(feature) {
      const z = feature.properties[zipField];
      const isHi = highlighted.has(String(z).padStart(5,'0'));
      return {
        color: isHi ? '#ff3333' : '#666',
        weight: isHi ? 2.5 : 0.5,
        fillColor: isHi ? '#ffaaaa' : '#f2f2f2',
        fillOpacity: isHi ? 0.7 : 0.5
      };
    }

    // Tooltip
    function onEachFeature(feature, layer) {
      const z = feature.properties[zipField];
      layer.bindTooltip(String(z), {sticky:true});
    }

    // Add GeoJSON to map
    zipLayer = L.geoJSON(data, { style, onEachFeature }).addTo(map);

    // Fit bounds
    map.fitBounds(zipLayer.getBounds());
  })
  .catch(err => console.error('Failed to load GeoJSON:', err));

// Highlight ZIPs button
document.getElementById('applyBtn').addEventListener('click', () => {
  const txt = document.getElementById('zipInput').value;
  const arr = txt.split(',')
                 .map(s => s.trim())
                 .filter(s => s.length>0)
                 .map(s => String(s).padStart(5,'0'));
  highlighted = new Set(arr);

  if (zipLayer) {
    zipLayer.setStyle(feature => {
      const zipField = 'ZCTA5CE20';
      const z = feature.properties[zipField];
      const isHi = highlighted.has(String(z).padStart(5,'0'));
      return {
        color: isHi ? '#ff3333' : '#666',
        weight: isHi ? 2.5 : 0.5,
        fillColor: isHi ? '#ffaaaa' : '#f2f2f2',
        fillOpacity: isHi ? 0.7 : 0.5
      };
    });

    // Zoom to first highlighted ZIP
    if (arr.length>0) {
      let found = false;
      zipLayer.eachLayer(layer => {
        const z = layer.feature.properties['ZCTA5CE20'];
        if (String(z).padStart(5,'0') === arr[0]) {
          map.fitBounds(layer.getBounds(), { maxZoom: 13 });
          found = true;
        }
      });
      if (!found) alert('ZIP code not found: ' + arr[0]);
    }
  }
});
