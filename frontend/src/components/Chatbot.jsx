import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Plane, Hotel, MapPin, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  
  // State Machine Variables
  const [botState, setBotState] = useState('IDLE'); // IDLE, AWAITING_HOTEL_DEST, AWAITING_FLIGHT_SRC, AWAITING_FLIGHT_DEST, FETCHING
  const [bookingContext, setBookingContext] = useState({ intent: null, source: null, destination: null });
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([
    { text: "Hi there! I'm your TravelSphere AI Assistant. Are you looking to book a Flight, Hotel, Bus, Train, or a Holiday Package today?", isBot: true, type: 'text' }
  ]);
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const addBotMessage = (text, type = 'text', data = null) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { text, isBot: true, type, data }]);
      setIsTyping(false);
    }, 800);
  };

  const handleSearch = async (intent, context) => {
    setBotState('FETCHING');
    setIsTyping(true);

    try {
      let endpoint = '';
      let params = {};
      
      if (intent === 'hotel') {
        endpoint = `${API_BASE}/api/search/hotels`;
        params = { source: context.destination };
      } else if (intent === 'flight') {
        endpoint = `${API_BASE}/api/search/flights`;
        params = { source: context.source, destination: context.destination };
      } else if (intent === 'bus') {
        endpoint = `${API_BASE}/api/search/buses`;
        params = { source: context.source, destination: context.destination };
      } else if (intent === 'package') {
        endpoint = `${API_BASE}/api/packages`;
        // Packages API returns all by default
      }

      const response = await axios.get(endpoint, { params });
      setIsTyping(false);

      if (response.data && response.data.length > 0) {
        setMessages(prev => [...prev, { 
          text: `Here are the top options I found for you:`, 
          isBot: true, 
          type: 'results', 
          data: { intent, results: response.data.slice(0, 3) } // Show top 3
        }]);
      } else {
        setMessages(prev => [...prev, { text: "I couldn't find any live options for that route right now. Try another destination?", isBot: true, type: 'text' }]);
      }
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages(prev => [...prev, { text: "Sorry, I had trouble connecting to our live servers. Please try again later.", isBot: true, type: 'text' }]);
    }

    // Reset state for new queries
    setBotState('IDLE');
    setBookingContext({ intent: null, source: null, destination: null });
  };

// Helper for Levenshtein Distance to handle typos
const getEditDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1,
        matrix[i - 1][j] + 1,
        matrix[i - 1][j - 1] + indicator
      );
    }
  }
  return matrix[a.length][b.length];
};

