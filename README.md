# Relocation Planner App

A relocation planning application to help organize tasks, notes, and apartment hunting when moving to a new city. The app is built with JavaScript, Node.js, Express, and Tailwind CSS.

## Features

- **Task Management**: Create, organize, and track tasks related to your relocation
- **Note Taking**: Store important notes and information
- **Apartment Tracking**: Save apartment listings with links and custom titles
- **Responsive Design**: Works on desktop and mobile devices

## Running Locally

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the CSS:
   ```
   npm run build
   ```
4. Start the server:
   ```
   npm start
   ```
5. Visit `http://localhost:3000` in your browser

## Development Mode

To run the application in development mode with hot reloading:

```
npm run dev
```

## Running on Glitch

This application is optimized to run on Glitch:

1. Import the GitHub repository (`https://github.com/Rorenheim/relocation-app.git`)
2. The application will automatically use `start.sh` to build and run
3. No additional configuration is required

If you need to manually start the application on Glitch:

1. Open the Glitch terminal
2. Run `chmod +x start.sh && ./start.sh`

## API Endpoints

- `GET /api/data` - Get all application data
- `POST /api/data` - Save application data
- `POST /api/scrape-apartment` - Extract title from a URL
- `GET /api/backup` - Download data backup
- `POST /api/restore` - Restore from backup
- `GET /api/info` - Get application status information

## Environmental Variables

- `PORT` - Port to run the server (defaults to 3000)
- `NODE_ENV` - Set to 'production' in production environments

## License

MIT License 