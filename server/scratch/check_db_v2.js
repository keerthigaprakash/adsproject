const TheatreUser = require('../models/TheatreUser');
const { sequelize } = require('../config/db');

async function check() {
  try {
    await sequelize.authenticate();
    const users = await TheatreUser.findAll({ order: [['created_at', 'DESC']] });
    console.log(`Total Theatre Users: ${users.length}`);
    users.forEach(u => {
      console.log(`- ${u.username} (${u.email}) - Created At: ${u.created_at}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

check();
