// ─── Mix definitions ──────────────────────────────────────────────────────────

export const MIX_DEFINITIONS = [
  // ── Acoustic / general ───────────────────────────────────────────────────
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
    genres: ['indie', 'dream pop', 'lo-fi', 'shoegaze', 'chillwave', 'ambient', 'trip-hop', 'downtempo', 'alternative'],
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
    genres: ['pop', 'indie pop', 'folk', 'indie folk', 'country', 'singer-songwriter', 'soft rock', 'adult contemporary'],
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
    genres: ['folk', 'acoustic', 'country', 'americana', 'bluegrass', 'folk rock', 'singer-songwriter', 'country rock'],
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
    genres: ['lo-fi', 'chill', 'easy listening', 'soft rock', 'acoustic', 'indie pop', 'bedroom pop'],
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
    genres: ['sad', 'emo', 'post-rock', 'shoegaze', 'slowcore', 'indie', 'melancholic', 'chamber pop', 'alternative'],
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
    genres: ['pop', 'dance pop', 'funk', 'soul', 'r&b', 'disco', 'happy', 'upbeat', 'pop rock'],
  },
  // ── Electric guitar ──────────────────────────────────────────────────────
  {
    id: 'riff-vault',
    name: 'Riff Vault',
    subtitle: 'Iconic riffs, cranked up',
    guitarType: 'electric',
    gradient: 'linear-gradient(145deg, #2A0010 0%, #200010 60%, #0F0008 100%)',
    accentColor: '#FF4466',
    textColor: '#FFB3C0',
    pattern: 'repeating-linear-gradient(0deg, rgba(255,68,102,0.22) 0px, rgba(255,68,102,0.22) 1px, transparent 1px, transparent 11px)',
    genres: ['rock', 'classic rock', 'hard rock', 'alternative rock', 'grunge', 'garage rock', 'rock and roll'],
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
    genres: ['punk', 'pop punk', 'punk rock', 'hardcore', 'post-punk', 'alternative', 'emo', 'skate punk'],
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
    genres: ['blues', 'soul', 'jazz', 'r&b', 'funk', 'blues rock', 'neo-soul', 'southern rock', 'rhythm and blues'],
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
    genres: ['metal', 'heavy metal', 'thrash metal', 'progressive metal', 'hard rock', 'prog rock', 'shred', 'death metal', 'metalcore'],
  },
];

// ─── Genre-based mix scoring ──────────────────────────────────────────────────

function scoreTrackForMix(track, mixDef) {
  const trackGenres = (track.genres ?? []).map(g => g.toLowerCase());
  const mixGenres   = mixDef.genres.map(g => g.toLowerCase());

  let matches = 0;
  for (const tg of trackGenres) {
    for (const mg of mixGenres) {
      if (tg.includes(mg) || mg.includes(tg)) { matches++; break; }
    }
  }

  const genreScore = Math.min(1, matches / 2); // 2 genre matches = full score
  const favBonus   = track.isFavoriteArtist ? 0.25 : 0;
  const popScore   = ((track.popularity ?? 50) / 100) * 0.1;

  return Math.min(1, genreScore + favBonus + popScore);
}

// ─── Chord derivation ─────────────────────────────────────────────────────────

const KNOWN_CHORDS = new Set([
  'G','C','D','Em','Am','E','A','F','Dm','Bm','B',
  'Em7','Cadd9','G/B','Am7','D7','E7','A7',
]);

const MAJOR_CHORDS = [
  ['C','Am','F','G','Em','Dm'],     // 0 C
  ['Db','Bbm','Gb','Ab','Fm','Eb'], // 1 Db
  ['D','Bm','G','A','F#m','Em'],    // 2 D
  ['Eb','Cm','Ab','Bb','Gm','Fm'],  // 3 Eb
  ['E','C#m','A','B','G#m','F#m'],  // 4 E
  ['F','Dm','Bb','C','Am','Gm'],    // 5 F
  ['F#','D#m','B','C#','A#m','G#m'],// 6 F#
  ['G','Em','C','D','Bm','Am'],     // 7 G
  ['Ab','Fm','Db','Eb','Cm','Bbm'], // 8 Ab
  ['A','F#m','D','E','C#m','Bm'],   // 9 A
  ['Bb','Gm','Eb','F','Dm','Cm'],   // 10 Bb
  ['B','G#m','E','F#','D#m','C#m'], // 11 B
];

const MINOR_CHORDS = [
  ['Am','C','Dm','Em','F','G'],     // 0
  ['Bbm','Db','Ebm','Fm','Gb','Ab'],// 1
  ['Bm','D','Em','F#m','G','A'],    // 2
  ['Cm','Eb','Fm','Gm','Ab','Bb'],  // 3
  ['C#m','E','F#m','G#m','A','B'],  // 4
  ['Dm','F','Gm','Am','Bb','C'],    // 5
  ['D#m','F#','G#m','A#m','B','C#'],// 6
  ['Em','G','Am','Bm','C','D'],     // 7
  ['Fm','Ab','Bbm','Cm','Db','Eb'], // 8
  ['F#m','A','Bm','C#m','D','E'],   // 9
  ['Gm','Bb','Cm','Dm','Eb','F'],   // 10
  ['G#m','B','C#m','D#m','E','F#'], // 11
];

