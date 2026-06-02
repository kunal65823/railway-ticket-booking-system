// controllers/bookingController.js
const Booking = require('../models/Booking');
const Train = require('../models/Train');
const qrcode = require('qrcode');
const { buildBookingData, buildBookingQuote } = require('../services/bookingQuote');

// @route POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const quote = await buildBookingQuote(req.body);
    const booking = await Booking.create(buildBookingData(quote, req.user._id));

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

    const updatedBooking = await Booking.findById(booking._id);

    res.status(201).json({
      success: true,
      message: 'Ticket booked successfully! 🎉',
      booking: updatedBooking,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// @route GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      order: { column: 'createdAt', ascending: false },
    });

    const total = await Booking.countDocuments(query);

    res.json({ success: true, bookings, total, page: parseInt(page, 10) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/bookings/pnr/:pnr
exports.getByPNR = async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnrNumber: req.params.pnr.toUpperCase() });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'No booking found for this PNR.' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/bookings/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const { pnr, reason } = req.body;

    const booking = await Booking.findOne({ pnrNumber: pnr?.toUpperCase() });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled.' });
    }

    if (req.user.role !== 'admin' && booking.user !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
    }

    const journeyDate = new Date(booking.journeyDate);
    const now = new Date();
    const daysLeft = Math.ceil((journeyDate - now) / (1000 * 60 * 60 * 24));
    let refundPercent = daysLeft >= 3 ? 0.9 : daysLeft >= 1 ? 0.5 : 0.25;
    const refundAmount = Math.round(booking.totalFare * refundPercent);

    await Booking.findByIdAndUpdate(booking._id, {
      status: 'Cancelled',
      cancellationReason: reason || 'User requested',
      cancelledAt: new Date(),
      refundAmount,
      paymentStatus: 'Refunded',
    });

    const train = await Train.findById(booking.train);
    if (train) {
      await Train.findByIdAndUpdate(booking.train, {
        availableSeats: train.availableSeats + booking.passengers.length,
      });
    }

    res.json({
      success: true,
      message: 'Ticket cancelled successfully.',
      refundAmount,
      refundPercent: `${Math.round(refundPercent * 100)}%`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
