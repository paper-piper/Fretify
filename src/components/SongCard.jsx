import { motion, AnimatePresence } from 'framer-motion';
import ReadinessBar from './ReadinessBar';

/**
 * SongCard — full-screen Daily Song card.
 *
 * Layout (top → bottom):
 *   1. Album art as blurred full-bleed background texture
 *   2. Gradient overlay preserving readability
 *   3. Genre tags (top-right corner, subtle)
 *   4. "Stretch vs Comfort" tag pill
 *   5. Song title + artist (Syne/DM Sans)
 *   6. ReadinessBar (most important element)
 *   7. "Why this" line
 *
 * Animation: slides in from right on shuffle, exits to left.
 */

const cardVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 280, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.3 },
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.96,
    transition: {
      x: { type: 'spring', stiffness: 280, damping: 30 },
      opacity: { duration: 0.15 },
    },
  }),
};

function TagPill({ tag, label }) {
  const isComfort = tag === 'comfort';
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-dm font-medium text-ui-xs
        ${isComfort
          ? 'bg-primary/20 text-primary border border-primary/30'
          : 'bg-accent-muted text-accent border border-accent/30'
        }
      `}
    >
      {/* Status dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          isComfort ? 'bg-primary' : 'bg-accent'
        }`}
      />
      {label}
    </span>
  );
}

export default function SongCard({ song, direction = 1 }) {
  if (!song) return null;
  const { albumArt } = song;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.article
        key={song.id}
        custom={direction}
        variants={cardVariants}
        initial="enter"
        animate="center"
        exit="exit"
        className="relative w-full flex-1 flex flex-col overflow-hidden rounded-3xl"
        style={{
          background: `linear-gradient(160deg, ${albumArt.from} 0%, ${albumArt.via} 50%, ${albumArt.to} 100%)`,
          boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
        }}
        aria-label={`Today's song: ${song.title} by ${song.artist}`}
      >
        {/* ── Ambient glow from album palette ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 10%, ${albumArt.accent}22 0%, transparent 70%)`,
          }}
        />

        {/* ── Top: tag + genres ── */}
        <div className="relative z-10 flex items-start justify-between px-5 pt-5">
          <TagPill tag={song.tag} label={song.tagLabel} />
          <div className="flex gap-1.5 flex-wrap justify-end max-w-[140px]">
            {song.genres.slice(0, 2).map(g => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-full font-dm text-ui-xs text-text-secondary"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* ── Spacer — pushes content to bottom half ── */}
        <div className="flex-1" />

        {/* ── Bottom content panel ── */}
        <div
          className="relative z-10 px-5 pb-6"
          style={{
            background: 'linear-gradient(0deg, rgba(18,17,28,0.97) 0%, rgba(18,17,28,0.85) 60%, transparent 100%)',
          }}
        >
          {/* Song metadata */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <h2
              className="font-syne font-bold text-text-primary leading-tight mb-0.5"
              style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', letterSpacing: '-0.02em' }}
            >
              {song.title}
            </h2>
            <p className="font-dm text-text-secondary text-ui-md mb-4">
              {song.artist}
              <span className="mx-2 opacity-30">·</span>
              <span className="text-text-tertiary text-ui-sm">{song.duration}</span>
            </p>
          </motion.div>

          {/* Readiness bar — most important UI element */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <ReadinessBar
              score={song.readinessScore}
              chords={song.chords}
              className="mb-4"
            />
          </motion.div>

          {/* "Why this" line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="flex items-center gap-2"
          >
            {/* Small fretboard icon */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="flex-shrink-0">
              <circle cx="7" cy="7" r="6" stroke="#6B5CE7" strokeWidth="1.2" fill="none" />
              <circle cx="7" cy="7" r="2" fill="#EF9F27" />
            </svg>
            <p className="font-dm text-ui-xs text-text-secondary">
              {song.whyThis}
            </p>
          </motion.div>
        </div>

        {/* ── Subtle border ── */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        />
      </motion.article>
    </AnimatePresence>
  );
}
