// ─── Mix definitions ──────────────────────────────────────────────────────────
// targets: ideal audio-feature values (0-1, except tempo which is BPM)
// weights: how much each feature matters for this mix

export const MIX_DEFINITIONS = [
  // ── Acoustic / general ────────────────────────────────────────────────────
  {
    id: 'midnight-drive',
    name: 'Midnight Drive',
    subtitle: 'Late nights & open roads',
    guitarType: 'acoustic',
    gradient: 'linear-gradient(145deg, #1B0645 0%, #0D1B4B 60%, #091528 100%)',
    accentColor: '#9B6EF0',
    textColor: '#E2D1FF',
    pattern: 'radial-gradient(circle, rgba(155,110,240,0.35) 1.5px, transparent 1.5px)',
    patternSize: '22px 22px',
    targets: { energy: 0.35, valence: 0.2, acousticness: 0.55, danceability: 0.4, tempo: 85 },
    weights: { energy: 0.25, valence: 0.3, acousticness: 0.2, danceability: 0.1, tempo: 0.15 },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    subtitle: 'Warm and feels like home',
    guitarType: 'acoustic',
    gradient: 'linear-gradient(145deg, #3D1F00 0%, #5C2E00 60%, #1A1000 100%)',
    accentColor: '#EF9F27',
    textColor: '#FFE09A',
    pattern: 'repeating-linear-gradient(45deg, rgba(239,159,39,0.22) 0px, rgba(239,159,39,0.22) 1px, transparent 1px, transparent 13px)',
    patternSize: undefined,
    targets: { energy: 0.5, valence: 0.72, acousticness: 0.55, danceability: 0.55, tempo: 105 },
    weights: { energy: 0.15, valence: 0.4, acousticness: 0.25, danceability: 0.1, tempo: 0.1 },
  },
  {
    id: 'campfire-sessions',
    name: 'Campfire Sessions',
    subtitle: 'Acoustic vibes & real stories',
    guitarType: 'acoustic',
    gradient: 'linear-gradient(145deg, #2A1200 0%, #1E1508 60%, #160E00 100%)',
    accentColor: '#FF7A3D',
    textColor: '#FFCFA0',
    pattern: 'radial-gradient(circle, rgba(255,122,61,0.32) 2px, transparent 2px)',
    patternSize: '28px 28px',
    targets: { energy: 0.3, valence: 0.5, acousticness: 0.85, danceability: 0.35, tempo: 90 },
    weights: { energy: 0.15, valence: 0.15, acousticness: 0.5, danceability: 0.1, tempo: 0.1 },
  },
  {
    id: 'easy-sunday',
    name: 'Easy Sunday',
    subtitle: 'Low effort, high feeling',
    guitarType: 'acoustic',
    gradient: 'linear-gradient(145deg, #002A1A 0%, #001C12 60%, #001008 100%)',
    accentColor: '#4ADE80',
    textColor: '#BBFFD0',
    pattern: 'radial-gradient(circle, rgba(74,222,128,0.28) 1.5px, transparent 1.5px), radial-gradient(circle, rgba(74,222,128,0.16) 1px, transparent 1px)',
    patternSize: '20px 20px',
    patternPos: '0 0, 10px 10px',
    targets: { energy: 0.25, valence: 0.6, acousticness: 0.6, danceability: 0.45, tempo: 80 },
    weights: { energy: 0.3, valence: 0.25, acousticness: 0.2, danceability: 0.1, tempo: 0.15 },
  },
  {
    id: 'rainy-day',
    name: 'Rainy Day',
    subtitle: 'Melancholy never sounded so good',
    guitarType: 'acoustic',
    gradient: 'linear-gradient(145deg, #0A1520 0%, #0D1A2E 60%, #070D18 100%)',
    accentColor: '#60A5FA',
    textColor: '#BAD8FF',
    pattern: 'repeating-linear-gradient(90deg, rgba(96,165,250,0.12) 0px, rgba(96,165,250,0.12) 1px, transparent 1px, transparent 18px)',
    patternSize: undefined,
    targets: { energy: 0.28, valence: 0.18, acousticness: 0.65, danceability: 0.3, tempo: 78 },
    weights: { energy: 0.2, valence: 0.4, acousticness: 0.25, danceability: 0.05, tempo: 0.1 },
  },
  {
    id: 'feel-good-hits',
    name: 'Feel Good Hits',
    subtitle: 'Instant mood boost',
    guitarType: 'acoustic',
    gradient: 'linear-gradient(145deg, #2A0030 0%, #1A0025 60%, #100018 100%)',
    accentColor: '#F472B6',
    textColor: '#FBCFE8',
    pattern: 'radial-gradient(circle, rgba(244,114,182,0.3) 1.5px, transparent 1.5px)',
    patternSize: '16px 16px',
    targets: { energy: 0.65, valence: 0.82, acousticness: 0.3, danceability: 0.72, tempo: 118 },
    weights: { energy: 0.2, valence: 0.4, acousticness: 0.1, danceability: 0.2, tempo: 0.1 },
  },

  // ── Electric guitar ───────────────────────────────────────────────────────
  {
    id: 'riff-vault',
    name: 'Riff Vault',
    subtitle: 'Iconic riffs, cranked up',
    guitarType: 'electric',
    gradient: 'linear-gradient(145deg, #2A0010 0%, #200010 60%, #0F0008 100%)',
    accentColor: '#FF4466',
    textColor: '#FFB3C0',
    pattern: 'repeating-linear-gradient(0deg, rgba(255,68,102,0.22) 0px, rgba(255,68,102,0.22) 1px, transparent 1px, transparent 11px)',
    patternSize: undefined,
    targets: { energy: 0.78, valence: 0.5, acousticness: 0.1, danceability: 0.55, tempo: 130 },
    weights: { energy: 0.4, valence: 0.1, acousticness: 0.3, danceability: 0.1, tempo: 0.1 },
  },
  {
    id: 'power-chords',
    name: 'Power Chords',
    subtitle: 'Punk, alt & pure adrenaline',
    guitarType: 'electric',
    gradient: 'linear-gradient(145deg, #1A0A00 0%, #2A1000 60%, #120800 100%)',
    accentColor: '#FB923C',
    textColor: '#FED7AA',
    pattern: 'repeating-linear-gradient(135deg, rgba(251,146,60,0.2) 0px, rgba(251,146,60,0.2) 1px, transparent 1px, transparent 10px)',
    patternSize: undefined,
    targets: { energy: 0.88, valence: 0.55, acousticness: 0.05, danceability: 0.6, tempo: 150 },
    weights: { energy: 0.45, valence: 0.1, acousticness: 0.3, danceability: 0.05, tempo: 0.1 },
  },
  {
    id: 'blues-alley',
    name: 'Blues Alley',
    subtitle: 'Soul, grit & bending strings',
    guitarType: 'electric',
    gradient: 'linear-gradient(145deg, #001A2A 0%, #00111C 60%, #000A12 100%)',
    accentColor: '#38BDF8',
    textColor: '#BAE6FD',
    pattern: 'repeating-linear-gradient(45deg, rgba(56,189,248,0.15) 0px, rgba(56,189,248,0.15) 1px, transparent 1px, transparent 14px)',
    patternSize: undefined,
    targets: { energy: 0.55, valence: 0.35, acousticness: 0.2, danceability: 0.48, tempo: 95 },
    weights: { energy: 0.25, valence: 0.3, acousticness: 0.2, danceability: 0.1, tempo: 0.15 },
  },
  {
    id: 'shred-zone',
    name: 'Shred Zone',
    subtitle: 'Fast, loud & technically wild',
    guitarType: 'electric',
    gradient: 'linear-gradient(145deg, #220022 0%, #1A0028 60%, #0E0018 100%)',
    accentColor: '#C084FC',
    textColor: '#E9D5FF',
    pattern: 'radial-gradient(circle, rgba(192,132,252,0.4) 1px, transparent 1px)',
    patternSize: '12px 12px',
    targets: { energy: 0.92, valence: 0.45, acousticness: 0.04, danceability: 0.5, tempo: 168 },
    weights: { energy: 0.5, valence: 0.05, acousticness: 0.3, danceability: 0.05, tempo: 0.1 },
  },
];

