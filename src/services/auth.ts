import { supabase, isPlaceholderSupabase } from './supabase';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

const MOCK_STORAGE_KEY = 'kaamsathi_demo_session';

const authSubscribers = new Set<(event: AuthChangeEvent, session: Session | null) => void>();

function notifySubscribers(event: AuthChangeEvent, session: Session | null) {
  authSubscribers.forEach((cb) => cb(event, session));
}

function getLocalMockSession(): Session | null {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalMockSession(session: Session | null) {
  try {
    if (session) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(MOCK_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
}

function createMockSession(email: string): Session {
  const userId = 'demo-user-' + btoa(email).replace(/=/g, '').slice(0, 10);
  const user: User = {
    id: userId,
    app_metadata: { provider: 'email' },
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email,
    phone: '',
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  };

  return {
    access_token: 'demo-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'demo-refresh-token',
    user,
  };
}

export const authService = {
  async signUp(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
    if (isPlaceholderSupabase) {
      const session = createMockSession(email);
      setLocalMockSession(session);
      notifySubscribers('SIGNED_IN', session);
      return { user: session.user, session };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
        console.warn('Supabase host unreachable. Switching to local demo session.');
        const session = createMockSession(email);
        setLocalMockSession(session);
        notifySubscribers('SIGNED_IN', session);
        return { user: session.user, session };
      }
      throw err;
    }
  },

  async signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
    if (isPlaceholderSupabase) {
      const existing = getLocalMockSession();
      const session = existing || createMockSession(email);
      setLocalMockSession(session);
      notifySubscribers('SIGNED_IN', session);
      return { user: session.user, session };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Failed to fetch') || msg.includes('fetch')) {
        console.warn('Supabase host unreachable. Switching to local demo session.');
        const session = createMockSession(email);
        setLocalMockSession(session);
        notifySubscribers('SIGNED_IN', session);
        return { user: session.user, session };
      }
      throw err;
    }
  },

  async signOut() {
    setLocalMockSession(null);
    notifySubscribers('SIGNED_OUT', null);

    if (!isPlaceholderSupabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore network signout errors
      }
    }
  },

  async getSession(): Promise<Session | null> {
    const mock = getLocalMockSession();
    if (mock) return mock;

    if (isPlaceholderSupabase) return null;

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch {
      return null;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    return session?.user ?? null;
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    authSubscribers.add(callback);

    let supabaseSub: { unsubscribe: () => void } | null = null;

    if (!isPlaceholderSupabase) {
      try {
        const { data } = supabase.auth.onAuthStateChange(callback);
        supabaseSub = data.subscription;
      } catch {
        // Ignore errors when initializing auth state change listener
      }
    }

    return {
      unsubscribe: () => {
        authSubscribers.delete(callback);
        if (supabaseSub) supabaseSub.unsubscribe();
      },
    };
  },
};


