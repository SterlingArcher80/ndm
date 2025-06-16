
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const DEMO_EMAIL = 'admin@demo.com';
const DEMO_PASSWORD = 'admin123456';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const createDemoAccount = async () => {
    console.log('Creating demo account...');
    const { data, error } = await supabase.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (error && error.message !== 'User already registered') {
      console.error('Error creating demo account:', error);
      return false;
    }
    
    console.log('Demo account created or already exists');
    return true;
  };

  const signInDemoAccount = async () => {
    console.log('Signing in demo account...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    
    if (error) {
      console.error('Error signing in demo account:', error);
      // If sign in fails, try to create the account first
      const created = await createDemoAccount();
      if (created) {
        // Try signing in again after creating the account
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });
        
        if (retryError) {
          console.error('Error signing in demo account after creation:', retryError);
          return false;
        }
        return true;
      }
      return false;
    }
    
    console.log('Demo account signed in successfully');
    return true;
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Existing session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      // If in development mode and no user is logged in, auto-login with demo account
      if (import.meta.env.DEV && !session?.user) {
        console.log('Development mode: Auto-logging in with demo account...');
        await signInDemoAccount();
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
};
