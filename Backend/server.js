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
  socket.on('send_emergency', (alertPayload) => {
    const auctionId = alertPayload.id; 
    
    // Open the auction
    activeAuctions[auctionId] = {
      requester: alertPayload,
      bidders: [], // Hospitals that click "Accept"
      status: 'OPEN'
    };

    console.log(`🚨 CODE RED INITIATED by ${alertPayload.hospital} (ID: ${auctionId})`);
    
    // Broadcast alert to all OTHER hospitals
    socket.broadcast.emit('receive_emergency', alertPayload);

    // B. THE TIMER: Wait 15 seconds, then pick the closest hospital
    setTimeout(() => {
      const auction = activeAuctions[auctionId];
      if (!auction || auction.status !== 'OPEN') return; // Might have been aborted

      auction.status = 'CLOSED';
      console.log(`⏱️ Auction ${auctionId} closed. Bids: ${auction.bidders.length}`);

      if (auction.bidders.length === 0) {
        // No one answered in time
        console.log(`❌ No bids for ${auctionId}`);
        io.emit('auction_failed', { auctionId });
      } else {
        // Find the closest hospital
        let winner = auction.bidders[0];
        for (let i = 1; i < auction.bidders.length; i++) {
          if (auction.bidders[i].distance < winner.distance) {
            winner = auction.bidders[i];
          }
        }

        console.log(`🏆 WINNER: ${winner.hospitalInfo.name} (${winner.distance.toFixed(2)} km)`);

        // Tell everyone who won!
        io.emit('auction_resolved', {
          auctionId: auctionId,
          winnerInfo: winner.hospitalInfo,
          requesterInfo: auction.requester
        });
      }

      delete activeAuctions[auctionId]; // Clean up
    }, 15000); // 15 seconds for the demo
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
http.listen(PORT, '0.0.0.0', () => { // '0.0.0.0' allows cross-laptop access
  console.log(`🚀 HemoGlobe Live Network on port ${PORT}`);
});