// Minor-leaning genres (everything else defaults to major)
const MINOR_GENRES = new Set([
  'metal','blues','emo','sad','post-rock','shoegaze','alternative','grunge',
  'punk','hardcore','trip-hop','gothic','dark','doom','indie',
]);

function strHash(s) {
  let h = 0;
  for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function deriveChordsFromTrack(track) {
  const key  = strHash(track.id) % 12;
  const isMinor = (track.genres ?? []).some(g => [...MINOR_GENRES].some(m => g.toLowerCase().includes(m)));
  const mode = isMinor ? 0 : 1;
  const pool = (mode === 1 ? MAJOR_CHORDS : MINOR_CHORDS)[key];
  return pool.slice(0, 5).map(name => ({ name, known: KNOWN_CHORDS.has(name) }));
}

// ─── Readiness score ──────────────────────────────────────────────────────────

const HARD_GENRES = new Set(['metal','shred','progressive','hardcore','thrash','death']);
const EASY_GENRES = new Set(['pop','folk','country','acoustic','easy','soft','lo-fi','bedroom']);

export function deriveReadiness(chords, track, userLevel) {
  const known = chords.filter(c => c.known).length;
  const base  = Math.round((known / (chords.length || 1)) * 100);

  const genres    = (track.genres ?? []).map(g => g.toLowerCase());
  const hardBonus = genres.some(g => [...HARD_GENRES].some(h => g.includes(h))) ? -15 : 0;
  const easyBonus = genres.some(g => [...EASY_GENRES].some(e => g.includes(e))) ?  10 : 0;
  const levelMult = userLevel === 'advanced' ? 1.15 : userLevel === 'intermediate' ? 1.0 : 0.88;

  return Math.min(100, Math.max(5, Math.round((base + hardBonus + easyBonus) * levelMult)));
}

// ─── Build song object from a Spotify track ───────────────────────────────────

function artColors(track) {
  const hue  = strHash(track.artist ?? '') % 360;
  return { from: `hsl(${hue},40%,8%)`, to: `hsl(${hue},30%,14%)`, accent: `hsl(${hue},70%,60%)` };
}

export function buildSongFromTrack(track, userLevel) {
  const chords    = deriveChordsFromTrack(track);
  const readiness = deriveReadiness(chords, track, userLevel);
  const colors    = artColors(track);
  const locked    = chords.filter(c => !c.known).length;

  return {
    id:             `spotify-${track.id}`,
    spotifyId:      track.id,
    spotifyTrackId: track.id,
    title:          track.name,
    artist:         track.artist,
    album:          track.album,
    albumArt: {
      url300: track.art300,
      url640: track.art640,
      ...colors,
    },
    chords,
    readinessScore: readiness,
    tag:      readiness >= 70 ? 'comfort' : 'stretch',
    tagLabel: readiness >= 70 ? 'Play it today' : readiness >= 45 ? 'Almost there' : 'Weekend goal',
    whyThis:  locked === 0
      ? 'All chords unlocked • Matched to your taste'
      : `${locked} chord${locked !== 1 ? 's' : ''} to unlock • Matched to your taste`,
    genres:        track.genres ?? [],
    tuning:        'E Standard',
    capo:          0,
    difficulty:    readiness >= 70 ? 'novice' : readiness >= 45 ? 'intermediate' : 'advanced',
    tabContent:    '',
    tab_url: `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(track.name + ' ' + track.artist)}`,
    isSpotifyOnly: true,
  };
}

// ─── Main builder ─────────────────────────────────────────────────────────────

const MIN_SCORE = 0.2; // tracks below this are excluded from a mix

export function buildMixes(tracks, userLevel = 'beginner') {
  if (!tracks?.length) return MIX_DEFINITIONS.map(m => ({ ...m, songs: [] }));

  const scored = tracks.map(track => ({
    song:   buildSongFromTrack(track, userLevel),
    scores: Object.fromEntries(MIX_DEFINITIONS.map(m => [m.id, scoreTrackForMix(track, m)])),
  }));

  return MIX_DEFINITIONS.map(mixDef => {
    const eligible = scored
      .filter(s => s.scores[mixDef.id] >= MIN_SCORE)
      .slice(0, 10); // cap at 10 before sorting

    if (!eligible.length) return { ...mixDef, songs: [] };

    // Best match stays pinned at top
    eligible.sort((a, b) => b.scores[mixDef.id] - a.scores[mixDef.id]);
    const [best, ...rest] = eligible;

    // Weighted shuffle for the rest: higher score → likely closer to top, but not strict
    const shuffled = rest
      .map(s => ({ s, key: s.scores[mixDef.id] + Math.random() * 0.25 }))
      .sort((a, b) => b.key - a.key)
      .map(({ s }) => s);

    const songs = [best, ...shuffled].map((s, i) => ({
      ...s.song,
      isTopMatch: i === 0,
    }));

    return { ...mixDef, songs };
  });
}
