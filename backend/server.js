require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedData = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Image Proxy to search and fetch real hotel images dynamically
const axios = require('axios');
const cheerio = require('cheerio');

app.get('/api/image-proxy', async (req, res) => {
  try {
    const { url, query } = req.query;
    
    // If a direct URL is provided, just proxy it
    if (url) {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      res.set('Content-Type', response.headers['content-type']);
      return response.data.pipe(res);
    }
    
    // If a query is provided, scrape Yahoo Images for the first result
    if (query) {
      const searchUrl = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}`;
      const searchRes = await axios.get(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      
      const $ = cheerio.load(searchRes.data);
      let imgUrl = null;
      
      // Yahoo image results usually have data-src or src on img tags inside #sres
      $('img').each((i, el) => {
        const src = $(el).attr('data-src') || $(el).attr('src');
        if (src && src.startsWith('http') && !src.includes('yimg.com/pv') && !imgUrl) {
          imgUrl = src;
        }
      });
      
      if (!imgUrl) {
        // Fallback generic image
        imgUrl = `https://loremflickr.com/600/400/hotel?random=${Math.random()}`;
      }
      
      const imgRes = await axios({
        method: 'GET',
        url: imgUrl,
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      res.set('Content-Type', imgRes.headers['content-type']);
      return imgRes.data.pipe(res);
    }
    
    return res.status(400).send('No url or query provided');
  } catch (error) {
    console.error('Proxy Error:', error.message);
    // Return a generic fallback silently so the app doesn't break
    res.redirect(`https://loremflickr.com/600/400/hotel?random=${Math.random()}`);
  }
});

// Routes
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const bookingRoutes = require('./routes/bookings');
const packagesRoute = require('./routes/packages');
const locationsRoute = require('./routes/locations');
const supportRoutes = require('./routes/support');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/packages', packagesRoute);
app.use('/api/locations', locationsRoute);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve built frontend in production
const path = require('path');
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
// Catch-all: send React app for any non-API route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDist, 'index.html'));
  }
});
// Database Connection & Server Start
const startServer = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    let isMemory = false;

    if (!mongoUri || mongoUri.trim() === '') {
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      isMemory = true;
      console.log('Using in-memory MongoDB at', mongoUri);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    if (isMemory) {
      console.log('Seeding initial data into in-memory DB...');
      await seedData();
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} (accessible on all network interfaces)`);
    });
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

startServer();
