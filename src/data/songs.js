/**
 * Mock song data for Fretly Daily Song screen.
 * Each entry mirrors what the recommendation engine would return.
 *
 * Fields:
 *  id             – unique key
 *  title          – song title (displayed in Syne Bold)
 *  artist         – artist name (displayed in DM Sans secondary)
 *  album          – album name
 *  albumArt       – gradient palette for the blurred background texture
 *                   (real app: Spotify album art URL)
 *  duration       – song length string
 *  chords         – array of chord objects: { name, known: bool }
 *  readinessScore – 0-100 how close the user is (drives readiness bar)
 *  tag            – 'comfort' | 'stretch'
 *  tagLabel       – human label for the tag
 *  whyThis        – personalised reason line from the engine
 *  genres         – taste tags shown on card
 */

export const mockSongs = [
  {
    id: 'song-1',
    title: 'Fade To Black',
    artist: 'Metallica',
    album: 'Ride the Lightning',
    albumArt: {
      // Black/steel palette, moody
      from: '#0D0D14',
      via: '#1A1530',
      to: '#0A0E1A',
      accent: '#6B5CE7',
    },
    duration: '6:57',
    chords: [
      { name: 'Bm', known: true },
      { name: 'G', known: true },
      { name: 'D', known: true },
      { name: 'A', known: true },
      { name: 'F#m', known: false },
      { name: 'E', known: true },
    ],
    readinessScore: 83,
    tag: 'stretch',
    tagLabel: 'Almost there',
    whyThis: '1 new chord to unlock • Matches your metal taste',
    genres: ['Metal', 'Rock', 'Classic'],
  },
  {
    id: 'song-2',
    title: 'Wonderwall',
    artist: 'Oasis',
    album: '(What\'s the Story) Morning Glory?',
    albumArt: {
      from: '#0F1318',
      via: '#1B2240',
      to: '#111827',
      accent: '#EF9F27',
    },
    duration: '4:18',
    chords: [
      { name: 'Em7', known: true },
      { name: 'G', known: true },
      { name: 'Dsus4', known: true },
      { name: 'A7sus4', known: true },
      { name: 'Cadd9', known: true },
    ],
    readinessScore: 100,
    tag: 'comfort',
    tagLabel: 'Play it today',
    whyThis: 'All chords unlocked • Matches your indie taste',
    genres: ['Indie', 'Britpop', 'Classic'],
  },
  {
    id: 'song-3',
    title: 'Blackbird',
    artist: 'The Beatles',
    album: 'The Beatles (White Album)',
    albumArt: {
      from: '#0C1007',
      via: '#1A2412',
      to: '#0E1508',
      accent: '#78A86A',
    },
    duration: '2:18',
    chords: [
      { name: 'G', known: true },
      { name: 'Am', known: true },
      { name: 'G/B', known: false },
      { name: 'C', known: true },
      { name: 'A7', known: false },
      { name: 'D7', known: true },
    ],
    readinessScore: 67,
    tag: 'stretch',
    tagLabel: 'Weekend goal',
    whyThis: '2 new chords to unlock • Fingerpicking gem',
    genres: ['Classic Rock', 'Folk', 'Acoustic'],
  },
];

export const currentUser = {
  name: 'Alex',
  shufflesLeft: 3,
  totalShuffles: 3,
};
