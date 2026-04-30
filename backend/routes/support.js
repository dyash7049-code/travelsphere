const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

const mockAuth = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  req.user = { id: userId };
  next();
};

// Create a support ticket
router.post('/', mockAuth, async (req, res) => {
  try {
    const { subject, description } = req.body;
    const newTicket = new Ticket({
      userId: req.user.id,
      subject,
      description
    });
    
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user tickets
router.get('/my-tickets', mockAuth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
