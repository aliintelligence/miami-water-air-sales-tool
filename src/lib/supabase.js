import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    REACT_APP_SUPABASE_URL: !!supabaseUrl,
    REACT_APP_SUPABASE_ANON_KEY: !!supabaseAnonKey
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Authentication helpers
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Database helpers for tables
export const tables = {
  equipment: 'equipment',
  packages: 'packages',
  financingOptions: 'financing_options',
  quotes: 'quotes',
  users: 'users',
};

// Generic CRUD operations with better error handling
export const db = {
  // Get all records
  getAll: async (table) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Error fetching all from ${table}:`, error);
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error in getAll for ${table}:`, error);
      return { data: null, error };
    }
  },

  // Get single record
  getById: async (table, id) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching ${table} by id ${id}:`, error);
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error in getById for ${table}:`, error);
      return { data: null, error };
    }
  },

  // Create record
  create: async (table, record) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .insert([record])
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating in ${table}:`, error);
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error in create for ${table}:`, error);
      return { data: null, error };
    }
  },

  // Update record
  update: async (table, id, updates) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating ${table} id ${id}:`, error);
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error in update for ${table}:`, error);
      return { data: null, error };
    }
  },

  // Delete record
  delete: async (table, id) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting from ${table} id ${id}:`, error);
        throw error;
      }
      
      return { error: null };
    } catch (error) {
      console.error(`Error in delete for ${table}:`, error);
      return { error };
    }
  },
};