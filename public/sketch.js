// Set up the map
console.log('Initializing map...');

try {
    const map = L.map('map').setView([54.5, -2], 6); // Centered on the UK
    console.log('Map created:', map);

    // Add the map tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://leafletjs.com" title="A JavaScript library for interactive maps">Leaflet</a>'
    }).addTo(map);

    console.log('Map tiles added');

    // Update debug message
    const debugEl = document.getElementById('debug');
    if (debugEl) {
        debugEl.textContent = 'Map loaded successfully!';
        setTimeout(() => {
            debugEl.style.display = 'none';
        }, 3000);
    }
} catch (error) {
    console.error('Error initializing map:', error);
    const debugEl = document.getElementById('debug');
    if (debugEl) {
        debugEl.textContent = 'Error loading map: ' + error.message;
        debugEl.style.color = 'red';
    }
}