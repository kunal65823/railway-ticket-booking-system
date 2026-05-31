// controllers/adminController.js
const User = require('../models/User');
const Train = require('../models/Train');
const Booking = require('../models/Booking');

// @route GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTrains = await Train.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

    const paidBookings = await Booking.find({ status: 'Confirmed' });
    const totalRevenue = paidBookings.reduce((sum, booking) => sum + (booking.totalFare || 0), 0);

    const bookingsByClass = paidBookings.reduce((acc, booking) => {
      const seatClass = booking.seatClass || 'Unknown';
      if (!acc[seatClass]) acc[seatClass] = { _id: seatClass, count: 0, revenue: 0 };
      acc[seatClass].count += 1;
      acc[seatClass].revenue += booking.totalFare || 0;
      return acc;
    }, {});

    const bookingsByClassArray = Object.values(bookingsByClass).sort((a, b) => b.count - a.count);

    const recentBookings = await Booking.find({}, {
      page: 1,
      limit: 10,
      order: { column: 'createdAt', ascending: false },
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyDataMap = (await Booking.find()).reduce((acc, booking) => {
      const created = new Date(booking.createdAt);
      if (created < sixMonthsAgo) return acc;
      const monthKey = `${created.getFullYear()}-${created.getMonth() + 1}`;
      if (!acc[monthKey]) acc[monthKey] = { year: created.getFullYear(), month: created.getMonth() + 1, bookings: 0, revenue: 0 };
      acc[monthKey].bookings += 1;
      acc[monthKey].revenue += booking.totalFare || 0;
      return acc;
    }, {});

    const monthlyData = Object.values(monthlyDataMap).sort((a, b) => a.year - b.year || a.month - b.month);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTrains,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        cancellationRate: totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0,
      },
      bookingsByClass: bookingsByClassArray,
      monthlyData,
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [
      { name: search },
      { email: search },
    ];

    const users = await User.find(query, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      order: { column: 'createdAt', ascending: false },
    });

    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.search = search;

    const bookings = await Booking.find(query, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      order: { column: 'createdAt', ascending: false },
    });

    const total = await Booking.countDocuments(query);
    res.json({ success: true, bookings, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PATCH /api/admin/users/:id/toggle
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { isActive: !user.isActive });
    res.json({ success: true, message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'}.`, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
