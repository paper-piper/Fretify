import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockSongs } from '../data/songs';

/**
 * Explore — Page 2.
 *
 * "Emotion: curiosity and browsing. Wandering, not being told."
 * Spotify-style auto-generated mixes, each with a distinct vibe.
 */

const MIXES = [
  {
    id: 'midnight-drive',
    name: 'Midnight Drive',
    subtitle: 'Late nights & open roads',
    gradient: 'linear-gradient(145deg, #1B0645 0%, #0D1B4B 60%, #091528 100%)',
    accentColor: '#9B6EF0',
    textColor: '#E2D1FF',
    songIds: ['song-7', 'song-3', 'song-8'],
    // Dot grid
    pattern: 'radial-gradient(circle, rgba(155,110,240,0.35) 1.5px, transparent 1.5px)',
    patternSize: '22px 22px',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    subtitle: 'Warm and feels like home',
    gradient: 'linear-gradient(145deg, #3D1F00 0%, #5C2E00 60%, #1A1000 100%)',
    accentColor: '#EF9F27',
    textColor: '#FFE09A',
    songIds: ['song-1', 'song-6', 'song-2'],
    // 45° diagonal lines
    pattern: 'repeating-linear-gradient(45deg, rgba(239,159,39,0.22) 0px, rgba(239,159,39,0.22) 1px, transparent 1px, transparent 13px)',
    patternSize: undefined,
  },
  {
    id: 'electric-pulse',
    name: 'Electric Pulse',
    subtitle: 'Modern beats, guitar soul',
    gradient: 'linear-gradient(145deg, #22004A 0%, #0E0030 60%, #180040 100%)',
    accentColor: '#FF6BC8',
    textColor: '#FFB3E6',
    songIds: ['song-4', 'song-8', 'song-1'],
    // Dense small dots
    pattern: 'radial-gradient(circle, rgba(255,107,200,0.4) 1px, transparent 1px)',
    patternSize: '14px 14px',
  },
  {
    id: 'campfire-sessions',
    name: 'Campfire Sessions',
    subtitle: 'Acoustic vibes & real stories',
    gradient: 'linear-gradient(145deg, #2A1200 0%, #1E1508 60%, #160E00 100%)',
    accentColor: '#FF7A3D',
    textColor: '#FFCFA0',
    songIds: ['song-5', 'song-6', 'song-1'],
    // Larger spaced dots
    pattern: 'radial-gradient(circle, rgba(255,122,61,0.32) 2px, transparent 2px)',
    patternSize: '28px 28px',
  },
  {
    id: 'rock-hall',
    name: 'Rock Hall',
    subtitle: 'Legends that never get old',
    gradient: 'linear-gradient(145deg, #2A0010 0%, #200010 60%, #0F0008 100%)',
    accentColor: '#FF4466',
    textColor: '#FFB3C0',
    songIds: ['song-7', 'song-3', 'song-5'],
    // Horizontal lines
    pattern: 'repeating-linear-gradient(0deg, rgba(255,68,102,0.22) 0px, rgba(255,68,102,0.22) 1px, transparent 1px, transparent 11px)',
    patternSize: undefined,
  },
  {
    id: 'easy-sunday',
    name: 'Easy Sunday',
    subtitle: 'Low effort, high feeling',
    gradient: 'linear-gradient(145deg, #002A1A 0%, #001C12 60%, #001008 100%)',
    accentColor: '#4ADE80',
    textColor: '#BBFFD0',
    songIds: ['song-2', 'song-6', 'song-1'],
    // Offset checkerboard dots
    pattern: 'radial-gradient(circle, rgba(74,222,128,0.28) 1.5px, transparent 1.5px), radial-gradient(circle, rgba(74,222,128,0.16) 1px, transparent 1px)',
    patternSize: '20px 20px',
    patternPos: '0 0, 10px 10px',
  },
];

// Small song preview thumbnails
function AlbumStack({ songs, accentColor }) {
  const preview = songs.slice(0, 3);
  return (
    <div className="flex items-center gap-1 mt-2">
      {preview.map((song, i) => (
        <div
          key={song.id}
          className="w-7 h-7 rounded-md flex-shrink-0 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${song.albumArt.from}, ${song.albumArt.to})`,
            boxShadow: i === 0 ? `0 0 8px ${accentColor}40` : 'none',
          }}
        >
          {song.albumArt.url300 && (
            <img src={song.albumArt.url300} alt="" className="w-full h-full object-cover" loading="lazy" />
          )}
        </div>
      ))}
      {songs.length > 3 && (
        <span className="font-dm text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          +{songs.length - 3}
        </span>
      )}
    </div>
  );
}

