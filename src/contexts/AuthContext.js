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
      console.log('Loading user profile for ID:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Profile query error:', error);
        
        // If user profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Creating user profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([{
              id: userId,
              username: 'user',
              role: 'sales_rep'
            }])
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            throw createError;
          }
          
          setUserProfile(newProfile);
          setIsAdmin(newProfile.role === 'admin');
          return newProfile;
        }
        throw error;
      }
      
      console.log('Profile loaded:', data);
      setUserProfile(data);
      setIsAdmin(data.role === 'admin');
      return data;
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Don't throw here, just set defaults
      setUserProfile(null);
      setIsAdmin(false);
      return null;
    }
  };

  // Load current user from Supabase Auth
  const loadUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
      }
      
      if (session?.user) {
        console.log('Found existing session for user:', session.user.id);
        setUser(session.user);
        await loadUserProfile(session.user.id);
        return;
      }
      
      // If no session, try to get user directly
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth error:', error);
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        return;
      }
      
      if (user) {
        console.log('User authenticated:', user.id);
        setUser(user);
        await loadUserProfile(user.id);
      } else {
        console.log('No authenticated user');
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
      
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      if (data.user) {
        console.log('Sign in successful:', data.user.id);
        setUser(data.user);
        const profile = await loadUserProfile(data.user.id);
        return { success: true, user: data.user, profile };
      }
      
      throw new Error('Login failed - no user returned');
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
    console.log('Setting up auth listener...');
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
        // Don't reload profile on token refresh
      }
    });

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
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