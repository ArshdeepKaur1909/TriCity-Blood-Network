const mongoose = require('mongoose');

// What a "Receipt" of a Life-Saving Transaction Looks Like
const HistorySchema = new mongoose.Schema({
  auctionId: String,
  timestamp: { type: Date, default: Date.now },
  requester: {
    name: String,
    bloodType: String,
    units: Number
  },
  winner: {
    name: String,
    hfid: String,
    distance: Number
  },
  allBidders: [{
    name: String,
    distance: Number
  }],
  status: { type: String, default: 'COMPLETED' }
});

module.exports = mongoose.model('History', HistorySchema);