/**
 * JSONBin.io cloud sync — multi-user, keyed by lowercase name.
 * Bin structure: { "riki": { ...UserProgress }, "other": { ...UserProgress } }
 */

import type { UserProgress } from '../types/progress';

const KEY = import.meta.env.VITE_JSONBIN_KEY as string;
const BIN = import.meta.env.VITE_JSONBIN_BIN as string;
const ENDPOINT = `https://api.jsonbin.io/v3/b/${BIN}`;

export function isSyncConfigured(): boolean {
  const ok = Boolean(KEY && BIN);
  if (!ok) console.warn('[sync] Not configured — KEY:', KEY ? '✓' : '✗', 'BIN:', BIN ? '✓' : '✗');
  return ok;
}

type CloudStore = Record<string, UserProgress>;

async function getStore(): Promise<CloudStore> {
  try {
    const res = await fetch(`${ENDPOINT}/latest`, {
      headers: { 'X-Master-Key': KEY },
    });
    if (!res.ok) return {};
    const data = await res.json();
    return (data.record as CloudStore) ?? {};
  } catch {
    return {};
  }
}

async function putStore(store: CloudStore): Promise<void> {
  await fetch(ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Master-Key': KEY },
    body: JSON.stringify(store),
  });
}

/** Fetches this user's progress from the cloud (matched by name, case-insensitive). */
export async function pullProgress(name: string): Promise<UserProgress | null> {
  if (!isSyncConfigured() || !name) return null;
  const store = await getStore();
  const key = name.toLowerCase().trim();
  return store[key] ?? null;
}

/** Saves this user's progress to the cloud under their lowercase name. */
export async function pushProgress(progress: UserProgress): Promise<void> {
  if (!isSyncConfigured() || !progress.name) return;
  console.log('[sync] Pushing for:', progress.name);
  try {
    const store = await getStore();
    const key = progress.name.toLowerCase().trim();
    store[key] = progress;
    await putStore(store);
    console.log('[sync] Push successful');
  } catch (e) {
    console.error('[sync] Push failed:', e);
  }
}
