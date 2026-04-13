/**
 * Song data — sourced from fretly-scraper (Spotify + Ultimate Guitar + Songsterr).
 * Scraped via: fretly-scraper/scraper.py → scraped_songs.json
 *
 * Chord "known" status is based on a beginner-intermediate user profile.
 * Known basics: G, C, D, Em, Am, E, A, F, Dm, Bm, Em7, Cadd9
 */
import raw from './scraped_songs.json';

// Chords a typical beginner-intermediate guitarist knows
const KNOWN_CHORDS = new Set([
  'G','C','D','Em','Am','E','A','F','Dm','Bm','B',
  'Em7','Cadd9','G/B','Am7','D7','E7','A7',
]);

function isKnown(chord) {
  return KNOWN_CHORDS.has(chord);
}

// Map UG difficulty label + guitar_fit → tag pill
function deriveTag(s) {
  const diff = s.difficulty_score ?? 0.18;
  if (diff < 0.18) return { tag: 'comfort', tagLabel: 'Play it today' };
  if (diff < 0.20) return { tag: 'stretch', tagLabel: 'Almost there' };
  return { tag: 'stretch', tagLabel: 'Weekend goal' };
}

// Fallback gradient palettes per song id (visual warmth while art loads)
const PALETTES = {
  1:  { from: '#0D0D14', via: '#1A1530', to: '#0A0E1A', accent: '#6B5CE7' }, // Fast Car
  2:  { from: '#0F1318', via: '#1B2240', to: '#111827', accent: '#EF9F27' }, // Wonderwall
  3:  { from: '#0F1318', via: '#1A1F2E', to: '#0D1117', accent: '#8B84B0' }, // Wish You Were Here
  4:  { from: '#14100A', via: '#241A0F', to: '#0E0B07', accent: '#EF9F27' }, // Levels
  5:  { from: '#0C1007', via: '#1A2412', to: '#0E1508', accent: '#78A86A' }, // Blackbird
  6:  { from: '#100C07', via: '#1E180E', to: '#0D0A05', accent: '#C8A85A' }, // Country Roads
  7:  { from: '#0A0E14', via: '#14181F', to: '#08090E', accent: '#6B5CE7' }, // Hotel California
  8:  { from: '#0A0A1A', via: '#12122A', to: '#08081A', accent: '#9B6EF0' }, // Blinding Lights
};

const GENRES = {
  1: ['Folk', 'Soul', 'Classic'],
  2: ['Britpop', 'Indie', 'Rock'],
  3: ['Classic Rock', 'Psychedelic'],
  4: ['Electronic', 'Dance'],
  5: ['Classic Rock', 'Folk', 'Acoustic'],
  6: ['Country', 'Folk', 'Classic'],
  7: ['Classic Rock', 'Country Rock'],
  8: ['Pop', 'Synth-pop', 'R&B'],
};

function buildWhyThis(s, lockedCount) {
  const locked = lockedCount === 0
    ? 'All chords unlocked'
    : `${lockedCount} chord${lockedCount !== 1 ? 's' : ''} to unlock`;
  const fit = s.guitar_fit >= 0.5 ? 'Perfect guitar fit' : 'Great match for your level';
  return `${locked} • ${fit}`;
}

export const mockSongs = raw.map(s => {
  const palette   = PALETTES[s.id] ?? PALETTES[1];
  const rawChords = (s.chords_list ?? []).slice(0, 8);
  const chords    = rawChords.map(name => ({ name, known: isKnown(name) }));
  const known     = chords.filter(c => c.known).length;
  const total     = chords.length || 1;
  const readiness = Math.round((known / total) * 100);
  const { tag, tagLabel } = deriveTag(s);

  return {
    // Identity
    id:      `song-${s.id}`,
    dbId:    s.id,
    title:   s.song_title,
    artist:  s.artist_name,
    album:   '',
    duration: '',

    // Album art (real + fallback gradient)
    albumArt: {
      url300:  s.art_300,
      url640:  s.art_640,
      ...palette,
    },

    // Readiness
    chords,
    readinessScore: readiness,
    tag,
    tagLabel,
    whyThis: buildWhyThis(s, total - known),
    genres:  GENRES[s.id] ?? [],

    // Scraper metadata (used by TabView)
    tuning:          s.tuning || 'E Standard',
    capo:            s.capo ?? 0,
    difficulty:      s.difficulty || 'intermediate',
    guitar_fit:      s.guitar_fit,
    difficulty_score: s.difficulty_score,
    tab_url:         s.ug_tab_url,
    tab_type:        s.tab_type,
    rating:          s.rating,
    votes:           s.votes,
    tabContent:      s.tab_content || '',
  };
});

export const currentUser = {
  name: 'Alex',
  shufflesLeft: 3,
  totalShuffles: 3,
};
