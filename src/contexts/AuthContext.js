import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
  error: null
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile from Supabase
  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      setUserProfile(data);
      setIsAdmin(data.role === 'admin');
      return data;
    } catch (error) {
      console.error('Error loading user profile:', error);
      throw error;
    }
  };

  // Load current user from Supabase Auth
  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        await loadUserProfile(user.id);
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setError(error.message);
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in handler
  const handleSignIn = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        const profile = await loadUserProfile(data.user.id);
        return { success: true, user: data.user, profile };
      }
      
      throw new Error('Login failed');
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      setError(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error.message);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    await loadUser();
  };

  // Listen for auth changes
  useEffect(() => {
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    isAdmin,
    isLoading,
    error,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;