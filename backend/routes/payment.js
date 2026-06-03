// routes/payment.js
const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createOrder, verifyPayment, handleWebhook } = require('../controllers/paymentController');

// Create Razorpay order
router.post('/create-order', protect, createOrder);

// Verify payment and create booking
router.post('/verify', protect, verifyPayment);

// Razorpay webhook
router.post('/webhook', handleWebhook);

module.exports = router;
