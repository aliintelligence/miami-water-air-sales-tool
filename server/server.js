const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars - make sure this is at the very top
dotenv.config();

// Debug: Check if env vars are loaded
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Loaded' : 'Not loaded');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Import Supabase client
const { supabase } = require('./lib/supabase');

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Allow localhost origins
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow Vercel preview URLs
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make supabase available to routes
app.locals.supabase = supabase;

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/financing', require('./routes/financing'));
app.use('/api/financing-options', require('./routes/financing'));
app.use('/api/quotes', require('./routes/quotes'));

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('equipment')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      database: 'Connected'
    });
  } catch (error) {
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      database: 'Error: ' + error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});