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
  }
};
