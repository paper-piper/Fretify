import { motion } from 'framer-motion';

/**
 * ShuffleButton + shuffle dots.
 *
 * The 3-shuffle limit is a deliberate brand feature:
 * "Premium feel — scarcity creates value"
 * — Fretly Brand Brief, Design Philosophy
 *
 * Dots show remaining shuffles. Button disables + dims when exhausted.
 */
export default function ShuffleButton({ shufflesLeft, totalShuffles = 3, onShuffle, disabled = false }) {
  const isExhausted = shufflesLeft <= 0;
  const canShuffle = !disabled && !isExhausted;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Shuffle dots — remaining count indicator */}
      <div className="flex items-center gap-2" aria-label={`${shufflesLeft} shuffles remaining`}>
        {Array.from({ length: totalShuffles }).map((_, i) => {
          const filled = i < shufflesLeft;
          return (
            <motion.div
              key={i}
              animate={{
                backgroundColor: filled ? '#6B5CE7' : 'rgba(255,255,255,0.12)',
                scale: filled ? 1 : 0.85,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-1.5 h-1.5 rounded-full"
            />
          );
        })}
      </div>

      {/* Shuffle button */}
      <motion.button
        onClick={canShuffle ? onShuffle : undefined}
        disabled={!canShuffle}
        whileTap={canShuffle ? { scale: 0.93 } : {}}
        whileHover={canShuffle ? { scale: 1.04 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`
          relative flex items-center justify-center gap-2.5
          w-full max-w-[260px] h-14 rounded-2xl
          font-dm font-medium text-ui-md
          transition-all duration-250
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg
          ${canShuffle
            ? 'bg-primary text-white cursor-pointer shadow-glow-primary'
            : 'bg-surface text-text-tertiary cursor-not-allowed opacity-50'
          }
        `}
        aria-label={
          isExhausted
            ? 'No shuffles remaining today'
            : `Shuffle song — ${shufflesLeft} of ${totalShuffles} remaining`
        }
      >
        {/* Shuffle icon (SVG, not emoji) */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
        </svg>

        {isExhausted ? 'Come back tomorrow' : 'Shuffle'}

        {/* Ripple effect on tap */}
        {canShuffle && (
          <motion.span
            className="absolute inset-0 rounded-2xl"
            initial={{ opacity: 0.15 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ backgroundColor: 'white' }}
          />
        )}
      </motion.button>

      {/* Contextual hint */}
      {!isExhausted && (
        <p className="font-dm text-ui-xs text-text-tertiary text-center">
          {shufflesLeft === totalShuffles
            ? `${totalShuffles} shuffles per day`
            : `${shufflesLeft} left today`
          }
        </p>
      )}
    </div>
  );
}
