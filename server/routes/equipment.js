const express = require('express');
const router = express.Router();

// Get all equipment organized by category
router.get('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: equipment, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name_en', { ascending: true });
    
    if (error) throw error;
    
    // Organize by category
    const organized = equipment.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
    
    res.json(organized);
  } catch (error) {
    console.error('Equipment fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single equipment
router.get('/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: equipment, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (error) {
    console.error('Equipment fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new equipment (admin only)
router.post('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: newEquipment, error } = await supabase
      .from('equipment')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(newEquipment);
  } catch (error) {
    console.error('Equipment create error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update equipment (admin only)
router.put('/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: updated, error } = await supabase
      .from('equipment')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(updated);
  } catch (error) {
    console.error('Equipment update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete equipment (soft delete, admin only)
router.delete('/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { error } = await supabase
      .from('equipment')
      .update({ is_active: false })
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Equipment delete error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;