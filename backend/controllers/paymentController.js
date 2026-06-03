<<<<<<< HEAD
// controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Train = require('../models/Train');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route POST /api/payment/create-order
// Create Razorpay order for booking payment
exports.createOrder = async (req, res) => {
  try {
    const { bookingData } = req.body;
    const { trainId, journeyDate, seatClass, passengers, contactInfo } = bookingData;

    if (!trainId || !journeyDate || !seatClass || !passengers?.length) {
      return res.status(400).json({ success: false, message: 'Invalid booking data' });
    }

    // Fetch train
    const train = await Train.findById(trainId);
    if (!train || !train.isActive) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }

    if (train.availableSeats < passengers.length) {
      return res.status(400).json({ success: false, message: 'Not enough seats available' });
    }

    // Calculate fare
    const multipliers = { General: 1.0, Sleeper: 1.3, '3AC': 1.8, '2AC': 2.5, '1AC': 3.5 };
    const farePerPassenger = Math.round(train.baseFare * (multipliers[seatClass] || 1.0));
    const baseFare = farePerPassenger * passengers.length;
    const taxes = Math.round(baseFare * 0.05);
    const totalFare = baseFare + taxes;

    // Create Razorpay order (amount in paise)
    const options = {
      amount: totalFare * 100,
      currency: 'INR',
      receipt: `booking_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        trainId: trainId,
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        passengers: passengers.length,
        seatClass: seatClass,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: totalFare,
      key: process.env.RAZORPAY_KEY_ID,
      bookingData: {
        trainId,
        journeyDate,
        seatClass,
        passengers,
        contactInfo,
        baseFare,
        taxes,
        totalFare,
      },
    });
  } catch (err) {
    console.error('Payment Order Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/payment/verify
// Verify payment and create booking
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, bookingData } = req.body;

    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Fetch train and update seats
    const train = await Train.findById(bookingData.trainId);
    if (!train || train.availableSeats < bookingData.passengers.length) {
      return res.status(400).json({ success: false, message: 'Seats no longer available' });
    }

    // Enrich passengers with seat numbers
    const enrichedPassengers = bookingData.passengers.map((p) => ({
      ...p,
      seatNumber: `${bookingData.seatClass.replace(/\s/g, '').charAt(0)}${Math.floor(Math.random() * 72) + 1}`,
    }));

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      train: bookingData.trainId,
      trainSnapshot: {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        source: train.source,
        destination: train.destination,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        trainType: train.trainType,
      },
      passengers: enrichedPassengers,
      contactInfo: bookingData.contactInfo,
      journeyDate: new Date(bookingData.journeyDate),
      seatClass: bookingData.seatClass,
      baseFare: bookingData.baseFare,
      taxes: bookingData.taxes,
      totalFare: bookingData.totalFare,
      paymentId,
      orderId,
      status: 'Confirmed',
      paymentStatus: 'Paid',
    });

    // Update train availability
    await Train.findByIdAndUpdate(bookingData.trainId, {
      availableSeats: train.availableSeats - bookingData.passengers.length,
    });

    // Generate QR code
    const qrcode = require('qrcode');
    const qrData = JSON.stringify({
      pnr: booking.pnrNumber,
      train: train.trainNumber,
      date: bookingData.journeyDate,
      class: bookingData.seatClass,
    });
    const qrCodeUrl = await qrcode.toDataURL(qrData);
    await Booking.findByIdAndUpdate(booking._id, { qrCode: qrCodeUrl });

    const updatedBooking = await Booking.findById(booking._id);

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed! 🎉',
      booking: updatedBooking,
    });
  } catch (err) {
    console.error('Payment Verification Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/payment/webhook
// Razorpay webhook for payment events
exports.handleWebhook = async (req, res) => {
  try {
    const event = req.body.event;
    const data = req.body.payload.payment.entity;

    console.log('Webhook Event:', event);

    // Handle payment success
    if (event === 'payment.authorized' || event === 'payment.captured') {
      console.log('Payment successful:', data.id);
    }

    // Handle payment failed
    if (event === 'payment.failed') {
      console.log('Payment failed:', data.id);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(500).json({ success: false, message: err.message });
=======
const crypto = require('crypto');
const qrcode = require('qrcode');
const Booking = require('../models/Booking');
const Train = require('../models/Train');
const { buildBookingData, buildBookingQuote } = require('../services/bookingQuote');

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

const getCredentials = () => ({
  keyId: process.env.RAZORPAY_KEY_ID || process.env.RZP_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET || process.env.RZP_KEY_SECRET,
});

const requireCredentials = () => {
  const credentials = getCredentials();
  if (!credentials.keyId || !credentials.keySecret) {
    const error = new Error('Razorpay credentials are not configured.');
    error.statusCode = 503;
    throw error;
  }
  return credentials;
};

const toPaise = (amount) => Math.round(Number(amount) * 100);

const timingSafeEquals = (left, right) => {
  const leftBuffer = Buffer.from(left || '', 'hex');
  const rightBuffer = Buffer.from(right || '', 'hex');
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const razorpayRequest = async (path, options = {}) => {
  const { keyId, keySecret } = requireCredentials();
  const response = await fetch(`${RAZORPAY_API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const error = new Error(data.error?.description || data.message || `Razorpay request failed with ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }

  return data;
};

const finalizePaidBooking = async (quote, userId) => {
  const booking = await Booking.create(buildBookingData(quote, userId, { paymentStatus: 'Paid' }));

  const qrData = JSON.stringify({
    pnr: booking.pnrNumber,
    train: quote.train.trainNumber,
    date: quote.journeyDate,
    class: quote.seatClass,
  });
  const qrCode = await qrcode.toDataURL(qrData);
  await Booking.findByIdAndUpdate(booking._id, { qrCode });

  await Train.findByIdAndUpdate(quote.train._id, {
    availableSeats: quote.train.availableSeats - quote.passengers.length,
  });

  return Booking.findById(booking._id);
};

exports.createOrder = async (req, res) => {
  try {
    const { keyId } = requireCredentials();
    const bookingPayload = req.body.booking || req.body;
    const quote = await buildBookingQuote(bookingPayload);
    const amount = toPaise(quote.totalFare);

    const order = await razorpayRequest('/orders', {
      method: 'POST',
      body: {
        amount,
        currency: 'INR',
        receipt: `rail_${Date.now()}_${req.user._id}`,
        notes: {
          userId: String(req.user._id),
          trainId: String(bookingPayload.trainId),
        },
      },
    });

    res.status(201).json({
      success: true,
      keyId,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      quote: {
        farePerPassenger: quote.farePerPassenger,
        baseFare: quote.baseFare,
        taxes: quote.taxes,
        totalFare: quote.totalFare,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { keySecret } = requireCredentials();
    const {
      booking: bookingPayload,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    if (!bookingPayload || !orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, message: 'Payment verification details are required.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (!timingSafeEquals(expectedSignature, signature)) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    }

    const quote = await buildBookingQuote(bookingPayload);
    const expectedAmount = toPaise(quote.totalFare);
    const [order, payment] = await Promise.all([
      razorpayRequest(`/orders/${encodeURIComponent(orderId)}`),
      razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`),
    ]);

    if (
      order.amount !== expectedAmount
      || payment.amount !== expectedAmount
      || order.currency !== 'INR'
      || payment.currency !== 'INR'
      || payment.order_id !== orderId
      || !['authorized', 'captured'].includes(payment.status)
    ) {
      return res.status(400).json({ success: false, message: 'Payment amount or status could not be verified.' });
    }

    const booking = await finalizePaidBooking(quote, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Payment verified and ticket booked successfully!',
      booking,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
>>>>>>> f80d4a8508daeecfdd9c841fd8a6bfa2a218daf9
  }
};
