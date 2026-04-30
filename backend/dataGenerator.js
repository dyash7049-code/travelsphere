const fs = require('fs');
const path = require('path');

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
  "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi",
  "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur",
  "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Chandigarh", "Guwahati", "Solapur", "Hubli-Dharwad",
  "Tiruchirappalli", "Bareilly", "Moradabad", "Mysore", "Tiruppur", "Gurgaon", "Aligarh", "Jalandhar", "Bhubaneswar", "Salem",
  "Mira-Bhayandar", "Warangal", "Thiruvananthapuram", "Guntur", "Bhiwandi", "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida",
  "Jamshedpur", "Bhilai", "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol",
  "Rourkela", "Nanded", "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi",
  "Ulhasnagar", "Jammu", "Sangli-Miraj & Kupwad", "Mangalore", "Erode", "Belgaum", "Kurnool", "Ambattur", "Rajahmundry",
  "Tirunelveli", "Malegaon", "Gaya", "Udaipur", "Kakinada", "Davanagere", "Kozhikode", "Maheshtala", "Rajpur Sonarpur", "Bokaro",
  "South Dumdum", "Bellary", "Patiala", "Gopalpur", "Agartala", "Bhagalpur", "Muzaffarnagar", "Bhatpara", "Panihati", "Latur",
  "Dhule", "Rohtak", "Korba", "Bhilwara", "Brahmapur", "Muzaffarpur", "Ahmednagar", "Mathura", "Kollam", "Avadi",
  "Rajahmundry", "Bilaspur", "Shahjahanpur", "Thrissur", "Alwar", "Kharagpur", "Nizamabad", "Aizawl", "Ozhukarai", "Dewas"
];

// Generate Airports
const airports = [
  { city: "Delhi", detail: "Indira Gandhi International Airport (DEL)" },
  { city: "Mumbai", detail: "Chhatrapati Shivaji Maharaj Int. Airport (BOM)" },
  { city: "Bangalore", detail: "Kempegowda International Airport (BLR)" },
  { city: "Chennai", detail: "Chennai International Airport (MAA)" },
  { city: "Kolkata", detail: "Netaji Subhash Chandra Bose Int. Airport (CCU)" },
  { city: "Hyderabad", detail: "Rajiv Gandhi International Airport (HYD)" },
  { city: "Ahmedabad", detail: "Sardar Vallabhbhai Patel Int. Airport (AMD)" },
  { city: "Pune", detail: "Pune Airport (PNQ)" },
  { city: "Goa", detail: "Dabolim Airport (GOI)" },
  { city: "Goa", detail: "Manohar International Airport (GOX)" }
];

// Procedurally add more airports
CITIES.slice(10).forEach(city => {
  airports.push({
    city: city,
    detail: `${city} Airport (${city.substring(0,3).toUpperCase()})`
  });
});

// Generate Railway Stations
const stations = [
  { city: "New Delhi", detail: "New Delhi Railway Station (NDLS)" },
  { city: "Mumbai", detail: "Chhatrapati Shivaji Maharaj Terminus (CSMT)" },
  { city: "Howrah", detail: "Howrah Junction (HWH)" },
  { city: "Chennai", detail: "Chennai Central (MAS)" },
  { city: "Bangalore", detail: "Krantivira Sangolli Rayanna (SBC)" }
];

CITIES.forEach(city => {
  stations.push({ city: city, detail: `${city} Junction (${city.substring(0,3).toUpperCase()})` });
  stations.push({ city: city, detail: `${city} Central (${city.substring(0,2).toUpperCase()}C)` });
  stations.push({ city: city, detail: `${city} Cantt (${city.substring(0,2).toUpperCase()}CANTT)` });
});

// Generate Bus Stands
const buses = [
  { city: "Delhi", detail: "Kashmiri Gate ISBT" },
  { city: "Delhi", detail: "Anand Vihar ISBT" },
  { city: "Mumbai", detail: "Borivali National Park Bus Stand" },
  { city: "Bangalore", detail: "Majestic Bus Stand" }
];

CITIES.forEach(city => {
  buses.push({ city: city, detail: `${city} Main Bus Stand` });
  buses.push({ city: city, detail: `${city} ISBT` });
  buses.push({ city: city, detail: `${city} Private Bus Terminal` });
});

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

fs.writeFileSync(path.join(dataDir, 'airports.json'), JSON.stringify(airports, null, 2));
fs.writeFileSync(path.join(dataDir, 'stations.json'), JSON.stringify(stations, null, 2));
fs.writeFileSync(path.join(dataDir, 'buses.json'), JSON.stringify(buses, null, 2));

console.log(`Generated ${airports.length} airports, ${stations.length} stations, and ${buses.length} bus stands.`);
