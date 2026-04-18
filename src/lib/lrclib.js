/**
 * LRCLIB client — fetches time-synced lyrics (LRC format).
 * Free API, no auth required.
 * Timestamps are centisecond precision: [MM:SS.CC]
 */

const LRC_LINE_RE = /^\[(\d{2}):(\d{2}\.\d{2})\]\s*(.*)$/;

export function parseLRC(syncedLyrics) {
  const lines = [];
  for (const raw of syncedLyrics.split('\n')) {
    const m = LRC_LINE_RE.exec(raw);
    if (!m) continue;
    const timeMs = (parseInt(m[1], 10) * 60 + parseFloat(m[2])) * 1000;
    lines.push({ timeMs, text: m[3].trim() });
  }
  return lines;
}

export async function fetchSyncedLyrics(artist, title) {
  // Try exact match first (faster, single hit)
  try {
    const res = await fetch(
      `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.syncedLyrics) return parseLRC(data.syncedLyrics);
    }
  } catch { /* fall through */ }

  // Fallback: search — pick first result that has syncedLyrics
  try {
    const res = await fetch(
      `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (res.ok) {
      const results = await res.json();
      for (const r of results) {
        if (r.syncedLyrics) return parseLRC(r.syncedLyrics);
      }
    }
  } catch { /* fall through */ }

  return null;
}
