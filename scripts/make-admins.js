#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function makeAllUsersAdmins() {
  try {
    console.log('Making all users admins...');
    
    // Get all users
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return;
    }
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.username} (${user.id}) - Current role: ${user.role}`);
    });
    
    // Update all users to admin
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .neq('role', 'admin') // Only update non-admin users
      .select();
    
    if (updateError) {
      console.error('Error updating users:', updateError);
      return;
    }
    
    if (updated && updated.length > 0) {
      console.log(`\n✅ Updated ${updated.length} users to admin:`);
      updated.forEach(user => {
        console.log(`- ${user.username} (${user.id}) - New role: ${user.role}`);
      });
    } else {
      console.log('\n✅ All users are already admins!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

makeAllUsersAdmins();