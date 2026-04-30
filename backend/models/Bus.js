const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  operator: String,
  busType: String, // e.g., 'AC Sleeper', 'Volvo Semi-Sleeper'
  source: String,
  destination: String,
  departureTime: Date,
  arrivalTime: Date,
  price: Number,
  duration: String,
  availableSeats: Number
});

module.exports = mongoose.model('Bus', busSchema);
