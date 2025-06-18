const express = require('express');
const router = express.Router();

// Get all financing options
router.get('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: options, error } = await supabase
      .from('financing_options')
      .select('*')
      .eq('is_active', true)
      .order('term_months', { ascending: true });
    
    if (error) throw error;
    
    res.json(options);
  } catch (error) {
    console.error('Financing options fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single financing option
router.get('/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: option, error } = await supabase
      .from('financing_options')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!option) {
      return res.status(404).json({ error: 'Financing option not found' });
    }
    
    res.json(option);
  } catch (error) {
    console.error('Financing option fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new financing option (admin only)
router.post('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: newOption, error } = await supabase
      .from('financing_options')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(newOption);
  } catch (error) {
    console.error('Financing option create error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update financing option (admin only)
router.put('/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: updated, error } = await supabase
      .from('financing_options')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(updated);
  } catch (error) {
    console.error('Financing option update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete financing option (soft delete, admin only)
router.delete('/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { error } = await supabase
      .from('financing_options')
      .update({ is_active: false })
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    res.json({ message: 'Financing option deleted successfully' });
  } catch (error) {
    console.error('Financing option delete error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;