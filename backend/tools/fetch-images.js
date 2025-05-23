// backend/tools/fetch-images.js

// Load .env for the PEXELS_API_KEY
require('dotenv').config();

// Require the Pexels client
const { createClient } = require('pexels');

// Grab your key from .env
const PEXELS_KEY = 'ooihBQpD8wmaOoUcXry2CmUt6EUBrFnwOK8et1qsn7VLunPwbHjE1HRb';
if (!PEXELS_KEY) {
  console.error('✕ Missing PEXELS_API_KEY in .env');
  process.exit(1);
}

// Instantiate the client
const client = createClient(PEXELS_KEY);

// List the product names you want to fetch images for:
const products = [
  'Chocolate Éclair',
  'Lemon Tart',
  'Cinnamon Roll',
  'Blueberry Muffin',
  'Pumpkin Pie',
  'French Macaron'
];

(async () => {
  const results = [];

  for (const name of products) {
    process.stdout.write(`Searching for “${name}”… `);
    try {
      const res = await client.photos.search({
        query: name,
        per_page: 3,
        orientation: 'landscape'
      });

      if (res.photos && res.photos.length) {
        // Pick the medium-size thumbnail (≈640px wide)
        const photo = res.photos[0];
        const thumb = photo.src.medium;
        results.push({ name, imageUrl: thumb });
        console.log('✔', thumb);
      } else {
        console.log('⚠️ no results');
      }
    } catch (err) {
      console.error('❌ error:', err.message);
    }
  }

  console.log('\nCopy this JSON into your products.js:\n');
  console.log(JSON.stringify(results, null, 2));
})();
