const fs = require('fs');
const https = require('https');
const path = require('path');

const urls = [
  "https://upload.wikimedia.org/wikipedia/commons/0/09/Mumbai_Aug_2018_43_%2843978131522%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/1/1a/ITC_Grand_Chola_Chennai_Front_View.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/7/7b/The_Leela_Palace_Bangalore.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/7/7d/Umaid_Bhawan_Palace_-_Jodhpur%2C_India.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/a/aa/Radisson_Blu_Hotel_New_Delhi_Dwarka.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/b/b5/JW_Marriott_Pune.jpg"
];

const destFolder = path.join(__dirname, '../frontend/public');

urls.forEach((url, index) => {
  const destPath = path.join(destFolder, `real_hotel_${index + 1}.jpg`);
  
  const options = {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  };

  https.get(url, options, (response) => {
    if (response.statusCode === 200) {
      const file = fs.createWriteStream(destPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded real_hotel_${index + 1}.jpg`);
      });
    } else {
      console.log(`Failed to download ${url} - Status: ${response.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${url}:`, err.message);
  });
});
