// controllers/trainController.js
const Train = require('../models/Train');

const fareMultipliers = { General: 1.0, Sleeper: 1.3, '3AC': 1.8, '2AC': 2.5, '1AC': 3.5 };

// @route GET /api/trains/search
exports.searchTrains = async (req, res) => {
  try {
    const { source, destination, seatClass } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ success: false, message: 'Source and destination are required.' });
    }

    const query = {
      source,
      destination,
      isActive: true,
    };

    if (seatClass) {
      query['classes.className'] = seatClass;
    }

    const trains = await Train.find(query);

    const trainsWithFares = trains.map((train) => ({
      ...train,
      fares: {
        General: Math.round(train.baseFare * 1.0),
        Sleeper: Math.round(train.baseFare * 1.3),
        '3AC': Math.round(train.baseFare * 1.8),
        '2AC': Math.round(train.baseFare * 2.5),
        '1AC': Math.round(train.baseFare * 3.5),
      },
    }));

    res.json({
      success: true,
      count: trainsWithFares.length,
      trains: trainsWithFares,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/trains
exports.getAllTrains = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, source } = req.query;
    const query = { isActive: true };
    if (type) query.trainType = type;
    if (source) query.source = source;

    const trains = await Train.find(query, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      order: { column: 'created_at', ascending: false },
    });

    const total = await Train.countDocuments(query);

    res.json({ success: true, trains, total, page: parseInt(page, 10), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/trains/:id
exports.getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train) return res.status(404).json({ success: false, message: 'Train not found.' });
    res.json({ success: true, train });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/trains (admin)
exports.createTrain = async (req, res) => {
  try {
    const train = await Train.create(req.body);
    res.status(201).json({ success: true, message: 'Train created!', train });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @route PUT /api/trains/:id (admin)
exports.updateTrain = async (req, res) => {
  try {
    const train = await Train.findByIdAndUpdate(req.params.id, req.body);
    if (!train) return res.status(404).json({ success: false, message: 'Train not found.' });
    res.json({ success: true, message: 'Train updated!', train });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/trains/:id (admin)
exports.deleteTrain = async (req, res) => {
  try {
    const train = await Train.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!train) return res.status(404).json({ success: false, message: 'Train not found.' });
    res.json({ success: true, message: 'Train deactivated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/trains/popular-routes
exports.getPopularRoutes = async (req, res) => {
  try {
    const trains = await Train.find({ isActive: true });
    const routeMap = {};
    trains.forEach((train) => {
      const key = `${train.source}:::${train.destination}`;
      if (!routeMap[key]) {
        routeMap[key] = { source: train.source, destination: train.destination, count: 0, avgFare: 0 };
      }
      routeMap[key].count += 1;
      routeMap[key].avgFare += train.baseFare;
    });
    const routes = Object.values(routeMap)
      .map((route) => ({
        source: route.source,
        destination: route.destination,
        count: route.count,
        avgFare: Math.round(route.avgFare / route.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    res.json({ success: true, routes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
