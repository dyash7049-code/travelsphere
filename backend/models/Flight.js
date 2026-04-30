const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  airline: String,
  flightNumber: String,
  source: String,
  destination: String,
  departureTime: Date,
  arrivalTime: Date,
  price: Number,
  duration: String,
  availableSeats: Number
});

module.exports = mongoose.model('Flight', flightSchema);
