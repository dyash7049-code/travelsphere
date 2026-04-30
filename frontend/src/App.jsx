import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Packages from './pages/Packages';
import MyTrips from './pages/MyTrips';
import Planner from './pages/Planner';
import AboutUs from './pages/AboutUs';
import ContactSupport from './pages/ContactSupport';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <div className="font-sans text-gray-900 bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search/:type" element={<SearchResults />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactSupport />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
