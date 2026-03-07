const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hfid: { type: String, required: true, unique: true }, // Healthcare ID (Used for Login)
  password: { type: String, required: true },          // Added for Login
  type: { type: String, default: 'Hospital' },
  address: String,
  contact: String,
  location: {
    lat: { type: Number, default: 30.7333 }, // Default Chandigarh Lat
    lng: { type: Number, default: 76.7794 }  // Default Chandigarh Lng
  },
  isVerified: { type: Boolean, default: false },
  
  // Inventory starts at 0 for new emergency registrations
  bloodStock: {
    'A+': { type: Number, default: 0 },
    'O+': { type: Number, default: 0 },
    'B+': { type: Number, default: 0 },
    'AB+': { type: Number, default: 0 },
    'A-': { type: Number, default: 0 },
    'O-': { type: Number, default: 0 },
    'B-': { type: Number, default: 0 },
    'AB-': { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Organization', organizationSchema, 'Organizations');