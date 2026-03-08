const express = require('express');
const cors = require('cors');
const connectDB = require('./db.js');
const Organization = require('./models/Organization.js');
require('dotenv').config();

const app = express();

// ─── 1. SOCKET.IO SETUP (MUST BE TOP LEVEL) ──────────────────────
const http = require('http').createServer(app); // Wrap Express in HTTP
const io = require('socket.io')(http, {
  cors: { origin: "*" } // Allows collaborator's laptop to connect
});

// ─── NEW: HAVERSINE DISTANCE FORMULA ─────────────────────────────
// Calculates straight-line distance between two coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

// ─── 2. MIDDLEWARE ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
  next();
});
connectDB();

// ─── 3. REST API ROUTES ──────────────────────────────────────────

// Fetch all hospitals
app.get('/api/organizations', async (req, res) => {
  try {
    const orgs = await Organization.find();
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Register Facility
app.post('/api/register', async (req, res) => {
  try {
    const { name, hfid, password, address, contact } = req.body;
    const existingOrg = await Organization.findOne({ hfid });
    if (existingOrg) return res.status(400).json({ message: "HFID already registered." });

    const newHospital = new Organization({
      name, hfid, password, address, contact,
      isVerified: false,
      bloodStock: { 'A+':0,'O+':0,'B+':0,'AB+':0,'A-':0,'O-':0,'B-':0,'AB-':0 }
    });
    await newHospital.save();
    res.status(201).json({ hospitalId: newHospital._id });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// Login Facility
app.post('/api/login', async (req, res) => {
  try {
    const { hfid, password } = req.body;
    const hospital = await Organization.findOne({ hfid, password });
    if (hospital) {
      res.json({ hospitalId: hospital._id, name: hospital.name });
    } else {
      res.status(401).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// ─── 4. REAL-TIME BROADCAST ENGINE (SMART AUCTION) ───────────────

// In-Memory State to track active emergencies and their bidders
const activeAuctions = {}; 

io.on('connection', (socket) => {
  console.log('📡 Hospital Node Linked:', socket.id);

  // A. HOSPITAL BROADCASTS CODE RED
  // ADD THIS: Maps the socket to a specific Hospital ID
  socket.on('join_network', (hfid) => {
    socket.hfid = hfid; 
    console.log(`🔗 Hospital ${hfid} is now online and mapped.`);
  });

  socket.on('send_emergency', async (alertPayload) => {
  const { id: auctionId, bloodGroup, unitsRequired } = alertPayload; 
  
  activeAuctions[auctionId] = {
    requester: alertPayload,
    bidders: [],
    status: 'OPEN'
  };

  console.log(`🚨 CODE RED: ${alertPayload.hospital} needs ${unitsRequired} units of ${bloodGroup}`);

  try {
    // 1. Find hospitals that have enough stock (Dynamic Query)
    const stockKey = `bloodStock.${bloodGroup}`;
    const capableHospitals = await Organization.find({
      [stockKey]: { $gte: unitsRequired }
    });

    // 2. Get all currently connected sockets
    const allSockets = await io.fetchSockets();

    // 3. Targeted Alerting
    capableHospitals.forEach(hospital => {
      const target = allSockets.find(s => s.hfid === hospital.hfid);
      if (target && target.id !== socket.id) { // Don't alert the sender
        target.emit('receive_emergency', alertPayload);
      }
    });

    // Optional Fallback: If no one has enough, alert everyone for partial help
    if (capableHospitals.length === 0) {
      socket.broadcast.emit('receive_emergency', alertPayload);
    }

  } catch (error) {
    console.error("Filtering Error:", error);
  }

  // ... Keep your 15-second setTimeout winner logic here
});

  // C. A HOSPITAL CLICKS "ACCEPT"
  socket.on('accept_emergency', async (bidData) => {
    const auction = activeAuctions[bidData.auctionId];
    
    if (auction && auction.status === 'OPEN') {
      try {
        // Find requester by name, and responder by the HFID we stored in the frontend
        const requesterDoc = await Organization.findOne({ name: auction.requester.hospital });
        const responderDoc = await Organization.findOne({ hfid: bidData.hospitalInfo.id });

        if (requesterDoc && responderDoc) {
          const distance = calculateDistance(
            requesterDoc.location.lat, requesterDoc.location.lng,
            responderDoc.location.lat, responderDoc.location.lng
          );

          console.log(`✋ BID RECEIVED: ${responderDoc.name} is ${distance.toFixed(2)} km away.`);
          
          auction.bidders.push({
            hospitalInfo: bidData.hospitalInfo,
            distance: distance
          });
        } else {
          console.log(`⚠️ Database lookup failed. Requester: ${!!requesterDoc}, Responder: ${!!responderDoc}`);
        }
      } catch (err) {
        console.error("Error calculating distance:", err);
      }
    }
  });

  // D. THE REQUESTER CLICKS "ABORT"
  socket.on('abort_emergency', (data) => {
     if(activeAuctions[data.auctionId]) {
         activeAuctions[data.auctionId].status = 'ABORTED';
         console.log(`🛑 AUCTION ABORTED by ${data.hospitalName}`);
         
         // Tell other hospitals to remove the red alert from their screen
         socket.broadcast.emit('auction_aborted', { auctionId: data.auctionId });
         delete activeAuctions[data.auctionId];
     }
  });

  socket.on('disconnect', () => console.log('🔌 Node Offline'));
});

// ─── 5. START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`🚀 TriCity Blood Network active on port ${PORT}`);
});