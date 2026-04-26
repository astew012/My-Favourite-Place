# My Favourite Place

An interactive web application that allows users to mark their favourite places on a map in real-time.

## Features

- Interactive Leaflet map centered on the UK
- Real-time pin placement with Socket.IO
- Express server backend
- Debug functionality for development

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node server.js
   ```

3. Open your browser to `http://localhost:3000`

## Project Structure

```
MyFavouritePlace/
├── server.js          # Express server with Socket.IO
├── package.json       # Dependencies and scripts
├── public/            # Client-side files
│   ├── index.html     # Main HTML page
│   ├── sketch.js      # Map initialization and logic
│   └── style.css      # Styling
└── .gitignore         # Git ignore rules
```

## Technologies Used

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: HTML5, CSS3, JavaScript
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Real-time**: Socket.IO for live updates

## Development

The application includes debug functionality that shows loading status and error messages. Check the browser console for additional debugging information.

## Future Enhancements

- User authentication
- Persistent pin storage
- Pin categories and descriptions
- Mobile responsiveness improvements
- Pin clustering for performance

## License

This project is part of a Creative Coding assignment.