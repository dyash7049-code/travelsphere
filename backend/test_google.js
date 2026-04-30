const google = require('google-this');

async function testGoogleImages() {
  try {
    const images = await google.image('Hotel Snow View Manali exterior', { safe: false });
    console.log(images.slice(0, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testGoogleImages();
