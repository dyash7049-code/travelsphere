const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
  trainName: String,
  trainNumber: String,
  source: String,
  destination: String,
  departureTime: Date,
  arrivalTime: Date,
  classes: [{
    className: String, // e.g., 'Sleeper', '3AC', '2AC'
    price: Number,
    availableSeats: Number
  }],
  duration: String
});

module.exports = mongoose.model('Train', trainSchema);
