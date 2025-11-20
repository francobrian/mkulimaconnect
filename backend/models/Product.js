const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'dairy', 'poultry', 'herbs'],
    required: true
  },
  variety: String,
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  description: String,
  images: [String],
  isOrganic: {
    type: Boolean,
    default: false
  },
  harvestDate: {
    type: Date,
    required: true
  },
  expiryDate: Date,
  isAvailable: {
    type: Boolean,
    default: true
  },
  climateScore: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

productSchema.index({ farmer: 1, createdAt: -1 });
productSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model('Product', productSchema);