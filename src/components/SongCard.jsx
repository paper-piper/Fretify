import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import ReadinessBar from './ReadinessBar';

/**
 * SongCard — full-screen Daily Song card.
 *
 * Visual layers (bottom → top):
 *  1. Real album art — blurred full-bleed as atmospheric texture
 *  2. Radial vignette — darkens all edges for depth
 *  3. Sharp album art square — floating in the upper zone with shadow
 *  4. Bottom gradient panel — deep fade for text legibility
 *  5. UI content — tags, title, readiness, why-this
 *
 * Two animation modes:
 *  - isReveal=true  → cinematic 3-phase entrance (blur focus-pull → shimmer → stagger)
 *  - isReveal=false → horizontal slide on shuffle (existing behaviour)
 */

// Fixed sparkle positions — no Math.random() in render
const SPARKLES = [
  { left: '28%', top: '32%', size: 5, delay: 0.40, color: '#6B5CE7', dx: -18, dy: -48 },
  { left: '72%', top: '22%', size: 3, delay: 0.52, color: '#EF9F27', dx:  22, dy: -36 },
  { left: '82%', top: '58%', size: 4, delay: 0.44, color: '#6B5CE7', dx:  12, dy: -52 },
  { left: '18%', top: '68%', size: 3, delay: 0.36, color: '#EF9F27', dx: -22, dy: -42 },
  { left: '50%', top: '18%', size: 6, delay: 0.32, color: '#6B5CE7', dx:   6, dy: -62 },
  { left: '62%', top: '72%', size: 4, delay: 0.56, color: '#EF9F27', dx:  16, dy: -32 },
];

// Card variants — custom = { direction, isReveal }
const cardVariants = {
  enter: ({ direction, isReveal }) =>
    isReveal
      ? { opacity: 0, scale: 0.86, y: 32, filter: 'blur(18px)' }
      : { x: direction > 0 ? '100%' : '-100%', opacity: 0, scale: 0.96 },

  center: ({ isReveal }) => ({
    x: 0, y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
    transition: isReveal
      ? {
          scale:   { type: 'spring', stiffness: 150, damping: 20 },
          y:       { type: 'spring', stiffness: 150, damping: 20 },
          opacity: { duration: 0.5 },
          filter:  { duration: 0.65, delay: 0.05 },
        }
      : {
          x:       { type: 'spring', stiffness: 280, damping: 30 },
          opacity: { duration: 0.2 },
          scale:   { duration: 0.3 },
        },
  }),

  exit: ({ direction }) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0, scale: 0.96,
    transition: {
      x:       { type: 'spring', stiffness: 280, damping: 30 },
      opacity: { duration: 0.15 },
    },
  }),
};

// Content stagger
const contentContainerVariants = {
  hidden: {},
  visible: (isReveal) => ({
    transition: {
      staggerChildren: isReveal ? 0.11 : 0.07,
      delayChildren:   isReveal ? 0.42 : 0.12,
    },
  }),
};
const contentItemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.25, 1, 0.5, 1] } },
};
const topVariants = {
  hidden:  { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.28, ease: [0.25, 1, 0.5, 1] } },
};

