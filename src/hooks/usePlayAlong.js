/**
 * usePlayAlong — orchestrates Spotify IFrame playback + LRCLIB timing sync.
 *
 * Flow:
 *  1. activate() → fetch LRC lyrics, show embed div, load Spotify script
 *  2. Spotify IFrame API fires playback_update {position: ms}
 *  3. Binary-search LRC lines for current index
 *  4. Map LRC index → tab line key via pre-built lineMap
 *  5. Set activeKey → TabView highlights + scrolls to that line
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchSyncedLyrics } from '../lib/lrclib';
import { mockSongs } from '../data/songs';

// ─── Line mapping ─────────────────────────────────────────────────────────────

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

/** Extract all lyric-bearing lines from parsed tab sections, in document order. */
function buildTabLines(sections) {
  const lines = [];
  sections.forEach((section, si) => {
    if (section.type === 'verse_group') {
      section.rows.forEach((row, ri) => {
        const text = row.lyric?.trim() ?? '';
        if (text) lines.push({ key: `${si}-${ri}`, norm: normalizeText(text) });
      });
    } else if (section.type === 'chord_lyric') {
      const text = section.lyric?.trim() ?? '';
      if (text) lines.push({ key: `${si}-0`, norm: normalizeText(text) });
    }
  });
  return lines;
}

/**
 * Scan forward from cursor for the best matching tab line.
 * Tries exact match, then word-overlap, never scans backward.
 */
function findForward(lrcNorm, tabLines, cursor) {
  const LOOK_AHEAD = 14;
  const limit = Math.min(cursor + LOOK_AHEAD, tabLines.length);

  for (let i = cursor; i < limit; i++) {
    if (tabLines[i].norm === lrcNorm) return i;
  }

  const words = lrcNorm.split(' ').filter(w => w.length > 2);
  if (words.length > 0) {
    let best = { score: 0.39, idx: -1 };
    for (let i = cursor; i < limit; i++) {
      const tabWords = tabLines[i].norm.split(' ');
      const hit = words.filter(w => tabWords.includes(w)).length;
      const score = hit / words.length;
      if (score > best.score) best = { score, idx: i };
    }
    if (best.idx >= 0) return best.idx;
  }

  return -1;
}

export function buildLineMap(lrcLines, sections) {
  const tabLines = buildTabLines(sections);
  if (!tabLines.length) return lrcLines.map(() => null);

  const map = [];
  let cursor = 0;
  let seqIdx = 0;

  for (const lrc of lrcLines) {
    if (!lrc.text) { map.push(null); continue; }

    const norm = normalizeText(lrc.text);
    const found = findForward(norm, tabLines, cursor);

    if (found >= 0) {
      map.push(tabLines[found].key);
      cursor = found;
    } else {
      map.push(tabLines[seqIdx % tabLines.length].key);
    }
    seqIdx++;
  }

  return map;
}

/** Binary search: largest lrcLines[i].timeMs ≤ positionMs */
function findCurrentIdx(lrcLines, positionMs) {
  let lo = 0, hi = lrcLines.length - 1, result = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lrcLines[mid].timeMs <= positionMs) { result = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return result;
}

// ─── Spotify IFrame API ───────────────────────────────────────────────────────

const pendingCallbacks = [];

/**
 * Loads the Spotify IFrame API script and calls onReady(IFrameAPI) when ready.
 * Safe to call multiple times — deduplicates script loading.
 * Survives hot-reload by checking window.SpotifyIframeApi directly.
 */
function ensureSpotifyScript(onReady) {
  // API already on window (handles hot-reload where module var was reset)
  if (window.SpotifyIframeApi) {
    onReady(window.SpotifyIframeApi);
    return;
  }

  pendingCallbacks.push(onReady);

  // Script already injected — just wait for the global callback
  if (document.getElementById('spotify-iframe-api-script')) return;

  // First time: inject script and set up global callback
  const prevCb = window.onSpotifyIframeApiReady;
  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    prevCb?.(IFrameAPI);
    window.SpotifyIframeApi = IFrameAPI;
    pendingCallbacks.splice(0).forEach(cb => cb(IFrameAPI));
  };

  const script = document.createElement('script');
  script.id = 'spotify-iframe-api-script';
  script.src = 'https://open.spotify.com/embed/iframe-api/v1';
  script.async = true;
  document.head.appendChild(script);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param {object}    song       - song object (.artist, .title, .spotifyTrackId, .id)
 * @param {Array}     sections   - parsed tab sections from parseTabContent()
 * @param {React.Ref} scrollRef  - ref to the tab content scroll container
 */
