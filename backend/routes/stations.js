// routes/stations.js
const router = require('express').Router();
const Station = require('../models/Station');

router.get('/', async (req, res) => {
  try {
    const stationQuery = {
      q: req.query.q,
      isActive: true,
    };
    const stations = await Station.find(stationQuery, { limit: 20 });
    res.json({ success: true, stations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
