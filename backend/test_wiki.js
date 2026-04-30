const axios = require('axios');

async function getWikiImage(searchQuery) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=1`;
    const response = await axios.get(url);
    const pages = response.data.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const imageUrl = pages[pageId]?.original?.source;
      return imageUrl;
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
  return null;
}

getWikiImage('Taj Mahal Palace Hotel').then(console.log);
getWikiImage('Oberoi Hotel Mumbai').then(console.log);
getWikiImage('ITC Grand Chola Chennai').then(console.log);