export function usePlayAlong(song, sections, scrollRef) {
  const [status, setStatus] = useState('idle');
  // idle | loading | ready | playing | paused | no-lyrics | error

  const [activeKey, setActiveKey] = useState(null);

  const lrcLinesRef   = useRef([]);
  const lineMapRef    = useRef([]);
  const controllerRef = useRef(null);
  const embedRef      = useRef(null);
  const lastIdxRef    = useRef(-1);
  const sectionsRef   = useRef(sections);
  sectionsRef.current = sections;

  // Resolve spotifyTrackId robustly: from song prop, or look up in mockSongs by id
  const spotifyTrackId = song.spotifyTrackId
    || mockSongs.find(s => s.id === song.id)?.spotifyTrackId
    || null;

  // ── Position handler ─────────────────────────────────────────────────────────
  const onPositionUpdate = useCallback((positionMs) => {
    const idx = findCurrentIdx(lrcLinesRef.current, positionMs);
    if (idx === lastIdxRef.current) return;
    lastIdxRef.current = idx;

    const key = lineMapRef.current[idx] ?? null;
    setActiveKey(key);

    if (key && scrollRef?.current) {
      const el = scrollRef.current.querySelector(`[data-line-key="${key}"]`);
      if (el) {
        const container = scrollRef.current;
        const center = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
        container.scrollTo({ top: Math.max(0, center), behavior: 'smooth' });
      }
    }
  }, [scrollRef]);

  // ── Controller init ──────────────────────────────────────────────────────────
  const initController = useCallback((IFrameAPI) => {
    if (!embedRef.current) {
      setStatus('error');
      return;
    }
    if (!spotifyTrackId) {
      setStatus('error');
      return;
    }
    // Guard: don't create a second controller
    if (controllerRef.current) return;

    IFrameAPI.createController(
      embedRef.current,
      { uri: `spotify:track:${spotifyTrackId}`, width: '100%', height: '80' },
      (controller) => {
        controllerRef.current = controller;

        controller.addListener('playback_update', (e) => {
          const { position, isPaused } = e.data;
          onPositionUpdate(position);
          setStatus(isPaused ? 'paused' : 'playing');
        });

        setStatus('ready');
      }
    );
  }, [spotifyTrackId, onPositionUpdate]);

  // ── Callback ref for embed container ─────────────────────────────────────────
  // We use a ref-of-ref pattern: when the div mounts, fire initController immediately.
  // This avoids a second render cycle and the timing gap it creates.
  const [embedReady, setEmbedReady] = useState(false);

  const setEmbedRef = useCallback((node) => {
    embedRef.current = node;
    if (node) setEmbedReady(true);
    else setEmbedReady(false);
  }, []);

  useEffect(() => {
    if (!embedReady || controllerRef.current) return;
    ensureSpotifyScript(initController);
  }, [embedReady, initController]);

  // ── activate ─────────────────────────────────────────────────────────────────
  const activate = useCallback(async () => {
    if (status !== 'idle' && status !== 'error') return;
    setStatus('loading');
    lastIdxRef.current = -1;
    controllerRef.current = null; // allow re-init on re-activate after error

    const lrcLines = await fetchSyncedLyrics(song.artist, song.title);

    if (!lrcLines || lrcLines.length === 0) {
      setStatus('no-lyrics');
      return;
    }

    lrcLinesRef.current = lrcLines;
    lineMapRef.current  = buildLineMap(lrcLines, sectionsRef.current);
    // The embed div will mount (showEmbed → true), triggering setEmbedRef → ensureSpotifyScript
  }, [status, song.artist, song.title]);

  // ── Controls ─────────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    controllerRef.current?.togglePlay();
  }, []);

  const deactivate = useCallback(() => {
    controllerRef.current?.pause();
    controllerRef.current = null;
    lrcLinesRef.current   = [];
    lineMapRef.current    = [];
    lastIdxRef.current    = -1;
    setActiveKey(null);
    setEmbedReady(false);
    setStatus('idle');
  }, []);

  const showEmbed = status !== 'idle';

  return {
    status,
    activeKey,
    showEmbed,
    setEmbedRef,
    activate,
    togglePlay,
    deactivate,
  };
}
