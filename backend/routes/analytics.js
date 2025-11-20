const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const router = express.Router();

// Get farmer analytics
router.get('/farmer/:farmerId', auth, async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    const products = await Product.find({ farmer: farmerId });
    const orders = await Order.find({ farmer: farmerId });
    
    const totalRevenue = orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const popularProducts = await Product.aggregate([
      { $match: { farmer: mongoose.Types.ObjectId(farmerId) } },
      { $lookup: {
          from: 'orderitems',
          localField: '_id',
          foreignField: 'product',
          as: 'orders'
        }
      },
      { $project: {
          name: 1,
          orderCount: { $size: '$orders' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 }
    ]);

    const monthlySales = await Order.aggregate([
      { $match: { 
          farmer: mongoose.Types.ObjectId(farmerId),
          status: 'delivered'
        } 
      },
      { $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      popularProducts,
      monthlySales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;