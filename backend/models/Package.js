const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: String,
  destination: String,
  duration: String, // e.g., '4 Days / 3 Nights'
  price: Number,
  image: String,
  inclusions: [String], // e.g., ['Flight', 'Hotel', 'Meals', 'Sightseeing']
  description: String,
  itinerary: [{
    day: Number,
    title: String,
    activities: String
  }]
});

module.exports = mongoose.model('Package', packageSchema);
