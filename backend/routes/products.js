const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Farmer = require('../models/Farmer');
const router = express.Router();

// Get all products with filters and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      farmer, 
      minPrice, 
      maxPrice, 
      organic, 
      search,
      page = 1, 
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let filter = { isAvailable: true };

    // Apply filters
    if (category) filter.category = category;
    if (farmer) filter.farmer = farmer;
    if (organic) filter.isOrganic = organic === 'true';
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { variety: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .populate('farmer')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get similar products
    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isAvailable: true
    })
    .populate('farmer')
    .limit(4);

    res.json({ product, similarProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product (Farmer only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is a farmer
    const farmer = await Farmer.findOne({ user: req.user.id });
    if (!farmer) {
      return res.status(403).json({ message: 'Only farmers can create products' });
    }

    const productData = {
      ...req.body,
      farmer: farmer._id
    };

    const product = new Product(productData);
    await product.save();
    
    await product.populate('farmer');
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product (Farmer only)
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    const farmer = await Farmer.findOne({ user: req.user.id });
    if (!farmer || product.farmer.toString() !== farmer._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('farmer');

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product (Farmer only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const farmer = await Farmer.findOne({ user: req.user.id });
    if (!farmer || product.farmer.toString() !== farmer._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const products = await Product.find({ 
      category, 
      isAvailable: true 
    })
    .populate('farmer')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ category, isAvailable: true });

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product availability
router.patch('/:id/availability', auth, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const farmer = await Farmer.findOne({ user: req.user.id });
    if (!farmer || product.farmer.toString() !== farmer._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    product.isAvailable = isAvailable;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;