const router = require('express').Router();
const fetch  = require('node-fetch');      // add to deps:  npm i node-fetch@2

/**
 * POST /api/validate-address
 * Body: { name, street1, street2?, city, state, zip }
 * Returns 200 + { ...addr, verified:true }  OR 400 on mismatch/invalid
 */
router.post('/validate-address', async (req, res) => {
  try {
    const { zip, city, state } = req.body;
    if (!zip || !city || !state) throw new Error('Missing fields');

    const zRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!zRes.ok) throw new Error('ZIP code not found');
    const data  = await zRes.json();
    const place = data.places[0];

    const apiCity  = place['place name'].toLowerCase();
    const apiState = place['state abbreviation'].toUpperCase();

    if (apiCity !== city.toLowerCase() || apiState !== state.toUpperCase()) {
      return res.status(400).json({ message: 'City & state do not match ZIP' });
    }

    res.json({ ...req.body, verified: true });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Address validation failed' });
  }
});

module.exports = router;
