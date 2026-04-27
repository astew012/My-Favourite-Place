# Postcards from the Mind

An interactive map-based artwork where users pin places that matter to them, speak about how those places make them feel, and leave glowing emotional traces for others to explore.

## How it works

1. Click anywhere on the map to select a place
2. Record how it makes you feel using the voice recorder
3. The sentiment of your words determines the colour of your glow
4. Submit to leave your mark on the map
5. Click any glow to explore postcards left by others


## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your Stadia Maps API key: (website here https://docs.stadiamaps.com/authentication/)
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

## Browser support

Currently designed for **Chrome on desktop only**. The Web Speech API (`webkitSpeechRecognition`) is not supported in Firefox, Safari, or on mobile browsers.

The map tiles max out at zoom level 16 — zooming in beyond this will show a blank map.

## Technologies

- **Backend**: Node.js, Express, Socket.IO
- **Mapping**: Leaflet.js with Stadia Maps (Stamen Watercolor tiles)
- **Creative layer**: p5.js for animated glow rendering
- **Sentiment analysis**: ml5.js
- **Voice**: Web Speech API
- **Real-time**: Socket.IO for shared live experience

## Future improvements

- **More specific place names** — the Nominatim API (OpenStreetMap) often returns broad areas (e.g. "County Wicklow") rather than specific landmarks. A more precise alternative like the Google Places API or Mapbox Geocoding API would return named locations, parks, and points of interest
- **Better place images** — Wikipedia thumbnails are inconsistent. The Google Places Photos API or Flickr API would give more reliable and visually interesting imagery.

- **Mobile support** — currently Chrome desktop only due to the Web Speech API; a fallback text input would open it up to other browsers and devices

- **Animated glow on map pan** — the p5 glows stay fixed to screen coordinates during a pan drag; binding a redraw to Leaflet's `move` event would keep them aligned while navigating

## Attribution

- Map tiles: Stadia Maps, Stamen Design, OpenStreetMap contributors
- Place names and images: Nominatim / Wikipedia APIs


