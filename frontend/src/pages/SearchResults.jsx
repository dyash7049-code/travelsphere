import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Plane, Bus, Train, TrendingDown, Building, Star, Check } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../api';
import InteractiveMap from '../components/InteractiveMap';
import SearchWidget from '../components/SearchWidget';

export default function SearchResults() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort States
  const [maxPrice, setMaxPrice] = useState(100000);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState('recommended');
  const [appliedSortBy, setAppliedSortBy] = useState('recommended');

  // Train Specific Filters State
  const [trainFilters, setTrainFilters] = useState({
    ac: false,
    available: false,
    depAfter6: false,
    arrBefore12: false,
    freeCancel: false,
    altPlan: false,
    quota: {
      general: true,
      ladies: false,
      tatkal: true
    },
    journeyClass: {
      '1A': false,
      '2A': false,
      '3A': false,
      'SL': false,
      'CC': false,
      'EC': false,
      'General': false
    }
  });
  const [appliedTrainFilters, setAppliedTrainFilters] = useState({
    ac: false,
    available: false,
    depAfter6: false,
    arrBefore12: false,
    freeCancel: false,
    altPlan: false,
    quota: {
      general: true,
      ladies: false,
      tatkal: true
    },
    journeyClass: {
      '1A': false,
      '2A': false,
      '3A': false,
      'SL': false,
      'CC': false,
      'EC': false,
      'General': false
    }
  });

  const getPrice = (item) => item.price || (item.classes && item.classes[0].price) || 0;

  const switchTransport = (newType) => {
    navigate(`/search/${newType}?source=${source}&destination=${destination}&date=${date}`);
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/api/search/${type}?source=${source}&destination=${destination}&date=${date}`)
      .then(res => {
        setResults(res.data);
        if (res.data.length > 0) {
          const highestPrice = Math.max(...res.data.map(getPrice));
          setMaxPrice(highestPrice);
          setAppliedMaxPrice(highestPrice);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [type, source, destination, date]);

  const handleApplyFilters = () => {
    setAppliedMaxPrice(maxPrice);
    setAppliedSortBy(sortBy);
    if (type === 'trains') {
      setAppliedTrainFilters(trainFilters);
    }
  };

  const handleTrainFilterChange = (category, field) => {
    if (category === 'quota') {
      setTrainFilters(prev => ({
        ...prev,
        quota: { ...prev.quota, [field]: !prev.quota[field] }
      }));
    } else if (category === 'journeyClass') {
      setTrainFilters(prev => ({
        ...prev,
        journeyClass: { ...prev.journeyClass, [field]: !prev.journeyClass[field] }
      }));
    } else {
      setTrainFilters(prev => ({ ...prev, [field]: !prev[field] }));
    }
  };

  const getFilteredAndSortedResults = () => {
    let filtered = results.filter(item => getPrice(item) <= appliedMaxPrice);
    
    // Train Specific Filtering Logic
    if (type === 'trains') {
      if (appliedTrainFilters.ac) {
        filtered = filtered.filter(item => item.classes && item.classes.some(c => c.className.includes('A') || c.className.includes('C')));
      }
      if (appliedTrainFilters.available) {
        filtered = filtered.filter(item => item.classes && item.classes.some(c => c.availableSeats > 0));
      }
      if (appliedTrainFilters.depAfter6) {
        filtered = filtered.filter(item => new Date(item.departureTime).getHours() >= 18);
      }
      if (appliedTrainFilters.arrBefore12) {
        filtered = filtered.filter(item => new Date(item.arrivalTime).getHours() < 12);
      }
      
      // Journey Class Filtering
      const activeClasses = Object.keys(appliedTrainFilters.journeyClass).filter(k => appliedTrainFilters.journeyClass[k]);
      if (activeClasses.length > 0) {
        filtered = filtered.filter(item => 
          item.classes && item.classes.some(c => activeClasses.includes(c.className))
        );
      }
    }

    if (appliedSortBy === 'price_low') {
      filtered.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (appliedSortBy === 'price_high') {
      filtered.sort((a, b) => getPrice(b) - getPrice(a));
    } else if (appliedSortBy === 'rating' && type === 'hotels') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    
    return filtered;
  };

  const displayResults = getFilteredAndSortedResults();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Search Widget */}
      <div className="pt-6 px-4 relative z-20">
        <SearchWidget isResultsPage={true} />
      </div>

      {/* Flight Scene Images */}
      {type === 'flights' && (!source || !destination) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[250px]">
            <div className="rounded-xl overflow-hidden shadow-md md:col-span-2 relative group">
              <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80" alt="Flight Scene" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-6 text-white">
                <h3 className="text-2xl font-bold">Explore the Skies</h3>
                <p className="text-sm text-gray-200">Find the best deals on domestic and international flights.</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-md relative group hidden md:block">
              <img src="https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&q=80" alt="Airplane Wing" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        {/* Horizontal Filters Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-gray-700">Filters:</span>
          </div>
          <div className="flex-1 flex flex-col md:flex-row items-center gap-6 w-full">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">Max Price: ₹{maxPrice}</span>
              <input 
                type="range" 
                min="0" 
                max={Math.max(...results.map(getPrice), 10000)} 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full md:w-48 accent-brand-primary" 
              />
            </div>
            
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">Sort By:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:border-brand-primary"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                {type === 'hotels' && <option value="rating">Rating: High to Low</option>}
              </select>
            </div>
            
            <button 
              onClick={handleApplyFilters}
              className="bg-brand-primary text-white px-6 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition shadow-sm w-full md:w-auto"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full flex flex-col md:flex-row gap-6">
        
        {/* Train Specific Sidebar Filters */}
        {type === 'trains' && (
          <div className="w-full md:w-64 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-bold text-gray-900 mb-3">Ticket Types</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center space-x-2"><input type="checkbox" checked={trainFilters.freeCancel} onChange={() => handleTrainFilterChange('ticket', 'freeCancel')} className="rounded text-brand-primary focus:ring-brand-primary w-4 h-4"/> <span>Free Cancellation</span></div>
                  <span className="text-gray-400 text-xs">44</span>
                </label>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center space-x-2"><input type="checkbox" checked={trainFilters.altPlan} onChange={() => handleTrainFilterChange('ticket', 'altPlan')} className="rounded text-brand-primary focus:ring-brand-primary w-4 h-4"/> <span className="leading-tight">Alternate Trip Plan (previously Trip Guarantee)</span></div>
                  <span className="text-gray-400 text-xs">58</span>
                </label>
              </div>
            </div>
            
            <button 
              onClick={handleApplyFilters}
              className="w-full bg-brand-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition shadow-sm"
            >
              Apply Sidebar Filters
            </button>
          </div>
        )}

        {/* Results & Chart Area */}
        <div className="flex-1 space-y-6 w-full">
          
          {/* Price Comparison Chart */}
          {!loading && displayResults.length > 0 && type === 'flights' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center"><TrendingDown className="mr-2 text-green-500" /> Price Comparison</h2>
              <div className="flex items-end space-x-4 h-32 overflow-x-auto pb-2">
                {displayResults.map((item, idx) => {
                  // Calculate height percentage based on max price in results
                  const maxChartPrice = Math.max(...displayResults.map(r => r.price));
                  const heightPercent = Math.max((item.price / maxChartPrice) * 100, 20); // Min 20% height
                  return (
                    <div key={`chart-${idx}`} className="flex flex-col items-center flex-1 min-w-[60px]">
                      <span className="text-xs font-bold text-gray-500 mb-2">₹{item.price}</span>
                      <div className="w-8 bg-blue-100 rounded-t-md relative group hover:bg-brand-primary transition cursor-pointer" style={{ height: `${heightPercent}%` }}>
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                          {item.airline}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {type === 'hotels' ? (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column: Hotel Grid */}
              <div className="w-full lg:w-[55%]">
                {loading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                  </div>
                ) : displayResults.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No {type} found</h2>
                    <p className="text-gray-500 mb-4">We couldn't find any {type} for your search criteria or applied filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {displayResults.map((item) => (
                      <div key={item._id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition flex flex-col overflow-hidden border border-gray-100 group">
                        <div className="h-48 w-full relative overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm flex items-center">
                            <Star size={12} fill="#fbbf24" className="text-yellow-400 mr-1" /> {item.rating}.0
                          </div>
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-1">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-gray-900 truncate pr-2">{item.name}</h3>
                            </div>
                            <p className="text-gray-500 text-xs mb-3 flex items-center">
                              <Building size={12} className="mr-1" /> {item.city}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-4">
                              {item.amenities.slice(0, 2).map((amenity, i) => (
                                <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {amenity}
                                </span>
                              ))}
                              {item.amenities.length > 2 && (
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  +{item.amenities.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-end pt-3 border-t border-gray-100 mt-auto">
                            <div>
                              <p className="text-[10px] text-gray-500">Per Night</p>
                              <p className="font-bold text-lg text-gray-900 leading-none mt-1">₹{item.price}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/booking?type=hotels&name=${encodeURIComponent(item.name)}&source=${encodeURIComponent(item.city)}&date=${date}&price=${item.price}&image=${encodeURIComponent(item.image || '')}`); }}
                              className="bg-brand-primary text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition shadow-sm"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Right Column: Sticky Interactive Map */}
              <div className="w-full lg:w-[45%] hidden lg:block h-[calc(100vh-100px)] sticky top-4 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                {!loading && displayResults.length > 0 && (
                  <InteractiveMap locations={displayResults} city={source} />
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                </div>
              ) : displayResults.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">No {type} found</h2>
                  <p className="text-gray-500 mb-4">We couldn't find any {type} for your search criteria or applied filters.</p>
                </div>
              ) : (
                displayResults.map((item) => (
                  <div key={item._id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-center gap-6 border border-gray-100">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="text-center w-24">
                        <p className="font-bold text-xl">{new Date(item.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <p className="text-xs text-gray-500">{item.source}</p>
                      </div>
                      
                      <div className="flex flex-col items-center flex-1 md:w-48 px-4 relative">
                        <p className="text-xs text-gray-400 mb-1">{item.duration}</p>
                        <div className="w-full h-[1px] bg-gray-300 relative">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-400">
                            {type === 'flights' ? '✈️' : type === 'buses' ? '🚌' : '🚆'}
                          </div>
                        </div>
                        <p className="text-xs text-brand-secondary font-semibold mt-2">{item.airline || item.operator || item.trainName}</p>
                      </div>

                      <div className="text-center w-24">
                        <p className="font-bold text-xl">{new Date(item.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <p className="text-xs text-gray-500">{item.destination}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto mt-4 md:mt-0">
                      <p className="text-2xl font-bold text-gray-900 mb-2">₹{item.price || (item.classes && item.classes[0].price)}</p>
                      <button
                        onClick={() => navigate(`/booking?type=${type}&name=${encodeURIComponent(item.airline || item.operator || item.trainName || '')}&source=${encodeURIComponent(item.source || source)}&destination=${encodeURIComponent(item.destination || destination)}&date=${date}&price=${item.price || (item.classes && item.classes[0].price)}&departure=${encodeURIComponent(new Date(item.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))}&arrival=${encodeURIComponent(new Date(item.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))}&duration=${encodeURIComponent(item.duration || '')}`)}
                        className="bg-brand-primary text-white px-8 py-2 rounded-full font-bold hover:bg-blue-600 transition shadow-md hover:shadow-lg w-full md:w-auto"
                      >
                        BOOK NOW
                      </button>
                      <p className="text-xs text-green-600 mt-2 font-semibold">
                        {item.availableSeats || (item.classes && item.classes[0].availableSeats) || Math.floor(Math.random() * 50) + 1} Seats Left
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
