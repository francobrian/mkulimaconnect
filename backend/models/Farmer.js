const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmName: {
    type: String,
    required: true
  },
  farmSize: {
    type: Number,
    required: true
  },
  farmType: {
    type: String,
    enum: ['organic', 'conventional', 'hydroponic', 'greenhouse'],
    required: true
  },
  crops: [{
    name: String,
    variety: String,
    plantingSeason: String,
    harvestTime: Number // days
  }],
  certifications: [String],
  description: String,
  rating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Farmer', farmerSchema);