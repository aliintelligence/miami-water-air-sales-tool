const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      return res.status(401).json({ error: authError.message });
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      return res.status(500).json({ error: 'Failed to load user profile' });
    }
    
    // Create JWT token for backend API calls
    const token = jwt.sign(
      { 
        id: authData.user.id,
        email: authData.user.email,
        role: profile.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: profile.username,
        role: profile.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get updated user profile
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();
    
    if (error || !profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: decoded.id,
      email: decoded.email,
      username: profile.username,
      role: profile.role
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Register endpoint (for initial setup)
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, role = 'sales_rep' } = req.body;
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      return res.status(400).json({ error: authError.message });
    }
    
    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        username,
        role
      }])
      .select()
      .single();
    
    if (profileError) {
      // Rollback auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }
    
    res.json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: profile.username,
        role: profile.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;