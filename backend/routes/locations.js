const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Pre-load data into memory for extreme speed
const dataDir = path.join(__dirname, '../data');
let datasets = {
  flights: [],
  trains: [],
  buses: [],
  hotels: []
};

try {
  datasets.flights = JSON.parse(fs.readFileSync(path.join(dataDir, 'airports.json')));
  datasets.trains = JSON.parse(fs.readFileSync(path.join(dataDir, 'stations.json')));
  datasets.buses = JSON.parse(fs.readFileSync(path.join(dataDir, 'buses.json')));
  
  // For hotels, just use the cities from airports dataset
  datasets.hotels = datasets.flights.map(loc => ({
    city: loc.city,
    detail: 'City in India'
  }));
  
  console.log('Location datasets loaded into memory.');
} catch (err) {
  console.error('Error loading location datasets. Please run dataGenerator.js first.', err);
}

// Cache for live API results to avoid re-fetching
const liveCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Use Photon API (OSM-based, built for autocomplete / prefix matching)
// Falls back to Nominatim if Photon fails
async function fetchLiveLocations(query, type) {
  const cacheKey = `${type}:${query.toLowerCase()}`;
  const cached = liveCache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }

  let results = [];

  // Try Photon API first (best for autocomplete / prefix search)
  try {
    const photonRes = await axios.get('https://photon.komoot.io/api/', {
      params: {
        q: query,
        limit: 20,
        lang: 'en',
        lat: 22.5,   // Center of India
        lon: 78.9,
        bbox: '68.1,6.7,97.4,35.7', // India bounding box
      },
      timeout: 3000
    });

    const seen = new Set();
    for (const feature of photonRes.data.features || []) {
      const props = feature.properties || {};
      // Only include results from India
      if (props.country && props.country !== 'India') continue;

      const city = props.name || props.city || props.town || props.village || '';
      if (!city || seen.has(city.toLowerCase())) continue;
      seen.add(city.toLowerCase());

      const state = props.state || '';
      const district = props.county || props.district || '';
      
      let detail = '';
      if (type === 'trains') {
        detail = `${city} Railway Station` + (district ? `, ${district}` : '') + (state ? `, ${state}` : '');
      } else if (type === 'buses') {
        detail = `${city} Bus Stand` + (district ? `, ${district}` : '') + (state ? `, ${state}` : '');
      } else if (type === 'flights') {
        detail = `${city} Airport` + (state ? `, ${state}` : '');
      } else {
        detail = (district ? `${district}, ` : '') + (state || 'India');
      }

      results.push({ city, detail });
    }
  } catch (err) {
    // Photon failed, try Nominatim as fallback
    try {
      const nomRes = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 15,
          countrycodes: 'in',
        },
        headers: {
          'User-Agent': 'TravelSphere/1.0 (travel-app)'
        },
        timeout: 3000
      });

      const seen = new Set();
      for (const place of nomRes.data) {
        const addr = place.address || {};
        const city = addr.city || addr.town || addr.village || addr.hamlet || 
                     addr.suburb || addr.county || addr.state_district || place.name || '';
        
        if (!city || seen.has(city.toLowerCase())) continue;
        seen.add(city.toLowerCase());

        const state = addr.state || '';
        const district = addr.state_district || addr.county || '';
        
        let detail = '';
        if (type === 'trains') {
          detail = `${city} Railway Station` + (district ? `, ${district}` : '') + (state ? `, ${state}` : '');
        } else if (type === 'buses') {
          detail = `${city} Bus Stand` + (district ? `, ${district}` : '') + (state ? `, ${state}` : '');
        } else if (type === 'flights') {
          detail = `${city} Airport` + (state ? `, ${state}` : '');
        } else {
          detail = (district ? `${district}, ` : '') + (state || 'India');
        }

        results.push({ city, detail });
      }
    } catch (nomErr) {
      console.error('Both Photon and Nominatim failed:', nomErr.message);
    }
  }

  // Cache the results
  liveCache.set(cacheKey, { data: results, time: Date.now() });
  return results;
}

// GET /api/locations/:type?q=...
router.get('/:type', async (req, res) => {
  const { type } = req.params;
  const query = req.query.q || '';

  if (!datasets[type]) {
    return res.status(400).json({ error: 'Invalid location type' });
  }

  // If no query, return top 10 default locations
  if (!query) {
    return res.json(datasets[type].slice(0, 10));
  }

  const lowerQuery = query.toLowerCase();

  // "StartsWith" matching from local data first
  let matches = datasets[type].filter(loc => 
    loc.city.toLowerCase().startsWith(lowerQuery) || 
    loc.detail.toLowerCase().startsWith(lowerQuery)
  );

  if (matches.length === 0) {
    matches = datasets[type].filter(loc => 
      loc.city.toLowerCase().includes(lowerQuery) || 
      loc.detail.toLowerCase().includes(lowerQuery)
    );
  }

  // If local data has enough results, return them immediately
  if (matches.length >= 5) {
    return res.json(matches.slice(0, 15));
  }

  // Otherwise, supplement with live API for villages/small towns
  try {
    const liveResults = await fetchLiveLocations(query, type);
    
    // Merge: local results first, then live results (deduplicated)
    const existingCities = new Set(matches.map(m => m.city.toLowerCase()));
    const merged = [...matches];
    
    for (const result of liveResults) {
      if (!existingCities.has(result.city.toLowerCase())) {
        merged.push(result);
        existingCities.add(result.city.toLowerCase());
      }
    }
    
    res.json(merged.slice(0, 15));
  } catch (err) {
    // If live API fails, still return local results
    res.json(matches.slice(0, 15));
  }
});

module.exports = router;
