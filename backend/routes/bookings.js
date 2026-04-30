const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Middleware to mock authentication for prototype (in real app, verify JWT)
const mockAuth = (req, res, next) => {
  // We assume the frontend passes the userId in the headers for this prototype
  const userId = req.headers['user-id'];
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  req.user = { id: userId };
  next();
};

// Create a booking
router.post('/', mockAuth, async (req, res) => {
  try {
    const { bookingType, itemId, passengers, totalAmount, details } = req.body;
    const newBooking = new Booking({
      userId: req.user.id,
      bookingType,
      itemId,
      passengers,
      totalAmount,
      details,
      status: 'Confirmed' // Mock successful payment
    });
    
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user bookings
router.get('/my-bookings', mockAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
