const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // This looks for the MONGO_URI you just saved in .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ TriCity Blood DB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // Stop the server if the connection fails
  }
};

module.exports = connectDB;