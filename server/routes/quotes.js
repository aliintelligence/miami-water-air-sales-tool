const express = require('express');
const router = express.Router();

// Get all quotes (no auth middleware - handled by RLS)
router.get('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(quotes);
  } catch (error) {
    console.error('Quotes fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single quote
router.get('/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    res.json(quote);
  } catch (error) {
    console.error('Quote fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new quote
router.post('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Generate unique quote number
    const quoteNumber = `Q${Date.now()}`;
    
    const quoteData = {
      ...req.body,
      quote_number: quoteNumber,
      status: 'draft'
    };
    
    const { data: newQuote, error } = await supabase
      .from('quotes')
      .insert([quoteData])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(newQuote);
  } catch (error) {
    console.error('Quote create error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update quote
router.put('/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: updated, error } = await supabase
      .from('quotes')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(updated);
  } catch (error) {
    console.error('Quote update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete quote
router.delete('/:id', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Quote delete error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Send quote for signing
router.post('/:id/send', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { sendMethod = 'email', pdfBase64 } = req.body;
    
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError || !quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    
    // TODO: Integrate with SignNow service
    // For now, just update the status
    const { data: updated, error: updateError } = await supabase
      .from('quotes')
      .update({ 
        status: 'sent',
        pdf_url: pdfBase64 ? 'data:application/pdf;base64,' + pdfBase64.substring(0, 50) + '...' : null
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    res.json({
      message: `Quote sent via ${sendMethod}`,
      quote: updated
    });
  } catch (error) {
    console.error('Quote send error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get quote statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('status, total');
    
    if (error) throw error;
    
    // Calculate statistics
    const stats = quotes.reduce((acc, quote) => {
      if (!acc[quote.status]) {
        acc[quote.status] = { count: 0, totalValue: 0 };
      }
      acc[quote.status].count++;
      acc[quote.status].totalValue += parseFloat(quote.total) || 0;
      return acc;
    }, {});
    
    // Calculate this month's stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthlyQuotes = quotes.filter(q => 
      new Date(q.created_at) >= thisMonth
    );
    
    const monthlyStats = {
      count: monthlyQuotes.length,
      totalValue: monthlyQuotes.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0)
    };
    
    res.json({
      byStatus: stats,
      thisMonth: monthlyStats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;