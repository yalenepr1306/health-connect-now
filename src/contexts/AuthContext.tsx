import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/types";

interface User {
  id: string;
  role: UserRole;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<{ error: string | null }>;
  setRegistering: (value: boolean) => void;
  isAuthenticated: boolean;
  loading: boolean;
  profileError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(supabaseUser: SupabaseUser): Promise<{ user: User | null; error: string | null }> {
  try {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", supabaseUser.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", supabaseUser.id).maybeSingle(),
    ]);

    if (profileRes.error) {
      console.error("Profile fetch error:", profileRes.error.message);
      return { user: null, error: `Profile lookup failed: ${profileRes.error.message}` };
    }
    if (roleRes.error) {
      console.error("Role fetch error:", roleRes.error.message);
      return { user: null, error: `Role lookup failed: ${roleRes.error.message}` };
    }
    if (!profileRes.data) {
      return { user: null, error: "Profile not found for this account." };
    }
    if (!roleRes.data?.role) {
      return { user: null, error: "Role not found for this account." };
    }

    return {
      user: {
        id: supabaseUser.id,
        email: profileRes.data.email ?? supabaseUser.email ?? "",
        name: profileRes.data.name ?? supabaseUser.user_metadata?.name ?? "User",
        role: roleRes.data.role as UserRole,
      },
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown auth error";
    console.error("Unexpected profile fetch error:", message);
    return { user: null, error: message };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const registeringRef = useRef(false);

  const setRegistering = (value: boolean) => {
    registeringRef.current = value;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);

      // Skip profile fetch during registration — data isn't inserted yet
      if (registeringRef.current) {
        setLoading(false);
        return;
      }

      if (newSession?.user) {
        setTimeout(async () => {
          const { user: profile, error } = await fetchUserProfile(newSession.user);
          setUser(profile);
          setProfileError(error);
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setProfileError(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const { user: profile, error } = await fetchUserProfile(currentSession.user);
        setUser(profile);
        setProfileError(error);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      const { user: profile, error: profileLookupError } = await fetchUserProfile(data.user);
      setUser(profile);
      setProfileError(profileLookupError);
    }

    return { error: null };
  };

  const refreshProfile = async (): Promise<{ error: string | null }> => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession?.user) return { error: "No active session" };

    const { user: profile, error } = await fetchUserProfile(currentSession.user);
    setUser(profile);
    setProfileError(error);
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfileError(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, refreshProfile, setRegistering, isAuthenticated: !!user, loading, profileError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
