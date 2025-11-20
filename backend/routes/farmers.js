const express = require('express');
const auth = require('../middleware/auth');
const Farmer = require('../models/Farmer');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const router = express.Router();

// Get all farmers with filters
router.get('/', async (req, res) => {
  try {
    const { category, location, rating, search } = req.query;
    let filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { farmName: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      filter.farmType = category;
    }

    // Rating filter
    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    const farmers = await Farmer.find(filter)
      .populate('user', 'name email phone location avatar')
      .populate('crops')
      .sort({ rating: -1, createdAt: -1 });

    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get farmer by ID
router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id)
      .populate('user', 'name email phone location avatar')
      .populate({
        path: 'products',
        match: { isAvailable: true },
        options: { sort: { createdAt: -1 } }
      });

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    // Get farmer stats
    const stats = await getFarmerStats(req.params.id);

    res.json({ farmer, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update farmer profile
router.put('/:id', auth, async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);
    
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    // Check if user owns this farmer profile
    if (farmer.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedFarmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone location avatar');

    res.json(updatedFarmer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get farmer's products
router.get('/:id/products', async (req, res) => {
  try {
    const { category, available } = req.query;
    let filter = { farmer: req.params.id };

    if (category) filter.category = category;
    if (available !== undefined) filter.isAvailable = available === 'true';

    const products = await Product.find(filter)
      .populate('farmer')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get nearby farmers
router.get('/location/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 50 } = req.query; // maxDistance in kilometers

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const farmers = await Farmer.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $match: {
          'user.location.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
              },
              $maxDistance: maxDistance * 1000 // Convert to meters
            }
          }
        }
      },
      {
        $project: {
          farmName: 1,
          farmType: 1,
          rating: 1,
          'user.name': 1,
          'user.location': 1,
          'user.avatar': 1
        }
      }
    ]);

    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to get farmer statistics
async function getFarmerStats(farmerId) {
  const totalProducts = await Product.countDocuments({ farmer: farmerId });
  const availableProducts = await Product.countDocuments({ 
    farmer: farmerId, 
    isAvailable: true 
  });
  
  const totalOrders = await Order.countDocuments({ farmer: farmerId });
  const completedOrders = await Order.countDocuments({ 
    farmer: farmerId, 
    status: 'delivered' 
  });

  const revenue = await Order.aggregate([
    { $match: { farmer: farmerId, status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  return {
    totalProducts,
    availableProducts,
    totalOrders,
    completedOrders,
    totalRevenue: revenue[0]?.total || 0
  };
}

module.exports = router;