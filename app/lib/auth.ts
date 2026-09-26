import { getSupabaseClient } from "./supabase";

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function register(email: string, password: string, fullName: string): Promise<void> {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  if (!data.session) {
    throw new Error("Registration did not start a session. Turn off Confirm Email in your Supabase project's Email provider settings.");
  }
}

// Returns a refreshed JWT for Authorization: Bearer <token>, or null if signed out.
export async function getAccessToken(): Promise<string | null> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw error;
  return data.session?.access_token ?? null;
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
}
