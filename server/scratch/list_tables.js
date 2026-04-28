const { sequelize } = require('../config/db');

async function check() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.log('Tables in Database:');
    results.forEach(r => console.log(`- ${r.tablename}`));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

check();
