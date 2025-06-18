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

async function syncAuthUsers() {
  try {
    console.log('Syncing all auth users and making them admins...');
    
    // Get all auth users (requires service role key)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    console.log(`Found ${authUsers.users.length} auth users:`);
    
    for (const authUser of authUsers.users) {
      console.log(`\nProcessing: ${authUser.email} (${authUser.id})`);
      
      // Check if user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`Error checking profile for ${authUser.email}:`, fetchError);
        continue;
      }
      
      if (existingProfile) {
        // Update existing profile to admin if not already
        if (existingProfile.role !== 'admin') {
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', authUser.id);
          
          if (updateError) {
            console.error(`Error updating ${authUser.email} to admin:`, updateError);
          } else {
            console.log(`✅ Updated ${authUser.email} to admin`);
          }
        } else {
          console.log(`✅ ${authUser.email} is already admin`);
        }
      } else {
        // Create new profile as admin
        const { error: createError } = await supabase
          .from('users')
          .insert([{
            id: authUser.id,
            username: authUser.email.split('@')[0],
            role: 'admin'
          }]);
        
        if (createError) {
          console.error(`Error creating profile for ${authUser.email}:`, createError);
        } else {
          console.log(`✅ Created admin profile for ${authUser.email}`);
        }
      }
    }
    
    // Display final summary
    console.log('\n📋 Final User Summary:');
    const { data: allUsers, error: summaryError } = await supabase
      .from('users')
      .select('*');
    
    if (!summaryError && allUsers) {
      allUsers.forEach(user => {
        console.log(`- ${user.username} (Role: ${user.role})`);
      });
    }
    
    console.log('\n🎉 All users are now admins!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

syncAuthUsers();