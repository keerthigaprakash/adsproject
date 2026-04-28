const User = require('../models/User');
const { sequelize } = require('../config/db');

async function check() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll();
    console.log(`Total Staff Users: ${users.length}`);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

check();
