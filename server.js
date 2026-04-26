require('dotenv').config();
const fetch = require('node-fetch');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const PINS_FILE = path.join(__dirname, 'pins.json');

// Load existing pins or start with empty array
function loadPins() {
    try {
        if (fs.existsSync(PINS_FILE)) {
            return JSON.parse(fs.readFileSync(PINS_FILE, 'utf8'));
        }
    } catch (e) {
        console.log('No pins file yet, starting fresh');
    }
    return [];
}

// Save pins to file
function savePins(pins) {
    fs.writeFileSync(PINS_FILE, JSON.stringify(pins, null, 2));
}

let pins = loadPins();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Proxy tile requests to avoid CORS issues
app.get('/tiles/:z/:x/:y', async (req, res) => {
    const { z, x, y } = req.params;
    const apiKey = process.env.STADIA_API_KEY;
    const url = `https://tiles.stadiamaps.com/tiles/stamen_watercolor/${z}/${x}/${y}.jpg?api_key=${apiKey}`;
    
    const response = await fetch(url);
    const buffer = await response.buffer();
    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
});


io.on('connection', (socket) => { 
    console.log('a user connected');

    socket.emit('init', pins);

    socket.on('new-pin', (pin) => {
        pins.push(pin);
        savePins(pins);
        io.emit('pin-added', pin);
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

server.listen(3000, () => {
  console.log('\n========================================');
  console.log('🌍 Server running at:');
  console.log('   http://localhost:3000');
  console.log('========================================\n');
});
});
