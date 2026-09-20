import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { UserRole } from "@/lib/types";
import * as authService from "@/services/authService";
import type { AuthSession } from "@/services/authService";
import * as profileService from "@/services/profileService";

interface User {
  id: string;
  role: UserRole;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<{ error: string | null }>;
  setRegistering: (value: boolean) => void;
  isAuthenticated: boolean;
  loading: boolean;
  profileError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadUser(session: AuthSession): Promise<{ user: User | null; error: string | null }> {
  try {
    const [profileRes, roleRes] = await Promise.all([
      profileService.getProfile(session.userId),
      profileService.getUserRole(session.userId),
    ]);

    if (profileRes.error) {
      console.error("Profile fetch error:", profileRes.error);
      return { user: null, error: `Profile lookup failed: ${profileRes.error}` };
    }
    if (roleRes.error) {
      console.error("Role fetch error:", roleRes.error);
      return { user: null, error: `Role lookup failed: ${roleRes.error}` };
    }
    if (!profileRes.data) {
      return { user: null, error: "Profile not found for this account." };
    }
    if (!roleRes.data?.role) {
      return { user: null, error: "Role not found for this account." };
    }

    return {
      user: {
        id: session.userId,
        email: profileRes.data.email ?? session.email ?? "",
        name: profileRes.data.name ?? "User",
        role: roleRes.data.role,
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
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const registeringRef = useRef(false);

  const setRegistering = (value: boolean) => {
    registeringRef.current = value;
  };

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((newSession) => {
      setSession(newSession);

      // Skip profile fetch during registration — data isn't inserted yet
      if (registeringRef.current) {
        setLoading(false);
        return;
      }

      if (newSession) {
        setTimeout(async () => {
          const { user: profile, error } = await loadUser(newSession);
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

    authService.getCurrentSession().then(async (currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        const { user: profile, error } = await loadUser(currentSession);
        setUser(profile);
        setProfileError(error);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data: newSession, error } = await authService.signInWithPassword(email, password);
    if (error || !newSession) return { error };

    const { user: profile, error: profileLookupError } = await loadUser(newSession);
    setUser(profile);
    setProfileError(profileLookupError);

    return { error: null };
  };

  const refreshProfile = async (): Promise<{ error: string | null }> => {
    const currentSession = await authService.getCurrentSession();
    if (!currentSession) return { error: "No active session" };

    const { user: profile, error } = await loadUser(currentSession);
    setUser(profile);
    setProfileError(error);
    return { error };
  };

  const logout = async () => {
    await authService.signOut();
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
