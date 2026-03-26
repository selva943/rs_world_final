import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
    user: any | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
    verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; user?: any; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EDGE_FUNCTION_URL = "https://sgtilupufrjvsetuhtlt.supabase.co/functions/v1/server/make-server-effbb2fe";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [customUser, setCustomUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load custom user from localStorage
        const storedUser = localStorage.getItem('pb_user');
        if (storedUser) {
            try {
                setCustomUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('pb_user');
            }
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                setUser(session.user);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                setUser(session.user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Combine users
    const effectiveUser = user || customUser;

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setCustomUser(null);
        localStorage.removeItem('pb_user');
        localStorage.removeItem('pb_token');
    };

    const sendOtp = async (phone: string) => {
        try {
            const res = await fetch(`${EDGE_FUNCTION_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (data.error) return { success: false, error: data.error };
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    };

    const verifyOtp = async (phone: string, otp: string) => {
        try {
            const res = await fetch(`${EDGE_FUNCTION_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp }),
            });
            const data = await res.json();
            if (data.error) return { success: false, error: data.error };
            
            // Success
            setCustomUser(data.user);
            localStorage.setItem('pb_user', JSON.stringify(data.user));
            localStorage.setItem('pb_token', data.token);
            
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user: effectiveUser,
                session,
                loading,
                signIn,
                signOut,
                sendOtp,
                verifyOtp
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
