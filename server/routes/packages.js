const express = require('express');
const router = express.Router();

// Get all packages
router.get('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('name_en', { ascending: true });
    
    if (error) throw error;
    
    res.json(packages);
  } catch (error) {
    console.error('Packages fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single package
router.get('/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: packageData, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    res.json(packageData);
  } catch (error) {
    console.error('Package fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new package (admin only)
router.post('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: newPackage, error } = await supabase
      .from('packages')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(newPackage);
  } catch (error) {
    console.error('Package create error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update package (admin only)
router.put('/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: updated, error } = await supabase
      .from('packages')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(updated);
  } catch (error) {
    console.error('Package update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete package (soft delete, admin only)
router.delete('/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { error } = await supabase
      .from('packages')
      .update({ is_active: false })
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Package delete error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;