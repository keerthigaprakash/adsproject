const Ad = require('../models/Ad');
const { sequelize } = require('../config/db');

async function check() {
  try {
    await sequelize.authenticate();
    const ads = await Ad.findAll({ order: [['created_at', 'DESC']] });
    console.log(`Total Ads: ${ads.length}`);
    ads.forEach(ad => {
      console.log(`- ${ad.title} (ID: ${ad.id}) - Created At: ${ad.created_at}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

check();
