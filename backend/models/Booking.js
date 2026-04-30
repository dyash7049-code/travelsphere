const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingType: { type: String, enum: ['Flight', 'Bus', 'Train', 'Package'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // The ID of the flight, bus, train, or package
  passengers: Number,
  totalAmount: Number,
  status: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Confirmed' },
  bookingDate: { type: Date, default: Date.now },
  travelDate: Date,
  details: mongoose.Schema.Types.Mixed // Flexible field to store snapshot of the booked item
});

module.exports = mongoose.model('Booking', bookingSchema);
