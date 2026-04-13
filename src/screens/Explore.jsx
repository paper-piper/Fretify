import { motion } from 'framer-motion';

/**
 * Explore — Page 2.
 *
 * "Emotion: curiosity and browsing. Wandering, not being told."
 * "Organized by mood/moment, not alphabetically"
 * "Do NOT call this Library — sounds passive and archive-like"
 * — Fretly Brand Brief
 *
 * This is a placeholder shell with branded empty-state design.
 * Full implementation would include Spotify-sourced song grid,
 * skill/mood filters, and infinite scroll.
 */

const categories = [
  { id: 'easy-wins', label: 'Easy wins', icon: 'check', count: 12, color: '#6B5CE7' },
  { id: 'weekend-challenge', label: 'Weekend challenge', icon: 'bolt', count: 8, color: '#EF9F27' },
  { id: 'like-yours', label: 'Songs like yours', icon: 'sparkle', count: 24, color: '#6B5CE7' },
  { id: 'new-territory', label: 'New territory', icon: 'compass', count: 6, color: '#8B84B0' },
];

function CategoryIcon({ type }) {
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (type === 'check') return <svg {...props}><polyline points="20 6 9 17 4 12" /></svg>;
  if (type === 'bolt') return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
  if (type === 'sparkle') return <svg {...props}><path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" /></svg>;
  if (type === 'compass') return <svg {...props}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>;
  return null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Explore() {
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
          Explore
        </h1>
        <p className="font-dm text-ui-sm text-text-secondary mt-1">
          Songs picked for your taste and level
        </p>
      </motion.div>

      {/* Search bar */}
      <div className="flex-shrink-0 px-5 mb-5">
        <div
          className="flex items-center gap-3 px-4 h-11 rounded-2xl"
          style={{ background: '#1E1B30', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B84B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="font-dm text-ui-sm text-text-tertiary">Search songs, artists…</span>
        </div>
      </div>

      {/* Category rows */}
      <motion.div
        className="flex-1 px-5 pb-4 space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            variants={itemVariants}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              background: '#1E1B30',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            aria-label={`Browse ${cat.label}`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${cat.color}18`, color: cat.color }}
              >
                <CategoryIcon type={cat.icon} />
              </div>
              <div>
                <p className="font-dm font-medium text-ui-md text-text-primary">
                  {cat.label}
                </p>
                <p className="font-dm text-ui-xs text-text-secondary mt-0.5">
                  {cat.count} songs
                </p>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3D3860" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </motion.button>
        ))}

        {/* Coming soon callout */}
        <motion.div
          variants={itemVariants}
          className="mt-6 px-4 py-4 rounded-2xl text-center"
          style={{
            background: 'rgba(107,92,231,0.08)',
            border: '1px solid rgba(107,92,231,0.2)',
          }}
        >
          <p className="font-syne font-bold text-ui-sm text-primary mb-1">
            More coming soon
          </p>
          <p className="font-dm text-ui-xs text-text-secondary">
            Full Explore grid — filtered by mood, skill, and taste
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
