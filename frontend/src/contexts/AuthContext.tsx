
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

interface DemoUserRecord {
  user: User;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'tubeinsight_demo_users';
const SESSION_STORAGE_KEY = 'tubeinsight_demo_session';

const getDemoUsers = (): DemoUserRecord[] => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch {
    return [];
  }
};

const saveDemoUsers = (users: DemoUserRecord[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const createAccessToken = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createAuthError = (message: string) => ({ error: { message } });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession) as Session;
        if (parsedSession?.user?.id && parsedSession.access_token) {
          setSession(parsedSession);
          setUser(parsedSession.user);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    console.log('Mock checkSubscription called');
  };

  const signUp = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password.trim()) {
      return createAuthError('Email and password are required.');
    }

    const users = getDemoUsers();
    if (users.some(({ user }) => user.email?.toLowerCase() === normalizedEmail)) {
      return createAuthError('An account with this email already exists.');
    }

    const user: User = {
      id: createAccessToken(),
      email: normalizedEmail,
      user_metadata: {},
    };
    saveDemoUsers([...users, { user, password }]);

    const session: Session = {
      access_token: createAccessToken(),
      user,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    setUser(user);
    setSession(session);
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password.trim()) {
      return createAuthError('Email and password are required.');
    }

    const matchingUser = getDemoUsers().find(
      ({ user, password: storedPassword }) => user.email?.toLowerCase() === normalizedEmail && storedPassword === password,
    );
    if (!matchingUser) {
      return createAuthError('Invalid email or password.');
    }

    const session: Session = {
      access_token: createAccessToken(),
      user: matchingUser.user,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    setUser(matchingUser.user);
    setSession(session);
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
    setSession(null);
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const userExists = getDemoUsers().some(({ user }) => user.email?.toLowerCase() === normalizedEmail);
    if (!normalizedEmail || !userExists) {
      return createAuthError('No demo account was found for this email.');
    }

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