// ─── Chord derivation from Spotify key + mode ─────────────────────────────────

const KNOWN_CHORDS = new Set([
  'G','C','D','Em','Am','E','A','F','Dm','Bm','B',
  'Em7','Cadd9','G/B','Am7','D7','E7','A7',
]);

const MAJOR_CHORDS = [
  ['C','Am','F','G','Em','Dm'],    // 0 C
  ['Db','Bbm','Gb','Ab','Fm','Eb'],// 1 Db
  ['D','Bm','G','A','F#m','Em'],   // 2 D
  ['Eb','Cm','Ab','Bb','Gm','Fm'], // 3 Eb
  ['E','C#m','A','B','G#m','F#m'], // 4 E
  ['F','Dm','Bb','C','Am','Gm'],   // 5 F
  ['F#','D#m','B','C#','A#m','G#m'],// 6 F#
  ['G','Em','C','D','Bm','Am'],    // 7 G
  ['Ab','Fm','Db','Eb','Cm','Bbm'],// 8 Ab
  ['A','F#m','D','E','C#m','Bm'],  // 9 A
  ['Bb','Gm','Eb','F','Dm','Cm'],  // 10 Bb
  ['B','G#m','E','F#','D#m','C#m'],// 11 B
];

const MINOR_CHORDS = [
  ['Am','C','Dm','Em','F','G'],    // 0 → A minor
  ['Bbm','Db','Ebm','Fm','Gb','Ab'],// 1
  ['Bm','D','Em','F#m','G','A'],   // 2 → B minor
  ['Cm','Eb','Fm','Gm','Ab','Bb'], // 3
  ['C#m','E','F#m','G#m','A','B'], // 4
  ['Dm','F','Gm','Am','Bb','C'],   // 5
  ['D#m','F#','G#m','A#m','B','C#'],// 6
  ['Em','G','Am','Bm','C','D'],    // 7 → E minor
  ['Fm','Ab','Bbm','Cm','Db','Eb'],// 8
  ['F#m','A','Bm','C#m','D','E'],  // 9
  ['Gm','Bb','Cm','Dm','Eb','F'],  // 10
  ['G#m','B','C#m','D#m','E','F#'],// 11
];

