import { useEffect, useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Star, Filter, ChevronDown, Search, ArrowUpDown, Heart, Users, Sparkles, ArrowRight, X, Check, Home, Plane, Building, Package, Train, Bus } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../api';

const SORT_OPTIONS = [
  { id: 'popular', label: 'Popular' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'duration-short', label: 'Duration: Shortest' },
  { id: 'duration-long', label: 'Duration: Longest' },
];

const BUDGET_RANGES = [
  { id: 'all', label: 'All Budgets', min: 0, max: Infinity },
  { id: 'budget', label: 'Under ₹10K', min: 0, max: 10000 },
  { id: 'mid', label: '₹10K - ₹20K', min: 10000, max: 20000 },
  { id: 'premium', label: '₹20K - ₹30K', min: 20000, max: 30000 },
  { id: 'luxury', label: '₹30K+', min: 30000, max: Infinity },
];

const DURATION_FILTERS = [
  { id: 'all', label: 'Any Duration' },
  { id: 'short', label: '1–3 Days', max: 3 },
  { id: 'medium', label: '4–6 Days', min: 4, max: 6 },
  { id: 'long', label: '7+ Days', min: 7 },
];

function parseDurationDays(durationStr) {
  const match = durationStr.match(/(\d+)\s*Days?/i);
  return match ? parseInt(match[1], 10) : 0;
}

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    axios.get(`${API_BASE}/api/packages`)
      .then(res => {
        setPackages(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Extract unique destinations for filter pills
  const destinations = useMemo(() => {
    const dests = [...new Set(packages.map(p => p.destination))];
    return ['all', ...dests];
  }, [packages]);

  // Category groupings
  const categories = [
    { id: 'all', label: 'All Packages', icon: '🌍' },
    { id: 'beach', label: 'Beach', icon: '🏖️', keywords: ['goa', 'andaman', 'pondicherry', 'kerala'] },
    { id: 'mountain', label: 'Mountains', icon: '🏔️', keywords: ['manali', 'ladakh', 'kedarnath', 'uttarakhand', 'darjeeling', 'sikkim', 'srinagar', 'kashmir'] },
    { id: 'heritage', label: 'Heritage', icon: '🏛️', keywords: ['jaipur', 'agra', 'udaipur', 'hampi', 'varanasi', 'rajasthan'] },
    { id: 'nature', label: 'Nature', icon: '🌿', keywords: ['coorg', 'munnar', 'meghalaya', 'shillong', 'kutch', 'gujarat'] },
    { id: 'spiritual', label: 'Spiritual', icon: '🙏', keywords: ['kedarnath', 'varanasi', 'chardham', 'uttarakhand'] },
  ];

  const filteredPackages = useMemo(() => {
    let filtered = [...packages];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.destination.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory !== 'all') {
      const cat = categories.find(c => c.id === activeCategory);
      if (cat && cat.keywords) {
        filtered = filtered.filter(p =>
          cat.keywords.some(k => p.destination.toLowerCase().includes(k) || p.title.toLowerCase().includes(k))
        );
      }
    }

    // Budget filter
    if (budgetFilter !== 'all') {
      const range = BUDGET_RANGES.find(b => b.id === budgetFilter);
      if (range) {
        filtered = filtered.filter(p => p.price >= range.min && p.price < range.max);
      }
    }

    // Duration filter
    if (durationFilter !== 'all') {
      const durFilter = DURATION_FILTERS.find(d => d.id === durationFilter);
      if (durFilter) {
        filtered = filtered.filter(p => {
          const days = parseDurationDays(p.duration);
          if (durFilter.min && durFilter.max) return days >= durFilter.min && days <= durFilter.max;
          if (durFilter.max) return days <= durFilter.max;
          if (durFilter.min) return days >= durFilter.min;
          return true;
        });
      }
    }

    // Sort
    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
      case 'duration-short': filtered.sort((a, b) => parseDurationDays(a.duration) - parseDurationDays(b.duration)); break;
      case 'duration-long': filtered.sort((a, b) => parseDurationDays(b.duration) - parseDurationDays(a.duration)); break;
      default: break;
    }

    return filtered;
  }, [packages, searchQuery, activeCategory, budgetFilter, durationFilter, sortBy]);

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeFiltersCount = [budgetFilter !== 'all', durationFilter !== 'all', activeCategory !== 'all'].filter(Boolean).length;

  const navigate = useNavigate();

  const navTabs = [
    { id: 'home', icon: <Home size={24} />, label: 'Home', path: '/' },
    { id: 'flights', icon: <Plane size={24} />, label: 'Flights', path: '/search/flights' },
    { id: 'hotels', icon: <Building size={24} />, label: 'Hotels', path: '/search/hotels' },
    { id: 'trains', icon: <Train size={24} />, label: 'Trains', path: '/search/trains' },
    { id: 'buses', icon: <Bus size={24} />, label: 'Buses', path: '/search/buses' },
    { id: 'packages', icon: <Package size={24} />, label: 'Holiday Packages', path: '/packages' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center overflow-x-auto hide-scrollbar py-2">
            <div className="flex space-x-6 md:space-x-10">
              {navTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`flex flex-col items-center justify-center space-y-1 pb-2 px-2 transition-all relative whitespace-nowrap
                    ${tab.id === 'packages' ? 'text-blue-500 font-bold' : 'text-gray-500 hover:text-blue-400 font-semibold'}`}
                >
                  <div className={`${tab.id === 'packages' ? 'bg-blue-50 p-2 rounded-full text-blue-500 shadow-sm' : 'p-2'}`}>
                    {tab.icon}
                  </div>
                  <span className="text-xs">{tab.label}</span>
                  {tab.id === 'packages' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-500 rounded-t-full shadow-[0_-2px_4px_rgba(59,130,246,0.5)]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Section with gradient overlay */}
      <div className="relative h-[340px] md:h-[380px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[3000ms] hover:scale-100"
          style={{ backgroundImage: "url('/kashmir_valley_img_1776887624164.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/60 to-gray-50" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} className="text-amber-400 animate-pulse" />
            <span className="text-sm font-semibold uppercase tracking-widest text-amber-300">Curated Experiences</span>
            <Sparkles size={20} className="text-amber-400 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 text-center leading-tight">
            Holiday Packages
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl text-center mb-6">
            Handpicked destinations with the best itineraries, stays & experiences — all at unbeatable prices.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-1.5">
              <Check size={16} className="text-green-400" />
              <span>Best Price Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={16} className="text-green-400" />
              <span>Free Cancellation</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <Check size={16} className="text-green-400" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-5">
          {/* Search Input */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by destination, package name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition"
              />
            </div>
            <div className="flex gap-2 items-center">
              {/* Budget Dropdown */}
              <select
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer"
              >
                {BUDGET_RANGES.map(b => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
              {/* Duration Dropdown */}
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer"
              >
                {DURATION_FILTERS.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  <ArrowUpDown size={14} />
                  <span className="hidden md:inline">Sort</span>
                  <ChevronDown size={14} />
                </button>
                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => { setSortBy(opt.id); setShowSortDropdown(false); }}
                          className={`w-full px-4 py-2.5 text-left text-sm font-medium transition
                            ${sortBy === opt.id ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all
                  ${activeCategory === cat.id
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Info Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{filteredPackages.length}</span> packages
          {searchQuery && <span> for "<span className="text-brand-primary">{searchQuery}</span>"</span>}
        </p>
        {activeFiltersCount > 0 && (
          <button
            onClick={() => { setActiveCategory('all'); setBudgetFilter('all'); setDurationFilter('all'); }}
            className="text-sm font-semibold text-brand-primary hover:text-blue-700 flex items-center gap-1 transition"
          >
            <X size={14} />
            Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Packages Grid */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
              <div className="absolute inset-0 rounded-full border-4 border-t-brand-primary animate-spin" />
            </div>
            <p className="mt-4 text-gray-500 font-medium">Loading amazing packages...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-500 max-w-md">Try adjusting your search or filters to discover more travel packages.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); setBudgetFilter('all'); setDurationFilter('all'); }}
              className="mt-4 px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredPackages.map((pkg, index) => (
              <div
                key={pkg._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 flex flex-col cursor-pointer transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 60}ms` }}
                onClick={() => setSelectedPackage(pkg)}
              >
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
                      <Clock size={12} />
                      {pkg.duration}
                    </span>
                  </div>
                  
                  {/* Wishlist button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(pkg._id); }}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm
                      ${wishlist.has(pkg._id) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:text-red-500 hover:bg-white'}`}
                  >
                    <Heart size={16} fill={wishlist.has(pkg._id) ? 'currentColor' : 'none'} />
                  </button>

                  {/* Bottom overlay info */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium">
                      <MapPin size={13} />
                      <span>{pkg.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1.5 group-hover:text-brand-primary transition-colors line-clamp-1">
                    {pkg.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                    {pkg.description}
                  </p>
                  
                  {/* Inclusions */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pkg.inclusions.slice(0, 4).map(inc => (
                      <span key={inc} className="bg-brand-light text-brand-primary text-[11px] font-semibold px-2.5 py-1 rounded-md">
                        {inc}
                      </span>
                    ))}
                    {pkg.inclusions.length > 4 && (
                      <span className="bg-gray-100 text-gray-500 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                        +{pkg.inclusions.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold block">Starting from</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-gray-900">₹{pkg.price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-gray-400 font-medium">/person</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedPackage(pkg); }}
                      className="bg-gradient-to-r from-brand-secondary to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-1.5 group/btn"
                    >
                      View Details
                      <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPackage(null)} />
          <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header Image */}
            <div className="relative h-64 md:h-80 overflow-hidden rounded-t-3xl">
              <img src={selectedPackage.image} alt={selectedPackage.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <button
                onClick={() => setSelectedPackage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-5 left-6 right-6">
                <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                  <MapPin size={15} />
                  <span>{selectedPackage.destination}</span>
                  <span className="mx-1">•</span>
                  <Clock size={15} />
                  <span>{selectedPackage.duration}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white">{selectedPackage.title}</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8">
              <p className="text-gray-600 leading-relaxed mb-6">{selectedPackage.description}</p>

              {/* Inclusions */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">What's Included</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPackage.inclusions.map(inc => (
                    <span key={inc} className="bg-green-50 text-green-700 border border-green-200 text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Check size={14} />
                      {inc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Itinerary */}
              {selectedPackage.itinerary && selectedPackage.itinerary.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Itinerary Highlights</h4>
                  <div className="space-y-3">
                    {selectedPackage.itinerary.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-12 h-12 bg-brand-primary/10 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-brand-primary uppercase">Day</span>
                          <span className="text-lg font-black text-brand-primary leading-none">{item.day}</span>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h5 className="font-bold text-gray-900">{item.title}</h5>
                          <p className="text-sm text-gray-500">{item.activities}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Book */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold block">Package Price</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-gray-900">₹{selectedPackage.price.toLocaleString('en-IN')}</span>
                    <span className="text-sm text-gray-400 font-medium">/person</span>
                  </div>
                  <span className="text-xs text-green-600 font-semibold">Inclusive of all taxes</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleWishlist(selectedPackage._id)}
                    className={`px-5 py-3 rounded-xl font-bold text-sm border-2 transition-all flex items-center gap-2
                      ${wishlist.has(selectedPackage._id)
                        ? 'border-red-500 text-red-500 bg-red-50'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    <Heart size={16} fill={wishlist.has(selectedPackage._id) ? 'currentColor' : 'none'} />
                    {wishlist.has(selectedPackage._id) ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setSelectedPackage(null); navigate(`/booking?type=packages&name=${encodeURIComponent(selectedPackage.title)}&source=${encodeURIComponent(selectedPackage.destination)}&destination=${encodeURIComponent(selectedPackage.destination)}&date=${new Date().toISOString().split('T')[0]}&price=${selectedPackage.price}&duration=${encodeURIComponent(selectedPackage.duration)}&image=${encodeURIComponent(selectedPackage.image || '')}`); }}
                    className="bg-gradient-to-r from-brand-secondary to-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Why Choose Us Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-3">Why Book With TravelSphere?</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">Every package is carefully crafted to give you the best experience at the best price.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '💰', title: 'Best Price Guarantee', desc: 'We ensure you get the lowest prices with no hidden charges.' },
              { icon: '🔒', title: 'Safe & Secure', desc: 'All payments and data are protected with enterprise-grade security.' },
              { icon: '📞', title: '24/7 Support', desc: 'Our travel experts are available round the clock to help you.' },
              { icon: '✨', title: 'Curated Experiences', desc: 'Handpicked stays, activities, and itineraries by travel experts.' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-brand-light/50 transition group">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
