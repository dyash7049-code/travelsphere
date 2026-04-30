import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Sparkles, Map, Calendar, Wallet } from 'lucide-react';

export default function Planner() {
  const [budget, setBudget] = useState('');
  const [days, setDays] = useState('');
  const [destinationType, setDestinationType] = useState('beach');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const generatePlan = (e) => {
    e.preventDefault();
    setLoading(true);
    setPlan(null);

    // Mock AI Generation delay
    setTimeout(() => {
      let mockPlan = {
        title: '',
        description: '',
        flight: { route: 'Delhi to Destination', price: 4500, airline: 'IndiGo' },
        hotel: { name: 'Premium Resort', pricePerNight: 2500 },
        dailyBudget: 0,
        totalEstimated: 0
      };

      const budgetVal = parseInt(budget);
      const daysVal = parseInt(days);

      if (destinationType === 'beach') {
        mockPlan.title = 'Tropical Goa Getaway';
        mockPlan.description = 'Experience the pristine beaches and vibrant nightlife of North Goa.';
        mockPlan.hotel.name = 'Taj Holiday Village Resort';
      } else if (destinationType === 'mountain') {
        mockPlan.title = 'Magical Manali Retreat';
        mockPlan.description = 'Enjoy the snow-capped peaks and adventure sports in Solang Valley.';
        mockPlan.hotel.name = 'The Himalayan Resort';
      } else {
        mockPlan.title = 'Cultural Jaipur Tour';
        mockPlan.description = 'Explore the royal palaces and rich heritage of the Pink City.';
        mockPlan.hotel.name = 'Rambagh Palace';
      }

      mockPlan.dailyBudget = Math.floor((budgetVal - mockPlan.flight.price) / daysVal);
      mockPlan.totalEstimated = mockPlan.flight.price + (mockPlan.hotel.pricePerNight * daysVal) + (mockPlan.dailyBudget * daysVal);

      setPlan(mockPlan);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Sparkles size={48} className="mx-auto mb-4 text-yellow-300" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">AI Trip Planner</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">Tell us your budget and preferences, and our AI will craft the perfect itinerary for you in seconds.</p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full flex flex-col md:flex-row gap-8">
        
        {/* Input Form */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl shadow-xl h-fit border border-purple-100">
          <h2 className="text-xl font-bold mb-6 flex items-center"><Map className="mr-2 text-purple-600"/> Trip Details</h2>
          <form onSubmit={generatePlan} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget (₹)</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="number" required min="10000" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 25000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="number" required min="1" max="30" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" value={days} onChange={e => setDays(e.target.value)} placeholder="e.g. 5" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vibe</label>
              <select className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" value={destinationType} onChange={e => setDestinationType(e.target.value)}>
                <option value="beach">Beach & Relax</option>
                <option value="mountain">Mountains & Nature</option>
                <option value="heritage">Heritage & Culture</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition flex justify-center items-center">
              {loading ? <Sparkles className="animate-spin" /> : 'Generate My Trip ✨'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="flex-1">
          {!loading && !plan && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
              <Sparkles size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Your AI-generated itinerary will appear here.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-bold text-purple-800 animate-pulse">Analyzing millions of routes and hotels...</p>
            </div>
          )}

          {plan && !loading && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 border border-purple-100">
              <div className="bg-purple-50 p-6 border-b border-purple-100">
                <span className="bg-purple-200 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">AI Suggestion</span>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{plan.title}</h2>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center mb-2">✈️ Recommended Flight</h3>
                    <p className="text-sm text-gray-500">{plan.flight.airline} • {plan.flight.route}</p>
                    <p className="text-xl font-bold text-gray-900 mt-2">₹{plan.flight.price}</p>
                  </div>
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center mb-2">🏨 Recommended Stay</h3>
                    <p className="text-sm text-gray-500">{plan.hotel.name} • {days} Nights</p>
                    <p className="text-xl font-bold text-gray-900 mt-2">₹{plan.hotel.pricePerNight} <span className="text-sm font-normal text-gray-500">/night</span></p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="font-bold text-green-800 mb-4">Budget Breakdown</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between"><span>Flights:</span> <strong>₹{plan.flight.price}</strong></div>
                    <div className="flex justify-between"><span>Accommodation ({days} nights):</span> <strong>₹{plan.hotel.pricePerNight * days}</strong></div>
                    <div className="flex justify-between"><span>Daily Allowance ({days} days):</span> <strong>₹{plan.dailyBudget * days}</strong></div>
                    <div className="border-t border-green-200 pt-2 mt-2 flex justify-between text-lg text-green-900">
                      <strong>Total Estimated:</strong> <strong>₹{plan.totalEstimated}</strong>
                    </div>
                  </div>
                </div>
                
                <button className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition shadow-lg">
                  Book This Entire Trip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
