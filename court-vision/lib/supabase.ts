import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isPreviewFixtureMode, previewFixtureFetch } from "./preview-fixtures";

export const PLAYER_READ_BUDGET_MS = 8_000;

// Only these categories can reach logs; never retain the original backend error.
export class PlayerDataError extends Error {
  constructor(category: "configuration" | "timeout" | "unavailable") {
    super(`Player data unavailable (${category})`);
    this.name = "PlayerDataError";
  }
}

function createReadClient(signal: AbortSignal) {
  const fixtures = isPreviewFixtureMode();
  const url = fixtures ? "https://court-vision-fixtures.invalid" : process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = fixtures ? "synthetic-fixture-placeholder" : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  try {
    if (!url || !key || !["http:", "https:"].includes(new URL(url).protocol)) {
      throw new PlayerDataError("configuration");
    }
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: (input, init) => (fixtures ? previewFixtureFetch : fetch)(input, {
          ...init,
          cache: "no-store",
          signal: init?.signal ? AbortSignal.any([signal, init.signal]) : signal,
        }),
      },
    });
  } catch {
    throw new PlayerDataError("configuration");
  }
}

// One deadline covers identity AND details, with a fresh controller per render.
export async function withPlayerRead<T>(
  read: (client: SupabaseClient) => Promise<T>,
  budgetMs = PLAYER_READ_BUDGET_MS,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), budgetMs);
  try {
    return await read(createReadClient(controller.signal));
  } catch (error) {
    if (error instanceof PlayerDataError) throw error;
    throw new PlayerDataError(controller.signal.aborted ? "timeout" : "unavailable");
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
