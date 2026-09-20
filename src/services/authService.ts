import { supabase } from "@/integrations/supabase/client";
import { ok, fail, type ServiceResult } from "./result";

export interface AuthSession {
  userId: string;
  email: string | null;
}

function toAuthSession(session: { user: { id: string; email?: string | null } } | null): AuthSession | null {
  if (!session) return null;
  return { userId: session.user.id, email: session.user.email ?? null };
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  const { data } = await supabase.auth.getSession();
  return toAuthSession(data.session);
}

export function onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(toAuthSession(session));
  });
  return () => subscription.unsubscribe();
}

export async function signUp(email: string, password: string): Promise<ServiceResult<AuthSession>> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) return fail(error?.message ?? "Unknown error");
  return ok({ userId: data.user.id, email: data.user.email ?? null });
}

export async function signInWithPassword(email: string, password: string): Promise<ServiceResult<AuthSession>> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) return fail(error?.message ?? "Could not authenticate after signup");
  return ok({ userId: data.user.id, email: data.user.email ?? null });
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
