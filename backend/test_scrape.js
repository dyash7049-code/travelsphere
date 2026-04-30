const axios = require('axios');
const cheerio = require('cheerio');

async function getHotelImage(hotelName) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(hotelName + " hotel exterior")}&tbm=isch`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    const images = $('img');
    for (let i = 0; i < images.length; i++) {
      const src = $(images[i]).attr('src');
      if (src && src.startsWith('https://encrypted-tbn0.gstatic.com')) {
        return src;
      }
    }
  } catch (error) {
    console.error(error);
  }
  return null;
}

getHotelImage('Taj Mahal Palace Mumbai').then(console.log);
