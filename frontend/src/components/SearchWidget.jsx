import { useState, useRef, useEffect } from 'react';
import { Plane, Bus, Train, MapPin, Building, Package, Car, CreditCard, ShieldCheck, ArrowRightLeft, User, Calendar, Home } from 'lucide-react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../api';

export default function SearchWidget({ isResultsPage }) {
  const [searchParams] = useSearchParams();
  const { type } = useParams();
  
  const [activeTab, setActiveTab] = useState(type || 'flights');
  const [tripType, setTripType] = useState('one-way');
  const [source, setSource] = useState(searchParams.get('source') || 'Delhi');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Mumbai');
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [specialFare, setSpecialFare] = useState('regular');
  
  const navigate = useNavigate();

  const [showSourceOpts, setShowSourceOpts] = useState(false);
  const [showDestOpts, setShowDestOpts] = useState(false);
  
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  const sourceRef = useRef(null);
  const destRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (sourceRef.current && !sourceRef.current.contains(event.target)) setShowSourceOpts(false);
      if (destRef.current && !destRef.current.contains(event.target)) setShowDestOpts(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (showSourceOpts && source.length > 1) {
        axios.get(`${API_BASE}/api/locations/${activeTab}?q=${source}`)
          .then(res => setSourceSuggestions(res.data))
          .catch(err => console.error(err));
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [source, activeTab, showSourceOpts]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (showDestOpts && destination.length > 1) {
        axios.get(`${API_BASE}/api/locations/${activeTab}?q=${destination}`)
          .then(res => setDestSuggestions(res.data))
          .catch(err => console.error(err));
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [destination, activeTab, showDestOpts]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'hotels') {
      if (source) navigate(`/search/${activeTab}?source=${source}&date=${date}`);
    } else {
      if (source && destination) navigate(`/search/${activeTab}?source=${source}&destination=${destination}&date=${date}`);
    }
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const tabs = [
    { id: 'home', icon: <Home size={24} />, label: 'Home' },
    { id: 'flights', icon: <Plane size={24} />, label: 'Flights' },
    { id: 'hotels', icon: <Building size={24} />, label: 'Hotels' },
    { id: 'trains', icon: <Train size={24} />, label: 'Trains' },
    { id: 'buses', icon: <Bus size={24} />, label: 'Buses' },
    { id: 'packages', icon: <Package size={24} />, label: 'Holiday Packages' }
  ];

  const marginClass = isResultsPage ? 'mt-4 mb-6 shadow-sm border border-gray-200' : '-mt-16 shadow-2xl';

  return (
    <div className={`bg-white rounded-2xl w-full max-w-6xl mx-auto relative z-10 pb-10 ${marginClass}`}>
      
      {/* Top Tabs */}
      <div className="flex justify-center items-center overflow-x-auto hide-scrollbar pt-6 pb-2 px-4 shadow-sm border-b border-gray-100">
        <div className="flex space-x-6 md:space-x-10">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                if (tab.id === 'home') {
                  navigate('/');
                } else if (tab.id === 'packages') {
                  navigate('/packages');
                } else {
                  const params = new URLSearchParams();
                  if (source) params.set('source', source);
                  if (destination && tab.id !== 'hotels') params.set('destination', destination);
                  if (date) params.set('date', date);
                  setActiveTab(tab.id);
                  navigate(`/search/${tab.id}?${params.toString()}`);
                }
              }}
              className={`flex flex-col items-center justify-center space-y-1 pb-3 px-2 transition-all relative whitespace-nowrap
                ${activeTab === tab.id ? 'text-blue-500 font-bold' : 'text-gray-500 hover:text-blue-400 font-semibold'}`}
            >
              <div className={`${activeTab === tab.id ? 'bg-blue-50 p-2 rounded-full text-blue-500 shadow-sm' : 'p-2'}`}>
                {tab.icon}
              </div>
              <span className="text-xs">{tab.label}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-500 rounded-t-full shadow-[0_-2px_4px_rgba(59,130,246,0.5)]"></div>}
            </button>
          ))}
        </div>
      </div>

      {/* AI Assistant Banner */}
      {!isResultsPage && (
        <div className="mx-6 md:mx-12 mt-4 cursor-pointer hover:shadow-md transition">
          <div className="bg-gradient-to-r from-green-50 via-blue-50 to-green-50 border border-green-100 rounded-lg py-2 px-4 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-800 flex items-center">
              <span className="text-blue-600 italic mr-2">Try TravelSphere AI</span> Your Assistant for Flights & Stays <span className="ml-2">→</span>
            </span>
          </div>
        </div>
      )}

      {/* Main Search Area */}
      <div className="px-6 md:px-12 pt-6">
        
        {/* Trip Type Radio (Only for Flights/Buses/Trains) */}
        {['flights', 'buses', 'trains'].includes(activeTab) && (
          <div className="flex items-center space-x-6 mb-4 text-sm font-bold text-gray-700">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="tripType" checked={tripType === 'one-way'} onChange={() => setTripType('one-way')} className="w-4 h-4 text-blue-500 focus:ring-blue-500" />
              <span>One Way</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="tripType" checked={tripType === 'round-trip'} onChange={() => setTripType('round-trip')} className="w-4 h-4 text-blue-500 focus:ring-blue-500" />
              <span>Round Trip</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="tripType" checked={tripType === 'multi-city'} onChange={() => setTripType('multi-city')} className="w-4 h-4 text-blue-500 focus:ring-blue-500" />
              <span>Multi City</span>
            </label>
            <span className="hidden md:block ml-auto text-xs font-semibold text-gray-500">Book International and Domestic {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
          </div>
        )}

        {/* Hotel Specific Top Row */}
        {activeTab === 'hotels' && (
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="flex items-center space-x-6 font-bold text-gray-700">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="hotelBookingType" checked={true} readOnly className="w-4 h-4 text-blue-500 focus:ring-blue-500" />
                <span>Upto 4 Rooms</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="hotelBookingType" disabled className="w-4 h-4 text-gray-300" />
                <span className="text-gray-500">Group Deals</span>
                <span className="bg-pink-500 text-white text-[10px] px-1 rounded font-bold uppercase ml-1">New</span>
              </label>
            </div>
            <span className="hidden md:block text-xs font-semibold text-gray-700">
              Book Domestic and International Property Online. To list your property <a href="#" className="text-blue-500 hover:underline">Click Here</a>
            </span>
          </div>
        )}

        {/* Big Search Input Container */}
        <form onSubmit={handleSearch} className="relative">
          <div className="border border-gray-300 rounded-xl flex flex-col md:flex-row w-full bg-white shadow-sm hover:shadow-md transition-shadow relative z-20">
            
            {/* FROM / CITY */}
            <div className={`p-3 pl-5 md:w-[28%] border-b md:border-b-0 md:border-r border-gray-200 hover:bg-blue-50/50 transition cursor-text rounded-t-xl md:rounded-tr-none md:rounded-l-xl relative`} ref={sourceRef} onClick={() => {sourceRef.current.querySelector('input').focus(); setShowSourceOpts(true);}}>
              <span className="text-sm font-semibold text-gray-500 block">{activeTab === 'hotels' ? 'City, Property Name Or Location' : 'From'}</span>
              <input 
                type="text" 
                value={source}
                onChange={(e) => { setSource(e.target.value); setShowSourceOpts(true); }}
                onFocus={() => { setSource(''); setShowSourceOpts(true); }}
                className="w-full text-3xl font-black text-gray-900 bg-transparent outline-none mt-1"
                placeholder={activeTab === 'hotels' ? 'Goa' : 'Type to search...'}
                autoComplete="off"
                required
              />
              <span className="text-xs text-gray-500 truncate block mt-1">{source ? (activeTab === 'hotels' ? 'India' : activeTab === 'trains' ? `${source} Railway Station, India` : activeTab === 'buses' ? `${source} Bus Stand, India` : `${source} Airport, India`) : (activeTab === 'hotels' ? 'Select city' : 'Select origin')}</span>
              
              {showSourceOpts && (
                <ul className="absolute top-[105%] left-0 w-full md:w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                  {sourceSuggestions.map((loc, idx) => (
                    <li key={idx} className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition flex items-start space-x-3" onClick={(e) => { e.stopPropagation(); setSource(loc.city); setShowSourceOpts(false); }}>
                      <MapPin size={18} className="text-gray-400 mt-1" />
                      <div>
                        <p className="font-bold text-gray-900">{loc.city}</p>
                        <p className="text-xs text-gray-500">{loc.detail}</p>
                      </div>
                    </li>
                  ))}
                  {sourceSuggestions.length === 0 && <li className="p-3 text-sm text-gray-500">Type to search...</li>}
                </ul>
              )}
            </div>

            {/* Swap Button (Absolute) */}
            {activeTab !== 'hotels' && (
              <div 
                className="hidden md:flex absolute left-[28%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm cursor-pointer hover:shadow-md z-30 text-blue-500 transition-transform hover:rotate-180"
                onClick={handleSwap}
              >
                <ArrowRightLeft size={18} />
              </div>
            )}

            {/* TO (Hidden for Hotels) */}
            {activeTab !== 'hotels' && (
              <div className="p-3 pl-8 md:w-[28%] border-b md:border-b-0 md:border-r border-gray-200 hover:bg-blue-50/50 transition cursor-text relative" ref={destRef} onClick={() => {destRef.current.querySelector('input').focus(); setShowDestOpts(true);}}>
                <span className="text-sm font-semibold text-gray-500 block">To</span>
                <input 
                  type="text" 
                  value={destination}
                  onChange={(e) => { setDestination(e.target.value); setShowDestOpts(true); }}
                  onFocus={() => { setDestination(''); setShowDestOpts(true); }}
                  className="w-full text-3xl font-black text-gray-900 bg-transparent outline-none mt-1"
                  placeholder="Type to search..."
                  autoComplete="off"
                  required
                />
                <span className="text-xs text-gray-500 truncate block mt-1">{destination ? (activeTab === 'trains' ? `${destination} Railway Station, India` : activeTab === 'buses' ? `${destination} Bus Stand, India` : `${destination} Airport, India`) : 'Select destination'}</span>
                
                {showDestOpts && (
                  <ul className="absolute top-[105%] left-0 w-full md:w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                    {destSuggestions.map((loc, idx) => (
                      <li key={idx} className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition flex items-start space-x-3" onClick={(e) => { e.stopPropagation(); setDestination(loc.city); setShowDestOpts(false); }}>
                        <MapPin size={18} className="text-gray-400 mt-1" />
                        <div>
                          <p className="font-bold text-gray-900">{loc.city}</p>
                          <p className="text-xs text-gray-500">{loc.detail}</p>
                        </div>
                      </li>
                    ))}
                    {destSuggestions.length === 0 && <li className="p-3 text-sm text-gray-500">Type to search...</li>}
                  </ul>
                )}
              </div>
            )}

            {/* DEPARTURE / CHECK-IN */}
            <div className={`p-3 pl-5 ${activeTab === 'hotels' ? 'md:w-[18%]' : 'md:w-[15%]'} border-b md:border-b-0 md:border-r border-gray-200 hover:bg-blue-50/50 transition cursor-pointer relative group`}>
              <span className="text-sm font-semibold text-gray-500 block flex items-center">{activeTab === 'hotels' ? 'Check-In' : 'Departure'} <Calendar size={12} className="ml-1"/></span>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xl font-black text-gray-900 bg-transparent outline-none mt-1 cursor-pointer"
                required
              />
              <span className="text-xs text-gray-500 block mt-1">{new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
            </div>

            {/* RETURN / CHECK-OUT */}
            <div className={`p-3 pl-5 ${activeTab === 'hotels' ? 'md:w-[18%]' : 'md:w-[15%]'} border-b md:border-b-0 md:border-r border-gray-200 hover:bg-blue-50/50 transition cursor-pointer relative ${tripType === 'one-way' && activeTab !== 'hotels' ? 'opacity-50' : ''}`}>
              <span className="text-sm font-semibold text-gray-500 block flex items-center">{activeTab === 'hotels' ? 'Check-Out' : 'Return'} <Calendar size={12} className="ml-1"/></span>
              {tripType === 'one-way' && activeTab !== 'hotels' ? (
                <div className="mt-2" onClick={() => setTripType('round-trip')}>
                  <span className="text-sm text-gray-500 font-semibold cursor-pointer">Tap to add a return date for bigger discounts</span>
                </div>
              ) : (
                <>
                  <input 
                    type="date" 
                    defaultValue={new Date(Date.now() + 86400000 * (activeTab === 'hotels' ? 1 : 3)).toISOString().split('T')[0]}
                    className="w-full text-xl font-black text-gray-900 bg-transparent outline-none mt-1 cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 block mt-1">{new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                </>
              )}
            </div>

            {/* TRAVELLERS / ROOMS & GUESTS */}
            <div className={`p-3 pl-5 ${activeTab === 'hotels' ? 'md:w-[20%]' : 'md:w-[14%]'} ${activeTab === 'hotels' ? 'border-b md:border-b-0 md:border-r border-gray-200' : 'rounded-b-xl md:rounded-bl-none md:rounded-r-xl'} hover:bg-blue-50/50 transition cursor-pointer relative`}>
              <span className="text-sm font-semibold text-gray-500 block flex items-center">{activeTab === 'hotels' ? 'Rooms & Guests' : 'Travellers & Class'}</span>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-3xl font-black text-gray-900">1</span>
                <span className="text-lg font-bold text-gray-900">{activeTab === 'hotels' ? 'Rooms' : 'Traveller'}</span>
                {activeTab === 'hotels' && (
                  <>
                    <span className="text-3xl font-black text-gray-900 ml-2">2</span>
                    <span className="text-lg font-bold text-gray-900">Adults</span>
                  </>
                )}
              </div>
              <span className="text-xs text-gray-500 block mt-1 truncate">{activeTab === 'hotels' ? '' : 'Economy/Premium Economy'}</span>
            </div>

            {/* PRICE PER NIGHT (Hotels Only) */}
            {activeTab === 'hotels' && (
              <div className="p-3 pl-5 md:w-[16%] hover:bg-blue-50/50 transition cursor-pointer rounded-b-xl md:rounded-bl-none md:rounded-r-xl relative">
                <span className="text-sm font-semibold text-gray-500 block flex items-center">Price Per Night <span className="ml-1">v</span></span>
                <div className="mt-2 text-sm font-bold text-gray-800 leading-tight">
                  ₹0-₹1500, ₹1500-₹2500,...
                </div>
              </div>
            )}

          </div>

          {/* Trending Searches Row (Hotels Only) */}
          {activeTab === 'hotels' && (
            <div className="flex items-center justify-center mt-6 mb-2 space-x-4 pb-8 md:pb-0">
              <span className="font-bold text-xs text-gray-600">Trending Searches:</span>
              <div className="flex space-x-2">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-md cursor-pointer hover:bg-gray-200 transition">Mumbai, India</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-md cursor-pointer hover:bg-gray-200 transition">Dubai, United Arab Emirates</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-md cursor-pointer hover:bg-gray-200 transition">New York, United States</span>
              </div>
            </div>
          )}

          {/* Special Fares Row (Flights Only) */}
          {['flights'].includes(activeTab) && (
            <div className="flex flex-col md:flex-row items-start md:items-center mt-6 mb-2 space-y-3 md:space-y-0 md:space-x-4 pb-8 md:pb-0">
              <span className="font-bold text-[10px] uppercase text-gray-500 tracking-wider w-16">Special Fares</span>
              <div className="flex flex-wrap gap-2">
                <button 
                  type="button"
                  onClick={() => setSpecialFare('regular')}
                  className={`border rounded-lg px-3 py-1 flex flex-col items-start transition-all ${specialFare === 'regular' ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100'}`}
                >
                  <span className={`text-xs font-bold ${specialFare === 'regular' ? 'text-blue-700' : 'text-gray-700'}`}>Regular</span>
                  <span className="text-[10px] text-gray-500">Regular fares</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSpecialFare('student')}
                  className={`border rounded-lg px-3 py-1 flex flex-col items-start transition-all ${specialFare === 'student' ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100'}`}
                >
                  <span className={`text-xs font-bold ${specialFare === 'student' ? 'text-blue-700' : 'text-gray-700'}`}>Student</span>
                  <span className="text-[10px] text-gray-500">Extra discounts</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSpecialFare('armed')}
                  className={`border rounded-lg px-3 py-1 flex flex-col items-start transition-all ${specialFare === 'armed' ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100'}`}
                >
                  <span className={`text-xs font-bold ${specialFare === 'armed' ? 'text-blue-700' : 'text-gray-700'}`}>Armed Forces</span>
                  <span className="text-[10px] text-gray-500">Up to ₹600 off</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setSpecialFare('senior')}
                  className={`border rounded-lg px-3 py-1 flex flex-col items-start transition-all ${specialFare === 'senior' ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100'}`}
                >
                  <span className={`text-xs font-bold ${specialFare === 'senior' ? 'text-blue-700' : 'text-gray-700'}`}>Senior Citizen</span>
                  <span className="text-[10px] text-gray-500">Up to ₹600 off</span>
                </button>
              </div>
            </div>
          )}

          {/* Giant Search Button overlapping bottom edge */}
          <div className="absolute -bottom-[68px] left-1/2 transform -translate-x-1/2 z-50">
            <button 
              type="submit" 
              className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-black text-2xl px-16 py-3 rounded-full shadow-[0_4px_14px_0_rgba(59,130,246,0.5)] transition-transform transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(59,130,246,0.6)] w-[240px]"
            >
              SEARCH
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