function MixCard({ mix, songs, onPress, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.06 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onPress(mix)}
      className="relative overflow-hidden rounded-2xl cursor-pointer text-left focus:outline-none focus-visible:ring-2"
      style={{
        background: mix.gradient,
        border: `1px solid ${mix.accentColor}25`,
        aspectRatio: '1 / 1',
      }}
      aria-label={`Open ${mix.name} playlist`}
    >
      {/* CSS geometric pattern — unique per mix */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: mix.pattern,
          backgroundSize: mix.patternSize || '20px 20px',
          backgroundPosition: mix.patternPos || '0 0',
          opacity: 1,
        }}
      />

      {/* Radial accent glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 75% 25%, ${mix.accentColor}28 0%, transparent 55%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-3.5">
        <AlbumStack songs={songs} accentColor={mix.accentColor} />
        <p
          className="font-syne font-bold mt-2 leading-tight"
          style={{ color: mix.textColor, fontSize: '0.95rem', letterSpacing: '-0.02em' }}
        >
          {mix.name}
        </p>
        <p className="font-dm mt-0.5" style={{ color: `${mix.textColor}90`, fontSize: '0.7rem' }}>
          {mix.subtitle}
        </p>
      </div>

      {/* Bottom accent bar */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${mix.accentColor}80, transparent)`,
        }}
      />
    </motion.button>
  );
}

function SongRow({ song, onPress, index, accentColor }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.08 + index * 0.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onPress(song)}
      className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ background: '#1E1B30', border: '1px solid rgba(255,255,255,0.07)' }}
      aria-label={`Open tab for ${song.title} by ${song.artist}`}
    >
      <div
        className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${song.albumArt.from}, ${song.albumArt.to})` }}
      >
        {song.albumArt.url300 && (
          <img src={song.albumArt.url300} alt={`${song.title} album art`} className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-dm font-medium text-ui-md text-text-primary truncate">{song.title}</p>
        <p className="font-dm text-ui-xs text-text-secondary mt-0.5 truncate">{song.artist}</p>
      </div>
      <div
        className="flex-shrink-0 px-2 py-0.5 rounded-full"
        style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}35` }}
      >
        <span className="font-dm font-medium" style={{ fontSize: '0.65rem', color: accentColor }}>
          {song.readinessScore}%
        </span>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D3860" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </motion.button>
  );
}

function PlaylistView({ mix, songs, onBack, onSongPress }) {
  return (
    <motion.div
      key="playlist"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 36 }}
      className="flex flex-col h-full"
    >
      <div className="flex-shrink-0 px-5 pt-4 pb-5 relative overflow-hidden" style={{ background: mix.gradient }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: mix.pattern,
            backgroundSize: mix.patternSize || '20px 20px',
            backgroundPosition: mix.patternPos || '0 0',
            opacity: 0.5,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 80% 30%, ${mix.accentColor}30 0%, transparent 65%)`,
          }}
        />
        <button
          onClick={onBack}
          className="relative z-10 flex items-center gap-2 mb-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg p-1 -ml-1"
          aria-label="Back to Explore"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="font-dm text-ui-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Explore</span>
        </button>
        <div className="relative z-10">
          <p className="font-dm text-ui-xs mb-1" style={{ color: `${mix.textColor}80` }}>Auto mix</p>
          <h2 className="font-syne font-bold" style={{ fontSize: '1.6rem', letterSpacing: '-0.03em', color: mix.textColor }}>
            {mix.name}
          </h2>
          <p className="font-dm text-ui-sm mt-1" style={{ color: `${mix.textColor}80` }}>
            {mix.subtitle} · {songs.length} songs
          </p>
          <div className="mt-3 h-0.5 w-12 rounded-full" style={{ background: mix.accentColor }} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        {songs.map((song, i) => (
          <SongRow key={song.id} song={song} index={i} accentColor={mix.accentColor} onPress={onSongPress} />
        ))}
      </div>
    </motion.div>
  );
}

function MixGrid({ onMixPress }) {
  const songMap = Object.fromEntries(mockSongs.map(s => [s.id, s]));
  const mixesWithSongs = MIXES.map(mix => ({
    ...mix,
    songs: mix.songIds.map(id => songMap[id]).filter(Boolean),
  }));

  return (
    <motion.div
      key="grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      <motion.div
        className="flex-shrink-0 px-5 pt-4 pb-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1
          className="font-syne font-bold text-text-primary"
          style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)', letterSpacing: '-0.02em' }}
        >
          Explore
        </h1>
        <p className="font-dm text-ui-sm text-text-secondary mt-1">Mixes made for your taste and level</p>
      </motion.div>

      <motion.div
        className="flex-shrink-0 px-5 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <p className="font-syne font-bold text-ui-sm text-text-secondary uppercase tracking-widest" style={{ letterSpacing: '0.08em', fontSize: '0.7rem' }}>
          Made for you
        </p>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {mixesWithSongs.map((mix, i) => (
            <MixCard key={mix.id} mix={mix} songs={mix.songs} onPress={() => onMixPress(mix)} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Explore({ onSongPress }) {
  const [activeMix, setActiveMix] = useState(null);
  const songMap = Object.fromEntries(mockSongs.map(s => [s.id, s]));
  const activeMixSongs = activeMix ? activeMix.songIds.map(id => songMap[id]).filter(Boolean) : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {activeMix ? (
          <PlaylistView
            key="playlist"
            mix={activeMix}
            songs={activeMixSongs}
            onBack={() => setActiveMix(null)}
            onSongPress={onSongPress}
          />
        ) : (
          <MixGrid key="grid" onMixPress={setActiveMix} />
        )}
      </AnimatePresence>
    </div>
  );
}
