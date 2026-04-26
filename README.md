# Postcards of the Mind

An interactive map-based artwork where users pin places that matter to them, speak about how those places make them feel, and leave glowing emotional traces for others to explore.

## How it works

1. Click anywhere on the map to select a place
2. Record how it makes you feel using the voice recorder
3. The sentiment of your words determines the colour of your glow
4. Submit to leave your mark on the map
5. Click any glow to explore postcards left by others

## Emotion colours

| Colour | Emotion |
|--------|---------|
| Blue `#6096B4` | Melancholic |
| Light blue `#93BFCF` | Peaceful |
| Green `#BDCF93` | Happy |
| Warm orange `#E9B384` | Joyful |

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your Stadia Maps API key:
   ```
   STADIA_API_KEY=your_key_here
   ```

3. Start the server:
   ```bash
   node server.js
   ```

4. Open your browser to `http://localhost:3000`

## Project Structure

```
MyFavouritePlace/
├── server.js          # Express server with Socket.IO, saves pins to pins.json
├── pins.json          # Persistent store of all submitted pins
├── package.json       # Dependencies
├── public/
│   ├── index.html     # Main HTML
│   ├── sketch.js      # Map logic, p5 glow layer, voice recognition, sentiment
│   └── style.css      # Postcard aesthetic styling
└── .env               # API keys (not committed)
```

## Technologies

- **Backend**: Node.js, Express, Socket.IO
- **Mapping**: Leaflet.js with Stadia Maps (Stamen Watercolor tiles)
- **Creative layer**: p5.js for animated glow rendering
- **Sentiment analysis**: ml5.js
- **Voice**: Web Speech API
- **Real-time**: Socket.IO for shared live experience

## Attribution

- Map tiles: Stadia Maps, Stamen Design, OpenStreetMap contributors
- Place names and images: Nominatim / Wikipedia APIs

## License

Creative Coding Masters assignment — Anna Stewart, 2025–27
