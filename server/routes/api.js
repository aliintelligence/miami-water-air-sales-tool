const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Equipment, Package, FinancingOption, User, Quote } = require('../models');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Admin-only middleware
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.dbUser = user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Equipment Routes
router.get('/equipment', authenticateToken, async (req, res) => {
  try {
    const equipment = await Equipment.find({ isActive: true }).sort({ categoryKey: 1, sortOrder: 1 });
    
    // Group by category
    const catalog = {};
    equipment.forEach(item => {
      if (!catalog[item.categoryKey]) {
        catalog[item.categoryKey] = [];
      }
      catalog[item.categoryKey].push(item);
    });
    
    res.json(catalog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/equipment', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const maxSortOrder = await Equipment.findOne({ categoryKey: req.body.categoryKey })
      .sort({ sortOrder: -1 })
      .select('sortOrder');
    
    const equipment = new Equipment({
      ...req.body,
      sortOrder: (maxSortOrder?.sortOrder || 0) + 1
    });
    
    await equipment.save();
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/equipment/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/equipment/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Equipment.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Package Routes
router.get('/packages', authenticateToken, async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/packages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const maxSortOrder = await Package.findOne().sort({ sortOrder: -1 }).select('sortOrder');
    
    const package = new Package({
      ...req.body,
      sortOrder: (maxSortOrder?.sortOrder || 0) + 1
    });
    
    await package.save();
    res.json(package);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/packages/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const package = await Package.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(package);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/packages/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Package.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Financing Options Routes
router.get('/financing-options', authenticateToken, async (req, res) => {
  try {
    const options = await FinancingOption.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/financing-options', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const maxSortOrder = await FinancingOption.findOne().sort({ sortOrder: -1 }).select('sortOrder');
    
    const option = new FinancingOption({
      ...req.body,
      sortOrder: (maxSortOrder?.sortOrder || 0) + 1
    });
    
    await option.save();
    res.json(option);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/financing-options/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const option = await FinancingOption.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(option);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/financing-options/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await FinancingOption.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Routes
router.get('/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users/sync', authenticateToken, async (req, res) => {
  try {
    const { email, cognitoId, firstName, lastName, groups } = req.body;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        email,
        cognitoId,
        firstName,
        lastName,
        role: groups?.includes('Admins') ? 'admin' : 'rep'
      });
    } else {
      user.cognitoId = cognitoId;
      user.firstName = firstName;
      user.lastName = lastName;
      user.role = groups?.includes('Admins') ? 'admin' : 'rep';
    }
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quote Routes
router.get('/quotes', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    
    let query = {};
    if (user.role !== 'admin') {
      query.salesRepId = user._id;
    }
    
    const quotes = await Quote.find(query)
      .populate('salesRepId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/quotes', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    
    const quote = new Quote({
      ...req.body,
      salesRepId: user._id
    });
    
    await quote.save();
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;