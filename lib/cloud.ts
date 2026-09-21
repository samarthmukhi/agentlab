import type { SupabaseClient } from "@supabase/supabase-js";
import { migrateState } from "./state";
import type { AppState } from "./types";

// Cloud persistence: the whole AppState lives as one JSONB row per user in the
// `user_state` table, guarded by row-level security. See supabase/schema.sql.

const TABLE = "user_state";

/** Load the signed-in user's state, or null if they have no row yet. */
export async function loadCloudState(
  supabase: SupabaseClient,
  userId: string,
): Promise<AppState | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("loadCloudState:", error.message);
    return null;
  }
  if (!data?.state) return null;
  // Run through migrateState so older/partial cloud rows upgrade cleanly.
  return migrateState(data.state);
}

/** Upsert the signed-in user's state. */
export async function saveCloudState(
  supabase: SupabaseClient,
  userId: string,
  state: AppState,
): Promise<void> {
  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) console.warn("saveCloudState:", error.message);
}
