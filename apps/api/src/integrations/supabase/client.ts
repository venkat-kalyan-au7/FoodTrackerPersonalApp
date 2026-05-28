import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../../config/index.js";

// Creates a Supabase client that uses the user's JWT token.
// This ensures Row Level Security policies are enforced.
export function createUserSupabaseClient(userToken: string): SupabaseClient {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Admin client using service role key.
// Use ONLY for privileged operations (invitations, admin tasks).
// NEVER use for normal user-owned CRUD - it bypasses RLS.
let _adminClient: SupabaseClient | null = null;

export function getAdminSupabaseClient(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return _adminClient;
}

// Validates a user token and returns the user ID.
export async function validateToken(
  token: string
): Promise<{ userId: string; email: string } | null> {
  try {
    const adminClient = getAdminSupabaseClient();
    const { data, error } = await adminClient.auth.getUser(token);
    if (error || !data.user) return null;
    return {
      userId: data.user.id,
      email: data.user.email ?? "",
    };
  } catch {
    return null;
  }
}