export function deriveChordsFromKey(key, mode) {
  const k = key ?? 7; // default G
  const pool = mode === 1 ? MAJOR_CHORDS[k] : MINOR_CHORDS[k];
  return (pool ?? MAJOR_CHORDS[7]).slice(0, 5).map(name => ({ name, known: KNOWN_CHORDS.has(name) }));
}

// ─── Guitar-friendly key bonus ────────────────────────────────────────────────

const GUITAR_FRIENDLY = new Set([0, 2, 4, 5, 7, 9, 11]); // C D E F G A B

function keyBonus(key) {
  return GUITAR_FRIENDLY.has(key) ? 8 : -8;
}

// ─── Readiness score ──────────────────────────────────────────────────────────

export function deriveReadiness(chords, features, userLevel) {
  const known = chords.filter(c => c.known).length;
  const base = Math.round((known / (chords.length || 1)) * 100);

  const tempoPenalty = (features?.tempo ?? 120) > 140 ? -12 : (features?.tempo ?? 120) < 80 ? 8 : 0;
  const kb = keyBonus(features?.key ?? 7);

  // Level multiplier: advanced users can handle harder songs
  const levelMult = userLevel === 'advanced' ? 1.15 : userLevel === 'intermediate' ? 1.0 : 0.88;

  return Math.min(100, Math.max(5, Math.round((base + tempoPenalty + kb) * levelMult)));
}

// ─── Mix scoring ──────────────────────────────────────────────────────────────

function normTempo(bpm) { return Math.min(1, Math.max(0, ((bpm ?? 120) - 60) / 140)); }

function scoreTrackForMix(features, mixDef) {
  if (!features) return 0;
  const { targets, weights } = mixDef;

  const f = {
    energy:       features.energy       ?? 0.5,
    valence:      features.valence      ?? 0.5,
    acousticness: features.acousticness ?? 0.5,
    danceability: features.danceability ?? 0.5,
    tempo:        normTempo(features.tempo),
  };
  const t = { ...targets, tempo: normTempo(targets.tempo) };

  let score = 0;
  let total = 0;
  for (const [feat, w] of Object.entries(weights)) {
    score += w * (1 - Math.min(1, Math.abs(f[feat] - t[feat]) * 1.8));
    total += w;
  }
  return score / total;
}

// ─── Build song object from a Spotify track ───────────────────────────────────

function artColors(track) {
  // Simple hash of artist name → accent hue for fallback gradient
  const hue = [...(track.artist ?? '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const from = `hsl(${hue}, 40%, 8%)`;
  const to   = `hsl(${hue}, 30%, 14%)`;
  return { from, to, accent: `hsl(${hue}, 70%, 60%)` };
}

export function buildSongFromTrack(track, userLevel) {
  const features = track.features;
  const chords   = deriveChordsFromKey(features?.key, features?.mode);
  const readiness = deriveReadiness(chords, features, userLevel);
  const colors   = artColors(track);

  const known  = chords.filter(c => c.known).length;
  const locked = chords.length - known;
  const whyThis = locked === 0
    ? 'All chords unlocked • Matched to your taste'
    : `${locked} chord${locked !== 1 ? 's' : ''} to unlock • Matched to your taste`;

  const tag      = readiness >= 70 ? 'comfort' : 'stretch';
  const tagLabel = readiness >= 70 ? 'Play it today' : readiness >= 45 ? 'Almost there' : 'Weekend goal';

  return {
    id:             `spotify-${track.id}`,
    spotifyId:      track.id,
    title:          track.name,
    artist:         track.artist,
    album:          track.album,
    albumArt: {
      url300:  track.art300,
      url640:  track.art640,
      ...colors,
    },
    chords,
    readinessScore: readiness,
    tag,
    tagLabel,
    whyThis,
    tuning:         'E Standard',
    capo:           0,
    difficulty:     readiness >= 70 ? 'novice' : readiness >= 45 ? 'intermediate' : 'advanced',
    tabContent:     '',
    tab_url: `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(track.name + ' ' + track.artist)}`,
    isSpotifyOnly:  true,
  };
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildMixes(tracks, userLevel = 'beginner') {
  if (!tracks?.length) return MIX_DEFINITIONS.map(m => ({ ...m, songs: [] }));

  // Score every track against every mix
  const scored = tracks.map(track => ({
    track,
    song: buildSongFromTrack(track, userLevel),
    scores: Object.fromEntries(
      MIX_DEFINITIONS.map(m => [m.id, scoreTrackForMix(track.features, m)])
    ),
  }));

  return MIX_DEFINITIONS.map(mixDef => {
    // Sort tracks by score for this mix, pick top 10
    const sorted = [...scored]
      .sort((a, b) => b.scores[mixDef.id] - a.scores[mixDef.id])
      .slice(0, 10);

    return {
      ...mixDef,
      songs: sorted.map(s => s.song),
    };
  });
}
