// routes/trains.js
const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  searchTrains, getAllTrains, getTrainById,
  createTrain, updateTrain, deleteTrain, getPopularRoutes,
} = require('../controllers/trainController');

router.get('/search', searchTrains);
router.get('/popular-routes', getPopularRoutes);
router.get('/', getAllTrains);
router.get('/:id', getTrainById);
router.post('/', protect, adminOnly, createTrain);
router.put('/:id', protect, adminOnly, updateTrain);
router.delete('/:id', protect, adminOnly, deleteTrain);

module.exports = router;
