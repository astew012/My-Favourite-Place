// ── ML5 Sentiment ── // Load the sentiment model when the page loads because it can take a moment to initialise. 
let sentiment;
window.addEventListener('load', function() {
    if (typeof ml5 !== 'undefined') {
        ml5.sentiment('movieReviews', function(error, model) {
            if (error) { console.log('ML5 error:', error); return; }
            sentiment = model;
        });
    }
});

//  Pins array 
let pins = [];
let pendingPin = null;

// ── Socket.IO client ──
const socket = io();

// Receive initial pins from server
socket.on('init', (serverPins) => {
    for (let pin of serverPins) {
        pins.push(pin);
        addPinMarker(pin);
    }
});

// Listen for new pins added by other clients
socket.on('pin-added', (pin) => {
    if (!pins.find(p => p.timestamp === pin.timestamp)) {
        pins.push(pin);
        addPinMarker(pin);
    }
});

// Add a Leaflet marker with popup for a pin and an invisible divIcon to allow custom styling. The popup content includes the image, place name, and any text the user added.
function addPinMarker(pin) {
    const content = `
        <img class="postcard-image" src="${pin.imageUrl || 'https://picsum.photos/220/130'}"/>
        <div class="postcard-body">
            <div class="postcard-place">${pin.placeName}</div>
            ${pin.text ? `<div class="postcard-text">"${pin.text}"</div>` : ''}
        </div>
    `;
    const invisible = L.divIcon({ className: '', iconSize: [20, 20] });
    L.marker([pin.lat, pin.lng], { icon: invisible })
        .bindPopup(content)
        .addTo(map);
}

// ── Map setup ── //This was from the Leaflet quick start guide, with the addition of a second tile layer for labels only, which allows the map to be more visible and less cluttered. The initial view is set to show all of the UK.
const map = L.map('map').setView([54.5, -2], 6);

L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {
    minZoom: 1, maxZoom: 16,
    attribution: '&copy; Stadia Maps &copy; Stamen Design &copy; OpenStreetMap contributors',
    ext: 'jpg'
}).addTo(map);

L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}.{ext}', {
    minZoom: 1, maxZoom: 16,
    attribution: '© Stadia Maps © Stamen Design © OpenStreetMap',
    ext: 'png', opacity: 0.4
}).addTo(map);

//get place name from lat/lng using Nominatim API This was with help from Claude.
async function getPlaceName(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    const addr = data.address;
    return addr.nature_reserve || addr.park || addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Unknown Place';
}
//get image from wikipedia API using place name
async function getWikipediaImage(placeName) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.thumbnail && data.thumbnail.source) return data.thumbnail.source;
    return null;
}
//get emotion and colour from sentiment score
function getEmotionFromScore(score) {
    if (score < 0.35) return { emotion: 'melancholic', colour: '#6096B4' };
    if (score < 0.5)  return { emotion: 'peaceful',    colour: '#93BFCF' };
    if (score < 0.7)  return { emotion: 'happy',       colour: '#BDCF93' };
    return                   { emotion: 'joyful',      colour: '#E9B384' };
}

//  Map click 
map.on('click', async function(e) {
    const { lat, lng } = e.latlng;

    const placeName = await getPlaceName(lat, lng);
    const imageUrl = await getWikipediaImage(placeName);

    // store as pending until user hits submit, with a default colour
    pendingPin = {
        lat, lng, placeName,
        imageUrl: imageUrl || null,
        colour: '#93BFCF',
        timestamp: Date.now()
    };

    document.getElementById('popup-place-name').textContent = placeName;
    document.getElementById('popup-image').src = imageUrl || 'https://picsum.photos/320/180';
    document.getElementById('transcript').textContent = '';
    document.getElementById('transcript').style.color = '';
    document.getElementById('popup').classList.remove('hidden');
});

// ── Submit pin ──
document.getElementById('submit-button').addEventListener('click', function() {
    if (!pendingPin) return;
    socket.emit('new-pin', pendingPin);
    pins.push(pendingPin);
    addPinMarker(pendingPin);
    pendingPin = null;
    document.getElementById('popup').classList.add('hidden');
});

// ── Close popup ──
document.getElementById('popup-close').addEventListener('click', function() {
    document.getElementById('popup').classList.add('hidden');
});

// ── Voice recognition ── // This uses the Web Speech API to capture the user's voice input when they click the microphone button. This was with help from Claude. 
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-GB';
let isListening = false;

document.getElementById('mic-button').addEventListener('click', function() {
    if (isListening) return;
    isListening = true;
    recognition.start();
    document.getElementById('mic-button').textContent = '🔴 Listening...';
    document.getElementById('stop-button').style.display = 'block';
    document.getElementById('transcript').textContent = '';
});

document.getElementById('stop-button').addEventListener('click', function() {
    recognition.stop();
    isListening = false;
    document.getElementById('stop-button').style.display = 'none';
    document.getElementById('mic-button').textContent = '🎤 Start recording';
});

recognition.onresult = function(event) {
    let interimText = '';
    let finalText = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
        } else {
            interimText += event.results[i][0].transcript;
        }
    }

    // show live interim text as you speak, or final once confirmed
    document.getElementById('transcript').textContent = finalText || interimText;

    // only run sentiment on the final confirmed text
    if (finalText && sentiment && pendingPin) {
        const result = sentiment.predict(finalText);
        const { emotion, colour } = getEmotionFromScore(result.score);
        pendingPin.emotion = emotion;
        pendingPin.colour = colour;
        pendingPin.text = finalText;
        document.getElementById('transcript').style.color = colour;
    }
};

recognition.onerror = function(event) {
    console.log('Speech error:', event.error);
    document.getElementById('stop-button').style.display = 'none';
    document.getElementById('mic-button').textContent = '🎤 Start recording';
    isListening = false;
};

// P5 Sketch to draw glowing circles behind the Leaflet markers based on the emotion colour. The glow pulses using a sine wave for a subtle animation effect.
function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-canvas');
}

function draw() {
    clear();
    for (let pin of pins) {
        let screen = map.latLngToContainerPoint([pin.lat, pin.lng]);
        drawGlow(screen.x, screen.y, pin.colour || '#93BFCF');
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function drawGlow(x, y, colour) {
    push();
    noStroke();
    let c = color(colour);

    // Pulsing outer glow
    let maxR = 25 + sin(frameCount * 0.02) * 8;
    for (let r = maxR; r > 0; r -= 2) {
        let alpha = (r / maxR) * 40;
        fill(red(c), green(c), blue(c), alpha);
        ellipse(x, y, r * 2, r * 2);
    }

    
    noStroke();
    fill(red(c), green(c), blue(c), 180);
    ellipse(x, y, 5, 5);

    pop();
}
