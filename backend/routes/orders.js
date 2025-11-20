const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const router = express.Router();

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, deliveryDate } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];
    let farmerId = null;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }

      if (!product.isAvailable) {
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient quantity for ${product.name}` });
      }

      // Set farmer ID (all items should be from the same farmer)
      if (!farmerId) {
        farmerId = product.farmer;
      } else if (product.farmer.toString() !== farmerId.toString()) {
        return res.status(400).json({ message: 'All products must be from the same farmer' });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Update product quantity
      product.quantity -= item.quantity;
      if (product.quantity === 0) {
        product.isAvailable = false;
      }
      await product.save();
    }

    const order = new Order({
      consumer: req.user.id,
      farmer: farmerId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      deliveryDate
    });

    await order.save();
    await order.populate('items.product');
    await order.populate('farmer');
    await order.populate('consumer', 'name email phone');

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let filter = { consumer: req.user.id };

    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('items.product')
      .populate('farmer')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get farmer's orders
router.get('/farmer-orders', auth, async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ user: req.user.id });
    if (!farmer) {
      return res.status(403).json({ message: 'Only farmers can access this endpoint' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    let filter = { farmer: farmer._id };

    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('items.product')
      .populate('consumer', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('farmer')
      .populate('consumer', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    const farmer = await Farmer.findOne({ user: req.user.id });
    const isConsumer = order.consumer._id.toString() === req.user.id;
    const isFarmer = farmer && order.farmer._id.toString() === farmer._id.toString();

    if (!isConsumer && !isFarmer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the farmer or admin
    const farmer = await Farmer.findOne({ user: req.user.id });
    const isFarmer = farmer && order.farmer.toString() === farmer._id.toString();

    if (!isFarmer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    await order.save();

    await order.populate('items.product');
    await order.populate('consumer', 'name email phone');

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cancel order
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is the consumer
    if (order.consumer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only allow cancellation for pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel order in current status' });
    }

    // Restore product quantities
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        product.isAvailable = true;
        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get order statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'consumer') {
      filter.consumer = req.user.id;
    } else if (req.user.role === 'farmer') {
      const farmer = await Farmer.findOne({ user: req.user.id });
      if (!farmer) {
        return res.status(403).json({ message: 'Farmer profile not found' });
      }
      filter.farmer = farmer._id;
    }

    const totalOrders = await Order.countDocuments(filter);
    const pendingOrders = await Order.countDocuments({ ...filter, status: 'pending' });
    const completedOrders = await Order.countDocuments({ ...filter, status: 'delivered' });
    
    const revenue = await Order.aggregate([
      { $match: { ...filter, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: revenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;