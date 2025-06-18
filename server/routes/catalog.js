const express = require('express');
const Equipment = require('../models/Equipment');
const Package = require('../models/Package');
const FinancingOption = require('../models/FinancingOption');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Equipment routes
router.get('/equipment', auth, async (req, res) => {
  try {
    const equipment = await Equipment.find({ isActive: true })
      .sort({ categoryKey: 1, sortOrder: 1 });
    
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

router.post('/equipment', auth, requireAdmin, async (req, res) => {
  try {
    const equipment = new Equipment({
      ...req.body,
      createdBy: req.userId,
      updatedBy: req.userId
    });
    
    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/equipment/:id', auth, requireAdmin, async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body, 
        updatedBy: req.userId 
      },
      { new: true, runValidators: true }
    );
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Soft delete
router.delete('/equipment/:id', auth, requireAdmin, async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false, 
        updatedBy: req.userId 
      },
      { new: true }
    );
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json({ message: 'Equipment deactivated', equipment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Package routes
router.get('/packages', auth, async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true })
      .sort({ sortOrder: 1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/packages', auth, requireAdmin, async (req, res) => {
  try {
    const pkg = new Package({
      ...req.body,
      createdBy: req.userId,
      updatedBy: req.userId
    });
    
    await pkg.save();
    res.status(201).json(pkg);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/packages/:id', auth, requireAdmin, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body, 
        updatedBy: req.userId 
      },
      { new: true, runValidators: true }
    );
    
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    res.json(pkg);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/packages/:id', auth, requireAdmin, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false, 
        updatedBy: req.userId 
      },
      { new: true }
    );
    
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    res.json({ message: 'Package deactivated', package: pkg });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Financing options routes
router.get('/financing', auth, async (req, res) => {
  try {
    const options = await FinancingOption.find({ isActive: true })
      .sort({ sortOrder: 1 });
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/financing', auth, requireAdmin, async (req, res) => {
  try {
    const option = new FinancingOption({
      ...req.body,
      createdBy: req.userId,
      updatedBy: req.userId
    });
    
    await option.save();
    res.status(201).json(option);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/financing/:id', auth, requireAdmin, async (req, res) => {
  try {
    const option = await FinancingOption.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body, 
        updatedBy: req.userId 
      },
      { new: true, runValidators: true }
    );
    
    if (!option) {
      return res.status(404).json({ error: 'Financing option not found' });
    }
    
    res.json(option);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/financing/:id', auth, requireAdmin, async (req, res) => {
  try {
    const option = await FinancingOption.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false, 
        updatedBy: req.userId 
      },
      { new: true }
    );
    
    if (!option) {
      return res.status(404).json({ error: 'Financing option not found' });
    }
    
    res.json({ message: 'Financing option deactivated', option });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;