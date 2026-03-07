const mongoose = require('mongoose');
const Organization = require('./models/Organization.js');
require('dotenv').config();

const seedData = [
  // --- CHANDIGARH ---
  {
    name: "GMCH-32 (Govt. Medical College)",
    hfid: "CH-3200-9988-1122",
    password: "123456",
    type: "Hospital",
    address: "Sector 32, Chandigarh",
    location: { lat: 30.704, lng: 76.776 },
    contact: "+91 172-2601023",
    isVerified: true,
    bloodStock: { 'A+': 28, 'O+': 42, 'B+': 19, 'AB+': 11, 'A-': 6, 'O-': 2, 'B-': 3, 'AB-': 1 }
  },
  {
    name: "PGIMER",
    hfid: "CH-1200-5544-3322",
    password: "123456",
    type: "Research Hospital",
    address: "Sector 12, Chandigarh",
    location: { lat: 30.767, lng: 76.779 },
    contact: "+91 172-2747585",
    isVerified: true,
    bloodStock: { 'A+': 50, 'O+': 80, 'B+': 40, 'AB+': 20, 'A-': 15, 'O-': 8, 'B-': 5, 'AB-': 4 }
  },
  {
    name: "Rotary Blood Bank Society",
    hfid: "CH-3700-1122-4455",
    password: "123456",
    type: "Blood Bank",
    address: "Sector 37, Chandigarh",
    location: { lat: 30.735, lng: 76.744 },
    contact: "+91 172-2696969",
    isVerified: true,
    bloodStock: { 'A+': 60, 'O+': 90, 'B+': 55, 'AB+': 25, 'A-': 12, 'O-': 15, 'B-': 8, 'AB-': 5 } // High stock supplier!
  },
  {
    name: "Lions Club Charity Blood Centre",
    hfid: "CH-1800-4455-6677",
    password: "123456",
    type: "Charity",
    address: "Sector 18, Chandigarh",
    location: { lat: 30.729, lng: 76.790 },
    contact: "+91 172-2771122",
    isVerified: true,
    bloodStock: { 'A+': 10, 'O+': 15, 'B+': 12, 'AB+': 4, 'A-': 1, 'O-': 2, 'B-': 0, 'AB-': 0 }
  },

  // --- MOHALI ---
  {
    name: "Fortis Hospital Mohali",
    hfid: "PB-0550-7766-9900",
    password: "123456",
    type: "Hospital",
    address: "Sector 62, Phase 8, Mohali",
    location: { lat: 30.690, lng: 76.733 },
    contact: "+91 172-4692222",
    isVerified: true,
    bloodStock: { 'A+': 15, 'O+': 25, 'B+': 10, 'AB+': 5, 'A-': 2, 'O-': 1, 'B-': 1, 'AB-': 0 } // Needs O-
  },
  {
    name: "Max Super Speciality Hospital",
    hfid: "PB-0600-3344-5566",
    password: "123456",
    type: "Hospital",
    address: "Phase 6, Mohali",
    location: { lat: 30.732, lng: 76.711 },
    contact: "+91 172-5212000",
    isVerified: true,
    bloodStock: { 'A+': 22, 'O+': 35, 'B+': 18, 'AB+': 8, 'A-': 4, 'O-': 3, 'B-': 2, 'AB-': 1 }
  },
  {
    name: "Sri Guru Harkrishan Sahib (Sohana Hospital)",
    hfid: "PB-7700-1122-3344",
    password: "123456",
    type: "Hospital",
    address: "Sector 77, Mohali",
    location: { lat: 30.685, lng: 76.715 },
    contact: "+91 172-2295000",
    isVerified: true,
    bloodStock: { 'A+': 40, 'O+': 55, 'B+': 30, 'AB+': 15, 'A-': 8, 'O-': 6, 'B-': 4, 'AB-': 2 }
  },

  // --- PANCHKULA ---
  {
    name: "Civil Hospital Panchkula",
    hfid: "HR-0600-8899-0011",
    password: "123456",
    type: "Hospital",
    address: "Sector 6, Panchkula",
    location: { lat: 30.702, lng: 76.853 },
    contact: "+91 172-2564035",
    isVerified: true,
    bloodStock: { 'A+': 8, 'O+': 12, 'B+': 5, 'AB+': 3, 'A-': 0, 'O-': 1, 'B-': 0, 'AB-': 0 } // Critical shortage!
  },
  {
    name: "Alchemist Hospital",
    hfid: "HR-2100-5566-7788",
    password: "123456",
    type: "Hospital",
    address: "Sector 21, Panchkula",
    location: { lat: 30.678, lng: 76.852 },
    contact: "+91 172-4500000",
    isVerified: true,
    bloodStock: { 'A+': 35, 'O+': 45, 'B+': 20, 'AB+': 10, 'A-': 5, 'O-': 4, 'B-': 3, 'AB-': 1 }
  },
  {
    name: "Command Hospital (Western Command)",
    hfid: "HR-0000-1111-2222",
    password: "123456",
    type: "Hospital",
    address: "Chandimandir Cantonment, Panchkula",
    location: { lat: 30.725, lng: 76.883 },
    contact: "+91 172-2589255",
    isVerified: true,
    bloodStock: { 'A+': 70, 'O+': 100, 'B+': 60, 'AB+': 30, 'A-': 20, 'O-': 25, 'B-': 15, 'AB-': 10 } // Massive backup reserve
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to Database");

    await Organization.deleteMany();
    console.log("🧹 Cleared old organization data");

    const insertedData = await Organization.insertMany(seedData);
    console.log(`🚀 Successfully seeded ${insertedData.length} Tri-City facilities!`);
    
    // Print the ID for GMCH-32 so we can use it in the frontend immediately
    const gmch = insertedData.find(org => org.name.includes("GMCH"));
    console.log(`\n🔑 COPY THIS ID FOR YOUR FRONTEND DEMO (GMCH-32): ${gmch._id}\n`);

    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();