const hasFuzzyMatch = (text, targetWord, maxDistance = 2) => {
  // If exact match exists, return true immediately
  if (text.toLowerCase().includes(targetWord)) return true;
  
  const words = text.toLowerCase().split(/[\s,.-]+/);
  for (let w of words) {
    // Only apply fuzzy match on words of reasonable length
    if (w.length > 3 && getEditDistance(w, targetWord) <= maxDistance) {
      return true;
    }
  }
  return false;
};

  const processInput = (text) => {
    const lowerInput = text.toLowerCase();

    // Allow user to cancel or restart anytime
    if (hasFuzzyMatch(lowerInput, 'cancel') || hasFuzzyMatch(lowerInput, 'reset') || hasFuzzyMatch(lowerInput, 'stop')) {
      setBotState('IDLE');
      setBookingContext({ intent: null, source: null, destination: null });
      addBotMessage("Okay, I've cancelled that. What would you like to do instead?");
      return;
    }

    // Helper for location validation — strict check
    const isValidLocation = (loc) => {
      const trimmed = loc.trim();
      // Must be 2-30 chars, only letters, spaces, hyphens, periods
      if (trimmed.length < 2 || trimmed.length > 30) return false;
      if (!/^[a-zA-Z\s\-\.]+$/.test(trimmed)) return false;
      
      // Block common non-location words, abusive language, and filler
      const blocklist = [
        'same', 'here', 'there', 'yes', 'no', 'ok', 'okay', 'please', 'now',
        'all', 'me', 'give', 'get', 'show', 'find', 'help', 'what', 'why',
        'how', 'when', 'where', 'who', 'the', 'and', 'but', 'for', 'not',
        'you', 'your', 'its', 'this', 'that', 'can', 'will', 'just',
        'idiot', 'stupid', 'dumb', 'fool', 'shut', 'hate', 'ugly', 'bad',
        'hell', 'damn', 'crap', 'suck', 'lame', 'loser', 'trash', 'waste',
        'hi', 'hello', 'hey', 'bye', 'thanks', 'thank', 'sorry', 'wow',
        'nothing', 'something', 'anything', 'everything', 'nobody', 'somebody',
        'stop', 'cancel', 'reset', 'back', 'exit', 'quit', 'close',
        'search', 'book', 'want', 'need', 'like', 'love', 'good', 'nice'
      ];
      
      const words = trimmed.toLowerCase().split(/\s+/);
      // If ALL words are in blocklist, it's not a location
      if (words.every(w => blocklist.includes(w))) return false;
      // If any word is abusive, reject it
      const abuseWords = ['idiot', 'stupid', 'dumb', 'fool', 'shut', 'hate', 'ugly', 'hell', 'damn', 'crap', 'suck', 'loser', 'trash'];
      if (words.some(w => abuseWords.includes(w))) return false;
      
      return true;
    };

    // Smart parser: extract "from X to Y" from a full sentence
    const extractRoute = (input) => {
      const routeMatch = input.match(/from\s+([a-zA-Z\s]+?)(?:\s+to\s+)([a-zA-Z\s]+?)(?:\s+on|\s+for|\s+date|\s*$)/i);
      if (routeMatch) {
        return { source: routeMatch[1].trim(), destination: routeMatch[2].trim() };
      }
      // Try "X to Y" pattern
      const simpleMatch = input.match(/([a-zA-Z]+)\s+to\s+([a-zA-Z]+)/i);
      if (simpleMatch) {
        return { source: simpleMatch[1].trim(), destination: simpleMatch[2].trim() };
      }
      return null;
    };

    // Detect intent using exact substring first (more reliable than fuzzy)
    const detectIntent = (input) => {
      const lower = input.toLowerCase();
      if (lower.includes('flight') || lower.includes('fly') || lower.includes('plane') || lower.includes('airport')) return 'flight';
      if (lower.includes('train') || lower.includes('railway') || lower.includes('rail')) return 'train';
      if (lower.includes('bus') || lower.includes('coach')) return 'bus';
      if (lower.includes('hotel') || lower.includes('stay') || lower.includes('room') || lower.includes('accommodation')) return 'hotel';
      if (lower.includes('package') || lower.includes('holiday') || lower.includes('vacation') || lower.includes('tour')) return 'package';
      return null;
    };

    if (botState === 'IDLE') {
      if (lowerInput.match(/\b(hi+|hello+|hey+|greetings)\b/) && lowerInput.length < 20) {
        addBotMessage("Hello! How can I assist you today? You can ask me to search for Flights, Hotels, Buses, Trains, or Holiday Packages.");
        return;
      }

      const intent = detectIntent(lowerInput);
      const route = extractRoute(lowerInput);

      // If we have intent + full route, search immediately (one-shot)
      if (intent && route && isValidLocation(route.source) && isValidLocation(route.destination)) {
        if (intent === 'hotel') {
          // Hotels only need destination
          const ctx = { intent: 'hotel', destination: route.destination };
          setBookingContext(ctx);
          addBotMessage(`Searching hotels in ${route.destination}...`);
          handleSearch('hotel', ctx);
        } else if (intent === 'package') {
          addBotMessage("Great choice! Fetching our best holiday packages for you...");
          handleSearch('package', { intent: 'package' });
        } else {
          const ctx = { intent, source: route.source, destination: route.destination };
          setBookingContext(ctx);
          addBotMessage(`Searching ${intent} options from ${route.source} to ${route.destination}...`);
          handleSearch(intent, ctx);
        }
        return;
      }

      // If we have intent but no route, start step-by-step
      if (intent) {
        if (intent === 'hotel') {
          setBookingContext({ intent: 'hotel', source: null, destination: null });
          setBotState('AWAITING_HOTEL_DEST');
          addBotMessage("Great! Which city are you looking to stay in?");
        } else if (intent === 'package') {
          addBotMessage("Great choice! Fetching our best holiday packages for you...");
          handleSearch('package', { intent: 'package' });
        } else if (intent === 'train') {
          setBookingContext({ intent: 'train', source: null, destination: null });
          setBotState('AWAITING_FLIGHT_SRC');
          addBotMessage("Sure! Where are you travelling from?");
        } else if (intent === 'bus') {
          setBookingContext({ intent: 'bus', source: null, destination: null });
          setBotState('AWAITING_FLIGHT_SRC');
          addBotMessage("Sure, where are you travelling from?");
        } else {
          setBookingContext({ intent: 'flight', source: null, destination: null });
          setBotState('AWAITING_FLIGHT_SRC');
          addBotMessage("Awesome! Where are you flying from?");
        }
        return;
      }

      // No intent detected
      addBotMessage("I can help you book Flights, Hotels, Buses, Trains, or Holiday Packages. Just tell me what you're looking for! For example: \"flights from Delhi to Mumbai\"");
    } 
    else if (botState === 'AWAITING_HOTEL_DEST') {
      const destination = text.trim();
      if (!isValidLocation(destination)) {
        addBotMessage("That doesn't look like a valid city. Please enter a proper location name.");
        return;
      }
      const newContext = { ...bookingContext, destination };
      setBookingContext(newContext);
      addBotMessage(`Searching our live inventory for hotels in ${destination}...`);
      handleSearch('hotel', newContext);
    }
    else if (botState === 'AWAITING_FLIGHT_SRC') {
      const source = text.trim();
      if (!isValidLocation(source)) {
        addBotMessage("That doesn't look like a valid city. Please enter a proper origin city.");
        return;
      }
      setBookingContext({ ...bookingContext, source });
      setBotState('AWAITING_FLIGHT_DEST');
      addBotMessage(`Got it, leaving from ${source}. Where are you going to?`);
    }
    else if (botState === 'AWAITING_FLIGHT_DEST') {
      const destination = text.trim();
      if (!isValidLocation(destination)) {
        addBotMessage("That doesn't look like a valid city. Please enter a proper destination city.");
        return;
      }
      const newContext = { ...bookingContext, destination };
      setBookingContext(newContext);
      addBotMessage(`Checking live ${newContext.intent} options from ${newContext.source} to ${destination}...`);
      handleSearch(newContext.intent, newContext);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || botState === 'FETCHING') return;

    const userMessage = { text: input, isBot: false, type: 'text' };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');
    
    processInput(currentInput);
  };

  // UI Components for rich results
  const renderResults = (data) => {
    if (!data || !data.results) return null;

    if (data.intent === 'hotel') {
      return (
        <div className="flex flex-col space-y-2 mt-2 w-full">
          {data.results.map((hotel, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
              <img src={hotel.image} alt={hotel.name} className="h-24 w-full object-cover" />
              <div className="p-2">
                <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{hotel.name}</h4>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <MapPin size={10} className="mr-1" /> {hotel.city}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold text-brand-primary text-sm">₹{hotel.price}</span>
                  <button className="bg-brand-primary text-white text-xs px-3 py-1 rounded-full hover:bg-blue-600 transition">Book</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (data.intent === 'flight' || data.intent === 'bus') {
      return (
        <div className="flex flex-col space-y-2 mt-2 w-full">
          {data.results.map((item, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-xs text-gray-800">{item.airline || item.operator}</span>
                <span className="font-bold text-brand-primary text-sm">₹{item.price}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600">
                <div className="text-center">
                  <div className="font-bold text-gray-800">{new Date(item.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  <div>{item.source}</div>
                </div>
                <div className="flex-1 px-2 flex flex-col items-center">
                  <span className="text-[10px] text-gray-400">{item.duration}</span>
                  <div className="w-full h-px bg-gray-300 relative my-1">
                    <Plane size={10} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-brand-primary" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-800">{new Date(item.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  <div>{item.destination}</div>
                </div>
              </div>
              <button className="w-full mt-3 bg-brand-primary text-white text-xs py-1.5 rounded hover:bg-blue-600 transition">Select</button>
            </div>
          ))}
        </div>
      );
    }

    if (data.intent === 'package') {
      return (
        <div className="flex flex-col space-y-2 mt-2 w-full">
          {data.results.map((pkg, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
              <img src={pkg.image} alt={pkg.title} className="h-24 w-full object-cover" />
              <div className="p-2">
                <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{pkg.title}</h4>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                  <span>{pkg.duration}</span>
                  <span className="font-bold text-brand-primary text-sm">₹{pkg.price}</span>
                </div>
                <button className="w-full mt-2 bg-brand-primary text-white text-xs py-1.5 rounded hover:bg-blue-600 transition">View Details</button>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      {/* Floating Button with Rotating Text */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {/* Rotating Text Bubble */}
          <div className="chatbot-text-bubble bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 text-sm font-semibold text-gray-700 whitespace-nowrap animate-float-text">
            <span className="chatbot-rotating-text"></span>
          </div>
          {/* Modern Icon Button */}
          <button 
            onClick={() => setIsOpen(true)}
            className="relative bg-gradient-to-br from-brand-primary to-blue-600 text-white w-14 h-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-brand-primary/30 animate-ping"></span>
            {/* Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 z-50 animate-in slide-in-from-bottom-8" style={{ height: '500px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-primary to-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <MessageSquare size={20} />
              <h3 className="font-bold">AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition" title="Close Chat">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.isBot ? 'items-start' : 'items-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.isBot ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-none' : 'bg-brand-primary text-white rounded-tr-none'}`}>
                  {msg.text}
                </div>
                {msg.type === 'results' && renderResults(msg.data)}
              </div>
            ))}
            
            {isTyping && (
              <div className="bg-white text-gray-500 border border-gray-100 p-3 rounded-2xl rounded-tl-none self-start max-w-[80%] shadow-sm flex items-center space-x-2">
                <Loader2 size={14} className="animate-spin text-brand-primary" />
                <span className="text-xs">Agent is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..." 
              disabled={botState === 'FETCHING'}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
            />
            <button type="submit" disabled={!input.trim() || botState === 'FETCHING'} className="bg-brand-primary text-white p-2 rounded-full hover:bg-blue-600 transition disabled:opacity-50 disabled:hover:bg-brand-primary">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
