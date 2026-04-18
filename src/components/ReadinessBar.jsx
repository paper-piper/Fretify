import { motion } from 'framer-motion';

/**
 * ReadinessBar — the most important UI element in Fretly.
 *
 * Shows how close the user is to being able to play this song.
 * - Filled segments: known chords (primary purple)
 * - Gold segment: the "almost there" gap — next chord to unlock
 * - Empty segments: still locked
 *
 * The score emotionally transforms "too hard" → "almost mine."
 */
export default function ReadinessBar({ score = 0, chords = [], className = '' }) {
  const knownCount = chords.filter(c => c.known).length;
  const totalCount = chords.length;
  const isComplete = score >= 100;

  return (
    <div className={`${className}`}>
      {/* Label row */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-dm text-ui-xs text-text-secondary uppercase tracking-widest">
          Readiness
        </span>
        <span
          className={`font-syne font-bold text-ui-sm ${
            isComplete ? 'text-accent' : 'text-text-primary'
          }`}
        >
          {knownCount}/{totalCount} chords
        </span>
      </div>

      {/* Bar track */}
      <div
        className="relative h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Readiness: ${score}%`}
      >
        {/* Known portion — primary purple */}
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{ backgroundColor: '#6B5CE7' }}
          initial={{ width: 0 }}
          animate={{ width: `${(knownCount / totalCount) * 100}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
        />

        {/* Next-chord-to-unlock gold shimmer — only if not complete */}
        {!isComplete && (
          <motion.div
            className="absolute top-0 h-full rounded-full readiness-shimmer"
            style={{
              left: `${(knownCount / totalCount) * 100}%`,
              width: `${(1 / totalCount) * 100}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          />
        )}
      </div>

      {/* Chord pips */}
      <div className="flex gap-1.5 mt-3 flex-wrap">
        {chords.map((chord, i) => (
          <motion.div
            key={chord.name}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
            className={`
              px-2.5 py-1 rounded-full font-dm font-medium text-ui-xs border
              ${chord.known
                ? 'bg-secondary text-text-primary border-transparent'
                : 'bg-accent-muted text-accent border-accent/30'
              }
            `}
          >
            {chord.name}
            {!chord.known && (
              <span className="ml-1 text-[10px] opacity-70">new</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
