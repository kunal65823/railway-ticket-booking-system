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
  }
};
