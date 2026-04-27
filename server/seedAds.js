const { sequelize } = require('./config/db');
const Ad = require('./models/Ad');
const User = require('./models/User');

const seedAds = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');

    const admin = await User.findOne({ where: { role: 'Super Admin' } });
    if (!admin) {
      console.log('No Admin user found. Please create one first.');
      process.exit();
    }

    const ads = [
      {
        title: 'Premium Luxury Watch',
        description: 'Exquisite timepieces for the modern professional.',
        price: 1200,
        gst: 18,
        commission: 15,
        status: 'active',
        ad_type: 'video',
        budget: 5000,
        video_url: 'https://vjs.zencdn.net/v/oceans.mp4',
        creator_id: admin.id
      },
      {
        title: 'AdPermit Platform Tour',
        description: 'Experience the next generation of ad management.',
        price: 500,
        gst: 18,
        commission: 10,
        status: 'active',
        ad_type: 'video',
        budget: 10000,
        video_url: 'https://vjs.zencdn.net/v/oceans.mp4',
        creator_id: admin.id
      },
      {
        title: 'Summer Fashion Sale',
        description: 'Get up to 50% off on all summer essentials.',
        price: 800,
        gst: 12,
        commission: 10,
        status: 'active',
        ad_type: 'video',
        budget: 3000,
        video_url: 'https://vjs.zencdn.net/v/oceans.mp4',
        creator_id: admin.id
      },
      {
        title: 'Tech Gadgets 2024',
        description: 'Latest innovations in the world of technology.',
        price: 2500,
        gst: 18,
        commission: 20,
        status: 'active',
        ad_type: 'video',
        budget: 15000,
        video_url: 'https://vjs.zencdn.net/v/oceans.mp4',
        creator_id: admin.id
      },
      {
        title: 'Luxury Car Rental',
        description: 'Drive your dream car with our premium rental service.',
        price: 5000,
        gst: 28,
        commission: 15,
        status: 'active',
        ad_type: 'video',
        budget: 20000,
        video_url: 'https://vjs.zencdn.net/v/oceans.mp4',
        creator_id: admin.id
      },
      {
        title: 'Healthy Meal Plans',
        description: 'Customized nutrition for your fitness goals.',
        price: 300,
        gst: 5,
        commission: 8,
        status: 'pending',
        ad_type: 'video',
        budget: 2500,
        video_url: 'https://vjs.zencdn.net/v/oceans.mp4',
        creator_id: admin.id
      },
      {
        title: 'Digital Marketing Course',
        description: 'Master the art of online advertising.',
        price: 499,
        gst: 18,
        commission: 12,
        status: 'active',
        ad_type: 'video',
        budget: 4000,
        video_url: 'https://vjs.zencdn.net/v/oceans.mp4',
        creator_id: admin.id
      }
    ];

    // Clear existing ads to avoid duplicates with different types
    await Ad.destroy({ where: {} });
    const adsWithBudget = ads.map(ad => ({
      ...ad,
      remaining_budget: ad.budget
    }));
    await Ad.bulkCreate(adsWithBudget);
    console.log('Ads seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding ads:', error);
    process.exit(1);
  }
};

seedAds();
