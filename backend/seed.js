const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Flight = require('./models/Flight');
const Bus = require('./models/Bus');
const Train = require('./models/Train');
const Package = require('./models/Package');

const seedData = async () => {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Flight.deleteMany({}),
      Bus.deleteMany({}),
      Train.deleteMany({}),
      Package.deleteMany({})
    ]);

    // Dummy User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@makemytrip.com',
      password: hashedPassword
    });

    // Dummy Flights
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Flight.insertMany([
      { airline: 'IndiGo', flightNumber: '6E-123', source: 'Delhi', destination: 'Mumbai', departureTime: tomorrow, arrivalTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), price: 4500, duration: '2h 00m', availableSeats: 45 },
      { airline: 'Air India', flightNumber: 'AI-456', source: 'Delhi', destination: 'Mumbai', departureTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000), arrivalTime: new Date(tomorrow.getTime() + 6.5 * 60 * 60 * 1000), price: 5200, duration: '2h 30m', availableSeats: 12 },
      { airline: 'Vistara', flightNumber: 'UK-789', source: 'Bangalore', destination: 'Delhi', departureTime: tomorrow, arrivalTime: new Date(tomorrow.getTime() + 2.5 * 60 * 60 * 1000), price: 6100, duration: '2h 45m', availableSeats: 30 }
    ]);

    // Dummy Buses
    await Bus.insertMany([
      { operator: 'Zingbus', busType: 'Volvo AC Sleeper', source: 'Delhi', destination: 'Manali', departureTime: tomorrow, arrivalTime: new Date(tomorrow.getTime() + 12 * 60 * 60 * 1000), price: 1200, duration: '12h 00m', availableSeats: 20 },
      { operator: 'IntrCity SmartBus', busType: 'AC Semi-Sleeper', source: 'Bangalore', destination: 'Goa', departureTime: tomorrow, arrivalTime: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000), price: 1500, duration: '14h 00m', availableSeats: 15 }
    ]);

    // Dummy Trains
    await Train.insertMany([
      { 
        trainName: 'Rajdhani Express', trainNumber: '12952', source: 'Delhi', destination: 'Mumbai', departureTime: tomorrow, arrivalTime: new Date(tomorrow.getTime() + 16 * 60 * 60 * 1000), duration: '16h 00m',
        classes: [
          { className: '3AC', price: 2100, availableSeats: 50 },
          { className: '2AC', price: 3200, availableSeats: 20 },
          { className: '1AC', price: 4500, availableSeats: 5 }
        ]
      }
    ]);

    // Dummy Packages
    await Package.insertMany([
      {
        title: 'Magical Manali Retreat', destination: 'Manali', duration: '4 Days / 3 Nights', price: 12999, image: '/manali_img_1776883445264.png', inclusions: ['Hotel', 'Meals', 'Sightseeing', 'Transfers'], description: 'Experience the beauty of snow-capped mountains with our premium Manali package.',
        itinerary: [
          { day: 1, title: 'Arrival in Manali', activities: 'Check-in and local sightseeing.' },
          { day: 2, title: 'Solang Valley Tour', activities: 'Adventure sports and snow activities.' }
        ]
      },
      {
        title: 'Goa Beach Paradise', destination: 'Goa', duration: '5 Days / 4 Nights', price: 15999, image: '/goa_img_1776883403196.png', inclusions: ['Flight', 'Hotel', 'Breakfast', 'Cruise'], description: 'Relax on the pristine beaches of Goa and enjoy vibrant nightlife.',
        itinerary: [
          { day: 1, title: 'Arrival in Goa', activities: 'Check-in and relax at the beach.' },
          { day: 2, title: 'North Goa Tour', activities: 'Visit Baga, Calangute, and Anjuna beaches.' }
        ]
      },
      {
        title: 'Royal Jaipur Experience', destination: 'Jaipur', duration: '3 Days / 2 Nights', price: 8999, image: '/jaipur_hawa_mahal_1776886099514.png', inclusions: ['Hotel', 'Breakfast', 'Sightseeing'], description: 'Explore the majestic forts and palaces of the Pink City.',
        itinerary: [
          { day: 1, title: 'Arrival in Jaipur', activities: 'Visit Hawa Mahal and City Palace.' },
          { day: 2, title: 'Amber Fort', activities: 'Elephant ride and fort exploration.' }
        ]
      },
      {
        title: 'Uttarakhand Nature Escape', destination: 'Uttarakhand', duration: '6 Days / 5 Nights', price: 18500, image: '/uttarakhand_mountains_1776886114054.png', inclusions: ['Hotel', 'Meals', 'Transfers'], description: 'Rejuvenate your soul amidst the serene Himalayan mountains and holy temples.',
        itinerary: [
          { day: 1, title: 'Arrival in Nainital', activities: 'Enjoy boating at Naini Lake.' },
          { day: 2, title: 'Mukteshwar Tour', activities: 'Visit beautiful orchards and temples.' }
        ]
      },
      {
        title: 'Golden Triangle Tour', destination: 'Agra', duration: '5 Days / 4 Nights', price: 14500, image: '/golden_triangle_india_1776886130386.png', inclusions: ['Hotel', 'Breakfast', 'Guide', 'Transfers'], description: 'Experience the rich heritage of Delhi, Agra, and Jaipur in one incredible journey.',
        itinerary: [
          { day: 1, title: 'Delhi Sightseeing', activities: 'Visit Qutub Minar and India Gate.' },
          { day: 2, title: 'Taj Mahal at Sunrise', activities: 'Witness the iconic monument of love in Agra.' }
        ]
      },
      {
        title: 'Kerala Backwaters & Houseboat', destination: 'Kerala', duration: '5 Days / 4 Nights', price: 16500, image: '/kerala_backwaters_img_1776887562764.png', inclusions: ['Houseboat', 'Meals', 'Transfers'], description: 'Cruise through the serene backwaters of Alleppey in a traditional houseboat.',
        itinerary: [
          { day: 1, title: 'Arrival in Kochi', activities: 'Check-in and Fort Kochi tour.' },
          { day: 2, title: 'Alleppey Houseboat', activities: 'Overnight stay on a traditional houseboat.' }
        ]
      },
      {
        title: 'Leh Ladakh Expedition', destination: 'Ladakh', duration: '7 Days / 6 Nights', price: 24999, image: '/leh_ladakh_img_1776887578711.png', inclusions: ['Hotel', 'Bike Rental', 'Permits', 'Meals'], description: 'Ride through the highest motorable passes and witness Pangong Lake.',
        itinerary: [
          { day: 1, title: 'Acclimatization in Leh', activities: 'Rest and local market visit.' },
          { day: 2, title: 'Pangong Tso', activities: 'Drive to the majestic Pangong Lake.' }
        ]
      },
      {
        title: 'Andaman Island Escape', destination: 'Andaman', duration: '6 Days / 5 Nights', price: 21000, image: '/andaman_island_img_1776887594042.png', inclusions: ['Flight', 'Hotel', 'Scuba Diving', 'Ferry'], description: 'Explore crystal clear waters, white sand beaches, and vibrant coral reefs.',
        itinerary: [
          { day: 1, title: 'Arrival in Port Blair', activities: 'Visit Cellular Jail.' },
          { day: 2, title: 'Havelock Island', activities: 'Radhanagar Beach and water sports.' }
        ]
      },
      {
        title: 'Rajasthan Royal Heritage', destination: 'Udaipur', duration: '6 Days / 5 Nights', price: 19500, image: '/udaipur_rajasthan_img_1776887608825.png', inclusions: ['Hotel', 'Breakfast', 'Guide', 'Transfers'], description: 'Experience the grandeur of Udaipur lakes and Jodhpur forts.',
        itinerary: [
          { day: 1, title: 'Udaipur Lakes', activities: 'Boat ride on Lake Pichola.' },
          { day: 2, title: 'Jodhpur Forts', activities: 'Visit Mehrangarh Fort.' }
        ]
      },
      {
        title: 'Kashmir Valley Paradise', destination: 'Srinagar', duration: '5 Days / 4 Nights', price: 17500, image: '/kashmir_valley_img_1776887624164.png', inclusions: ['Houseboat', 'Shikara Ride', 'Meals', 'Transfers'], description: 'Discover the "Heaven on Earth" with snow-clad peaks and lush valleys.',
        itinerary: [
          { day: 1, title: 'Srinagar Arrival', activities: 'Shikara ride on Dal Lake.' },
          { day: 2, title: 'Gulmarg Excursion', activities: 'Gondola ride and snow activities.' }
        ]
      },
      {
        title: 'Darjeeling Tea Gardens', destination: 'Darjeeling', duration: '4 Days / 3 Nights', price: 11000, image: '/darjeeling_tea_img_1776887640539.png', inclusions: ['Hotel', 'Breakfast', 'Toy Train', 'Sightseeing'], description: 'Wake up to the aroma of fresh tea and panoramic views of the Himalayas.',
        itinerary: [
          { day: 1, title: 'Tiger Hill Sunrise', activities: 'Watch sunrise over Kanchenjunga.' },
          { day: 2, title: 'Tea Estate Visit', activities: 'Learn about tea processing and tasting.' }
        ]
      },
      {
        title: 'Meghalaya Nature Trail', destination: 'Shillong', duration: '5 Days / 4 Nights', price: 15500, image: '/meghalaya_shillong_img_1776887656760.png', inclusions: ['Hotel', 'Trekking', 'Meals', 'Transfers'], description: 'Trek to the famous living root bridges and the cleanest village in Asia.',
        itinerary: [
          { day: 1, title: 'Shillong City', activities: 'Visit Umiam Lake and local cafes.' },
          { day: 2, title: 'Cherrapunji Trek', activities: 'Double Decker Living Root Bridge trek.' }
        ]
      },
      {
        title: 'Rann of Kutch Festival', destination: 'Gujarat', duration: '3 Days / 2 Nights', price: 12500, image: '/kutch_gujarat_img_1776887673132.png', inclusions: ['Tent Stay', 'Meals', 'Cultural Show', 'Camel Safari'], description: 'Witness the surreal white salt desert illuminated under the full moon.',
        itinerary: [
          { day: 1, title: 'Tent City Check-in', activities: 'Enjoy traditional folk music.' },
          { day: 2, title: 'White Desert Safari', activities: 'Camel ride across the salt flats.' }
        ]
      },
      {
        title: 'Hampi Ruins Exploration', destination: 'Karnataka', duration: '3 Days / 2 Nights', price: 8500, image: '/hampi_ruins_img_1776887687466.png', inclusions: ['Hotel', 'Bicycle Rental', 'Breakfast', 'Guide'], description: 'Cycle through the ancient ruins and majestic temples of the Vijayanagara Empire.',
        itinerary: [
          { day: 1, title: 'Temple Run', activities: 'Visit Virupaksha Temple.' },
          { day: 2, title: 'Sunset Viewpoint', activities: 'Hike to Matanga Hill for sunset.' }
        ]
      },
      {
        title: 'Pondicherry French Colony', destination: 'Pondicherry', duration: '4 Days / 3 Nights', price: 10500, image: '/pondicherry_img_1776887703588.png', inclusions: ['Boutique Hotel', 'Breakfast', 'Heritage Walk', 'Scooter Rental'], description: 'Experience the charming French architecture, cozy cafes, and peaceful ashrams.',
        itinerary: [
          { day: 1, title: 'White Town Walk', activities: 'Explore French colonial architecture.' },
          { day: 2, title: 'Auroville Visit', activities: 'Meditation at Matrimandir.' }
        ]
      },
      {
        title: 'Varanasi Spiritual Journey', destination: 'Varanasi', duration: '3 Days / 2 Nights', price: 7500, image: '/varanasi_ghat_img_1776887717248.png', inclusions: ['Hotel', 'Boat Ride', 'Ganga Aarti', 'Temple Tour'], description: 'Immerse yourself in the spiritual energy of the oldest living city in the world.',
        itinerary: [
          { day: 1, title: 'Evening Aarti', activities: 'Witness the grand Ganga Aarti at Dashashwamedh Ghat.' },
          { day: 2, title: 'Morning Boat Ride', activities: 'Sunrise boat ride along the sacred river.' }
        ]
      },
      {
        title: 'Coorg Coffee Plantations', destination: 'Coorg', duration: '4 Days / 3 Nights', price: 13500, image: '/coorg_coffee_img_1776887732389.png', inclusions: ['Resort Stay', 'Meals', 'Plantation Tour', 'Jeep Safari'], description: 'Relax in the "Scotland of India" surrounded by lush green coffee estates.',
        itinerary: [
          { day: 1, title: 'Estate Check-in', activities: 'Relax and enjoy local Kodava cuisine.' },
          { day: 2, title: 'Abbey Falls & Trek', activities: 'Visit waterfalls and scenic viewpoints.' }
        ]
      },
      {
        title: 'Kedarnath Spiritual Yatra', destination: 'Kedarnath', duration: '5 Days / 4 Nights', price: 15500, image: '/uttarakhand_mountains_1776886114054.png', inclusions: ['Hotel', 'Helicopter Options', 'Meals', 'Guide'], description: 'Embark on a divine journey to the majestic Kedarnath temple nestled in the Garhwal Himalayas.',
        itinerary: [
          { day: 1, title: 'Arrival in Guptkashi', activities: 'Medical checkup and acclimatization.' },
          { day: 2, title: 'Trek to Kedarnath', activities: 'Darshan at the holy shrine and overnight stay.' }
        ]
      },
      {
        title: 'Chardham Complete Yatra', destination: 'Uttarakhand', duration: '12 Days / 11 Nights', price: 42000, image: '/sikkim_mountains_1776885816997.png', inclusions: ['Hotel', 'Transport', 'Meals', 'VIP Darshan'], description: 'The ultimate spiritual pilgrimage covering Yamunotri, Gangotri, Kedarnath, and Badrinath.',
        itinerary: [
          { day: 1, title: 'Haridwar to Barkot', activities: 'Scenic drive and preparation for Yamunotri.' },
          { day: 5, title: 'Gangotri Darshan', activities: 'Holy dip in the Ganges and temple visit.' },
          { day: 8, title: 'Kedarnath Trek', activities: 'Spiritual trek to the Jyotirlinga.' },
          { day: 10, title: 'Badrinath Darshan', activities: 'Visit to the sacred shrine of Lord Vishnu.' }
        ]
      }
    ]);

    console.log('Dummy data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = seedData;
