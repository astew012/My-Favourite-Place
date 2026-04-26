
// Set up ML5 sentiment
let sentiment;

window.addEventListener('load', function() {
    ml5.sentiment('movieReviews', function(error, model) {
        if (error) {
            console.log('ML5 error:', error);
            return;
        }
        sentiment = model;
        console.log('ML5 sentiment model ready!');
    });
});

// Cache DOM elements
const popup = document.getElementById('popup');
const popupPlaceName = document.getElementById('popup-place-name');
const popupImage = document.getElementById('popup-image');
const transcriptEl = document.getElementById('transcript');
const micButton = document.getElementById('mic-button');
const stopButton = document.getElementById('stop-button');
const popupCloseButton = document.getElementById('popup-close');

// Set up the map
const map = L.map('map').setView([54.5, -2], 6);

// Watercolour map tiles from Stamen
L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}', {
    minZoom: 1,
    maxZoom: 16,
    attribution: '&copy; Stadia Maps &copy; Stamen Design &copy; OpenStreetMap contributors',
    ext: 'jpg'
}).addTo(map);

// Label layer on top
L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}.{ext}', {
    minZoom: 1,
    maxZoom: 16,
    attribution: '© Stadia Maps © Stamen Design © OpenStreetMap',
    ext: 'png',
    opacity: 0.4
}).addTo(map);

// Turn coordinates into a place name
async function getPlaceName(lat, lng) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
        const response = await fetch(url);
        const data = await response.json();
        const addr = data.address || {};
        return addr.nature_reserve || addr.park || addr.leisure ||
               addr.city || addr.town || addr.village ||
               addr.suburb || addr.county || 'Unknown Place';
    } catch (error) {
        console.log('Place name error:', error);
        return 'Unknown Place';
    }
}

// Get a Wikipedia image for the place
async function getWikipediaImage(placeName) {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.thumbnail && data.thumbnail.source) {
            return data.thumbnail.source;
        }
    } catch (error) {
        console.log('Wikipedia image error:', error);
    }
    return null;
}

// When the map is clicked
map.on('click', async function(e) {
    console.log('Map clicked at:', e.latlng);
    const { lat, lng } = e.latlng;
    console.log('Getting place name...');
    const placeName = await getPlaceName(lat, lng);
    console.log('Place name:', placeName);
    const imageUrl = await getWikipediaImage(placeName);
    console.log('Image URL:', imageUrl);

    popupPlaceName.textContent = placeName;
    popupImage.src = imageUrl || 'https://picsum.photos/320/180';
    transcriptEl.textContent = '';
    popup.classList.remove('hidden');
    console.log('Popup shown');
});

// Close popup
popupCloseButton.addEventListener('click', function() {
    popup.classList.add('hidden');
});

popup.addEventListener('click', function(event) {
    if (event.target === popup) {
        popup.classList.add('hidden');
    }
});

// Set up voice recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isListening = false;

if (!SpeechRecognition) {
    console.log('Speech recognition not supported in this browser.');
    micButton.textContent = '🎤 Not supported';
    micButton.disabled = true;
    stopButton.classList.add('hidden');
} else {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-GB';

    micButton.addEventListener('click', function() {
        if (isListening) return;
        isListening = true;
        recognition.start();
        micButton.textContent = '🔴 Listening...';
        stopButton.classList.remove('hidden');
        transcriptEl.textContent = '';
    });

    stopButton.addEventListener('click', function() {
        recognition.stop();
        isListening = false;
        stopButton.classList.add('hidden');
        micButton.textContent = '🎤 Speak';
    });

    recognition.onresult = function(event) {
        const spokenText = event.results[0][0].transcript;
        transcriptEl.textContent = spokenText;
        stopButton.classList.add('hidden');
        micButton.textContent = '🎤 Speak';
        isListening = false;
        console.log('You said:', spokenText);

        if (sentiment) {
            const result = sentiment.predict(spokenText);
            console.log('Sentiment score:', result.score);

            let colour;
            if (result.score < 0.35) {
                colour = '#6096B4';
            } else if (result.score < 0.5) {
                colour = '#93BFCF';
            } else if (result.score < 0.7) {
                colour = '#BDCF93';
            } else {
                colour = '#E9B384';
            }

            transcriptEl.style.color = colour;
        }
    };

    recognition.onerror = function(event) {
        console.log('Speech error:', event.error);
        stopButton.classList.add('hidden');
        micButton.textContent = '🎤 Speak';
        isListening = false;
    };
}
