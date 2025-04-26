const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(compression()); // Compress all responses
app.use(cors()); // Enable CORS for all routes
app.use(express.static('public'));
app.use(bodyParser.json({ limit: '10mb' }));

// Data file path
const DATA_FILE = path.join(__dirname, 'data.json');

// Ensure data file exists with all expected arrays
function initializeDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ tasks: [], notes: [], apartments: [] }, null, 2));
  } else {
    // Ensure existing file has all keys
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if (!data.tasks) data.tasks = [];
      if (!data.notes) data.notes = [];
      if (!data.apartments) data.apartments = [];
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error reading or updating data file, resetting:', err);
      fs.writeFileSync(DATA_FILE, JSON.stringify({ tasks: [], notes: [], apartments: [] }, null, 2));
    }
  }
}
initializeDataFile();

// API Routes
app.get('/api/data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
     // Ensure all arrays exist in the response
     const responseData = {
        tasks: data.tasks || [],
        notes: data.notes || [],
        apartments: data.apartments || []
      };
    res.json(responseData);
  } catch (err) {
    console.error('Error reading data file:', err);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.post('/api/data', (req, res) => {
  try {
     // Ensure all expected arrays are present before writing
    const dataToSave = {
        tasks: req.body.tasks || [],
        notes: req.body.notes || [],
        apartments: req.body.apartments || []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error('Error writing data file:', err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Utility function for ID generation needed by scraping endpoint
const generateId = () => `id_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;

// Simple title fetcher endpoint
app.post('/api/scrape-apartment', async (req, res) => {
  const { url, title: customTitle } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  console.log(`Processing URL: ${url}`);

  try {
    // Extract domain for simple identification
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    // Use custom title if provided, otherwise set default
    let title = customTitle || `Property on ${domain}`;
    
    // Only fetch title from page if custom title not provided
    if (!customTitle) {
      try {
        // Simple GET request with a short timeout
        const response = await axios.get(url, {
          timeout: 5000, 
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        // Parse the HTML
        const $ = cheerio.load(response.data);
        
        // Try to get the title from meta tags first, then from title tag
        const metaTitle = $('meta[property="og:title"]').attr('content') || 
                          $('meta[name="title"]').attr('content');
                          
        const pageTitle = $('title').text().trim();
        
        // Use the best title we found
        if (metaTitle && metaTitle.length > 5) {
          title = metaTitle;
        } else if (pageTitle && pageTitle.length > 5) {
          title = pageTitle;
        }
        
        console.log("Found title:", title);
        
      } catch (fetchError) {
        console.warn("Couldn't fetch page title:", fetchError.message);
        // Continue with the default title
      }
    } else {
      console.log("Using custom title:", customTitle);
    }
    
    res.json({
      success: true,
      metadata: {
        id: generateId(),
        originalUrl: url,
        title: title
      }
    });
    
  } catch (error) {
    console.error(`Error processing ${url}:`, error.message);
    return res.status(500).json({ 
      error: `Invalid URL format. Please check the URL and try again.`
    });
  }
});

// Backup endpoint
app.get('/api/backup', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=relocation-backup-${new Date().toISOString().split('T')[0]}.json`);
    
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error creating backup:', err);
    res.status(500).json({ error: 'Failed to create backup' });
  } 
});

// Restore from backup
app.post('/api/restore', (req, res) => {
  try {
    const backupData = req.body;
    
    // Validate backup data
    if (!backupData || (!backupData.tasks && !backupData.notes && !backupData.apartments)) {
      return res.status(400).json({ error: 'Invalid backup data format.' });
    }
    
    // Ensure tasks, notes, and apartments arrays exist
    const dataToRestore = {
      tasks: backupData.tasks || [],
      notes: backupData.notes || [],
      apartments: backupData.apartments || []
    };
    
    // Write to data file
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToRestore, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error('Error restoring from backup:', err);
    res.status(500).json({ error: 'Failed to restore from backup' });
  }
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle server shutdown gracefully
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Visit http://localhost:${port} in your browser`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});