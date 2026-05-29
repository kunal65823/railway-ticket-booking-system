// routes/bookings.js
const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createBooking, getMyBookings, getByPNR, cancelBooking } = require('../controllers/bookingController');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/pnr/:pnr', getByPNR);
router.post('/cancel', protect, cancelBooking);

module.exports = router;
