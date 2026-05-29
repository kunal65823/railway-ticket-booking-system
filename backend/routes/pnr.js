// routes/pnr.js
const router = require('express').Router();
const Booking = require('../models/Booking');

// Public PNR check
router.get('/:pnr', async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnrNumber: req.params.pnr.toUpperCase() });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'No booking found for this PNR.' });
    }

    res.json({
      success: true,
      booking: {
        pnrNumber: booking.pnrNumber,
        status: booking.status,
        journeyDate: booking.journeyDate,
        seatClass: booking.seatClass,
        totalFare: booking.totalFare,
        passengers: booking.passengers,
        trainSnapshot: booking.trainSnapshot,
        contactInfo: { email: booking.contactInfo?.email },
        createdAt: booking.createdAt,
        qrCode: booking.qrCode,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
