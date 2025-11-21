'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithEmail: (email: string, metaData?: { user_type: 'individual' | 'company' }) => Promise<void>;
    signUp: (email: string, password: string, metaData?: { user_type: 'individual' | 'company', username?: string }) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signInWithEmail: async () => { },
    signUp: async () => { },
    signIn: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, metaData?: { user_type: 'individual' | 'company' }) => {
        // For simplicity in this MVP, we'll use Magic Link or just anonymous if enabled.
        // But since we need a persistent user for profiles, let's try OTP or just simple sign up.
        // Actually, for a quick start without email confirmation, let's use signInAnonymously if enabled,
        // OR just standard signUp/signIn.
        // Let's assume we want to just "log in" easily.
        // For now, I'll implement a simple Magic Link flow as it's standard.
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: metaData // Pass metadata (user_type) to Supabase Auth
                }
            });
            if (error) throw error;
            alert('Check your email for the login link!');
        } catch (error) {
            console.error('Error signing in:', error);
            alert('Error signing in. Please try again.');
        }
    };

    const signUp = async (email: string, password: string, metaData?: { user_type: 'individual' | 'company', username?: string }) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metaData
                }
            });
            if (error) throw error;
            // alert('Account created! You can now sign in.'); // Removed alert to handle in UI
        } catch (error: any) {
            console.error('Error signing up:', error);
            alert(error.message || 'Error signing up');
            throw error;
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
        } catch (error: any) {
            console.error('Error signing in:', error);
            alert(error.message || 'Error signing in');
            throw error;
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithEmail, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
