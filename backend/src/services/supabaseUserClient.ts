import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseUserClient: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function findUserByEmail(email: string) {
  if (!supabaseUserClient) {
    return null;
  }

  const { data, error } = await supabaseUserClient.from("User").select("*").eq("email", email).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createUserRecord(input: {
  email: string;
  name: string;
  passwordHash: string;
}) {
  if (!supabaseUserClient) {
    return null;
  }

  const { data, error } = await supabaseUserClient.from("User").insert(input).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}
