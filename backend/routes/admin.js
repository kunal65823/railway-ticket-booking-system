// routes/admin.js
const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getAnalytics, getAllUsers, getAllBookings, toggleUserStatus } = require('../controllers/adminController');

router.use(protect, adminOnly);
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);
router.patch('/users/:id/toggle', toggleUserStatus);

module.exports = router;
