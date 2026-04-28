const TheatreRequest = require('../models/TheatreRequest');
const { sequelize } = require('../config/db');

async function check() {
  try {
    await sequelize.authenticate();
    const requests = await TheatreRequest.findAll();
    console.log(`Total Theatre Requests: ${requests.length}`);
    requests.forEach(r => {
      console.log(`- Request ID: ${r.id}, Ad: ${r.ad_title}, Screens: ${r.selected_screens}/${r.total_screens}, Status: ${r.status}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

check();
