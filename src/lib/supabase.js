import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database helpers for tables
export const tables = {
  equipment: 'equipment',
  packages: 'packages',
  financingOptions: 'financing_options',
  quotes: 'quotes',
  users: 'users',
};

// Generic CRUD operations
export const db = {
  // Get all records
  getAll: async (table) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get single record
  getById: async (table, id) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Create record
  create: async (table, record) => {
    const { data, error } = await supabase
      .from(table)
      .insert([record])
      .select()
      .single();
    return { data, error };
  },

  // Update record
  update: async (table, id, updates) => {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Delete record
  delete: async (table, id) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    return { error };
  },
};