function TagPill({ tag, label }) {
  const isComfort = tag === 'comfort';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-dm font-medium text-ui-xs
      ${isComfort
        ? 'bg-primary/20 text-primary border border-primary/30'
        : 'bg-accent-muted text-accent border border-accent/30'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isComfort ? 'bg-primary' : 'bg-accent'}`} />
      {label}
    </span>
  );
}

export default function SongCard({ song, direction = 1, isReveal = false, onPress, onEnterPress }) {
  const prefersReducedMotion = useReducedMotion();
  const [artLoaded, setArtLoaded] = useState(false);
  if (!song) return null;

  const { albumArt } = song;
  const effectiveReveal = isReveal && !prefersReducedMotion;
  const hasArt = !!albumArt.url640;

  return (
    <AnimatePresence mode="wait" custom={{ direction, isReveal: effectiveReveal }}>
      <motion.article
        key={song.id}
        custom={{ direction, isReveal: effectiveReveal }}
        variants={cardVariants}
        initial="enter"
        animate="center"
        exit="exit"
        onClick={onPress}
        className="relative w-full flex-1 flex flex-col overflow-hidden rounded-3xl h-full cursor-pointer"
        style={{
          // Fallback gradient while art loads / if no art
          background: `linear-gradient(160deg, ${albumArt.from} 0%, ${albumArt.via} 50%, ${albumArt.to} 100%)`,
          boxShadow: effectiveReveal
            ? `0 8px 48px rgba(0,0,0,0.65), 0 0 80px ${albumArt.accent}28`
            : '0 8px 48px rgba(0,0,0,0.6)',
        }}
        aria-label={`${song.title} by ${song.artist} — tap to learn`}
        role="button"
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onPress?.()}
      >
        {/* ── Layer 1: Blurred album art as atmospheric background ── */}
        {hasArt && (
          <motion.img
            src={albumArt.url640}
            alt=""
            aria-hidden="true"
            onLoad={() => setArtLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              filter: 'blur(48px) saturate(1.4) brightness(0.55)',
              transform: 'scale(1.15)', // prevent blur edge bleed
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: artLoaded ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* ── Layer 2: Radial vignette — edges go dark for depth ── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 120% 80% at 50% 50%,
                transparent 30%,
                rgba(10,9,18,0.5) 70%,
                rgba(10,9,18,0.85) 100%)
            `,
          }}
        />

        {/* ── Shimmer sweep on reveal ── */}
        {effectiveReveal && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.13) 50%, transparent 70%)',
              zIndex: 25,
            }}
            initial={{ x: '-160%' }}
            animate={{ x: '220%' }}
            transition={{ duration: 0.9, delay: 0.48, ease: [0.25, 1, 0.5, 1] }}
          />
        )}

        {/* ── Sparkle particles on reveal ── */}
        {effectiveReveal && SPARKLES.map((s, i) => (
          <motion.div
            key={i}
            aria-hidden="true"
            className="absolute rounded-full pointer-events-none"
            style={{
              width: s.size, height: s.size,
              background: `radial-gradient(circle, ${s.color} 0%, transparent 70%)`,
              left: s.left, top: s.top, zIndex: 26,
            }}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0, 1.5, 0.4], x: s.dx, y: s.dy }}
            transition={{ duration: 1.1, delay: s.delay, ease: 'easeOut' }}
          />
        ))}

        {/* ── Top: tag + genres ── */}
        <motion.div
          className="relative z-10 flex items-start justify-between px-5 pt-5"
          variants={effectiveReveal ? topVariants : undefined}
          initial={effectiveReveal ? 'hidden' : undefined}
          animate={effectiveReveal ? 'visible' : undefined}
        >
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
        </motion.div>

        {/* ── Layer 3: Sharp album art square — floating in visual center ── */}
        {hasArt && (
          <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-4">
            <motion.div
              initial={effectiveReveal ? { opacity: 0, scale: 0.88, y: 12 } : false}
              animate={{ opacity: artLoaded ? 1 : 0, scale: 1, y: 0 }}
              transition={
                effectiveReveal
                  ? { delay: 0.2, duration: 0.5, ease: [0.25, 1, 0.5, 1] }
                  : { duration: 0.4 }
              }
              className="relative"
              style={{ width: '62%', aspectRatio: '1 / 1' }}
            >
              <img
                src={albumArt.url640}
                alt={`${song.title} album art`}
                className="w-full h-full object-cover rounded-2xl"
                style={{
                  boxShadow: '0 16px 56px rgba(0,0,0,0.75), 0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              />
              {/* Subtle inner glow ring */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.12), 0 0 40px ${albumArt.accent}20`,
                }}
              />
            </motion.div>
          </div>
        )}

        {/* Spacer when no art */}
        {!hasArt && <div className="flex-1" />}

        {/* ── Bottom content panel ── */}
        <motion.div
          className="relative z-10 px-5 pb-6"
          style={{
            background: 'linear-gradient(0deg, rgba(18,17,28,0.97) 0%, rgba(18,17,28,0.88) 55%, transparent 100%)',
          }}
          variants={contentContainerVariants}
          custom={effectiveReveal}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={contentItemVariants}>
            <h2
              className="font-syne font-bold text-text-primary leading-tight mb-0.5"
              style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', letterSpacing: '-0.02em' }}
            >
              {song.title}
            </h2>
            <p className="font-dm text-text-secondary text-ui-md mb-4">
              {song.artist}
              {song.duration && (
                <>
                  <span className="mx-2 opacity-30">·</span>
                  <span className="text-text-tertiary text-ui-sm">{song.duration}</span>
                </>
              )}
            </p>
          </motion.div>

          <motion.div variants={contentItemVariants}>
            <ReadinessBar score={song.readinessScore} chords={song.chords} className="mb-4" />
          </motion.div>

          <motion.div variants={contentItemVariants} className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="flex-shrink-0">
              <circle cx="7" cy="7" r="6" stroke="#6B5CE7" strokeWidth="1.2" fill="none" />
              <circle cx="7" cy="7" r="2" fill="#EF9F27" />
            </svg>
            <p className="font-dm text-ui-xs text-text-secondary">{song.whyThis}</p>
          </motion.div>

          {onEnterPress && (
            <motion.div variants={contentItemVariants} className="mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); onEnterPress(); }}
                className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-dm font-medium text-ui-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-opacity duration-150 active:opacity-80"
                style={{ background: 'rgba(107,92,231,0.92)', color: 'white', border: '1px solid rgba(107,92,231,0.5)' }}
                aria-label={`Start playing ${song.title}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Start Playing
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Subtle border */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        />
      </motion.article>
    </AnimatePresence>
  );
}
