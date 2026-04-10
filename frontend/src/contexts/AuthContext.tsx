
import React, { createContext, useContext, useEffect, useState } from 'react';

// Mocking User and Session types to avoid Supabase dependency
export interface User {
  id: string;
  email?: string;
  user_metadata: any;
}

export interface Session {
  access_token: string;
  user: User;
}

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscription: SubscriptionInfo;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  checkSubscription: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [loading, setLoading] = useState(false);

  // Mocking auth states and functions
  const checkSubscription = async () => {
    // Pure frontend mock
    console.log('Mock checkSubscription called');
  };

  const signUp = async (email: string, password: string) => {
    console.log('Mock signUp called');
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Mock signIn called');
    // For local dev, maybe auto-login? Or leave as null.
    return { error: null };
  };

  const signOut = async () => {
    console.log('Mock signOut called');
    setUser(null);
    setSession(null);
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    console.log('Mock resetPassword called');
    return { error: null };
  };

  const value = {
    user,
    session,
    subscription,
    signUp,
    signIn,
    signOut,
    resetPassword,
    checkSubscription,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
