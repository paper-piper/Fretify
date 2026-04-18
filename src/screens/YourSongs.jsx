import { motion } from 'framer-motion';

/**
 * YourSongs — Page 3.
 *
 * "Emotion: comfort and ownership. The cozy corner of the app."
 * "List view appropriate here — you already know these songs"
 * "Calm, known, easy environment — no pressure, no discovery"
 * — Fretly Brand Brief
 */

const savedSongs = [
  {
    id: 'saved-1',
    title: 'Wonderwall',
    artist: 'Oasis',
    status: 'mastered',
    statusLabel: 'Mastered',
    color: '#6B5CE7',
    plays: 14,
  },
  {
    id: 'saved-2',
    title: 'Blackbird',
    artist: 'The Beatles',
    status: 'in-progress',
    statusLabel: 'In progress',
    color: '#EF9F27',
    plays: 6,
  },
  {
    id: 'saved-3',
    title: 'Fade To Black',
    artist: 'Metallica',
    status: 'saved',
    statusLabel: 'Want to learn',
    color: '#8B84B0',
    plays: 0,
  },
];

const statusDot = {
  mastered: '#6B5CE7',
  'in-progress': '#EF9F27',
  saved: '#3D3860',
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function YourSongs() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
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
          Your Songs
        </h1>
        <p className="font-dm text-ui-sm text-text-secondary mt-1">
          {savedSongs.length} songs
        </p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex-shrink-0 flex gap-2 px-5 mb-4 overflow-x-auto pb-1 no-scrollbar">
        {['All', 'Mastered', 'In progress', 'Saved'].map((label, i) => (
          <button
            key={label}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full font-dm text-ui-xs font-medium cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              i === 0
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            style={i !== 0 ? { background: 'rgba(255,255,255,0.06)' } : {}}
            aria-pressed={i === 0}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Song list */}
      <motion.div
        className="flex-1 px-5 pb-4 space-y-2"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {savedSongs.map((song) => (
          <motion.button
            key={song.id}
            variants={rowVariants}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              background: '#1E1B30',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            aria-label={`${song.title} by ${song.artist} — ${song.statusLabel}`}
          >
            {/* Album art placeholder */}
            <div
              className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: `${song.color}18` }}
              aria-hidden="true"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={song.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-dm font-medium text-ui-md text-text-primary truncate">
                {song.title}
              </p>
              <p className="font-dm text-ui-xs text-text-secondary mt-0.5">
                {song.artist}
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusDot[song.status] }}
              />
              <span className="font-dm text-ui-xs text-text-tertiary">
                {song.statusLabel}
              </span>
            </div>
          </motion.button>
        ))}

        {/* Chord constellation teaser — gamification light touch */}
        <motion.div
          variants={rowVariants}
          className="mt-6 px-4 py-5 rounded-2xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(107,92,231,0.1) 0%, rgba(239,159,39,0.06) 100%)',
            border: '1px solid rgba(107,92,231,0.15)',
          }}
        >
          {/* Mini constellation visual */}
          <svg width="80" height="48" viewBox="0 0 80 48" fill="none" className="mx-auto mb-3" aria-hidden="true">
            {/* Constellation lines */}
            <line x1="15" y1="35" x2="35" y2="20" stroke="#3D3860" strokeWidth="1" />
            <line x1="35" y1="20" x2="55" y2="28" stroke="#3D3860" strokeWidth="1" />
            <line x1="55" y1="28" x2="65" y2="12" stroke="#3D3860" strokeWidth="1" />
            <line x1="35" y1="20" x2="25" y2="8" stroke="#3D3860" strokeWidth="1" />
            {/* Lit nodes */}
            <circle cx="15" cy="35" r="3" fill="#6B5CE7" />
            <circle cx="35" cy="20" r="4" fill="#6B5CE7" />
            <circle cx="55" cy="28" r="3" fill="#6B5CE7" />
            {/* Unlit nodes */}
            <circle cx="65" cy="12" r="3" fill="#2A2545" />
            <circle cx="25" cy="8" r="3" fill="#2A2545" />
            {/* Gold accent */}
            <circle cx="35" cy="20" r="2" fill="#EF9F27" />
          </svg>
          <p className="font-syne font-bold text-ui-sm text-text-primary mb-1">
            Chord constellation
          </p>
          <p className="font-dm text-ui-xs text-text-secondary">
            Your musical map — coming soon
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
