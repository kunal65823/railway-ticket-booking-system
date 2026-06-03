const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

router.post('/orders', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
