import { useState, useReducer, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SongCard from '../components/SongCard';
import ShuffleButton from '../components/ShuffleButton';
import { mockSongs, currentUser } from '../data/songs';

/**
 * DailySong — Page 1.
 *
 * "Emotion: excitement and discovery. The heart of the app."
 * "One song per day, full screen, beautiful — feels like receiving a gift."
 * — Fretly Brand Brief
 *
 * State:
 *  - songIndex: which song from the pool is currently shown
 *  - shufflesLeft: decrements on each shuffle (max 3/day)
 *  - direction: +1 = forward shuffle, -1 = back (for card animation)
 */

const initialState = {
  songIndex: 0,
  shufflesLeft: currentUser.totalShuffles,
  direction: 1,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SHUFFLE': {
      if (state.shufflesLeft <= 0) return state;
      const nextIndex = (state.songIndex + 1) % mockSongs.length;
      return {
        songIndex: nextIndex,
        shufflesLeft: state.shufflesLeft - 1,
        direction: 1,
      };
    }
    default:
      return state;
  }
}

// Greeting based on time of day — "late-night practice energy"
function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return 'Still up?';
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  if (h < 21) return 'Good evening,';
  return 'Late-night session,';
}

export default function DailySong({ onSongPress }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const song = mockSongs[state.songIndex];
  const [isShuffling, setIsShuffling] = useState(false);
  // Reveal animation plays once on the very first mount of the screen
  const [isInitialReveal, setIsInitialReveal] = useState(true);

  const handleShuffle = useCallback(() => {
    if (isShuffling || state.shufflesLeft <= 0) return;
    setIsShuffling(true);
    setIsInitialReveal(false); // subsequent songs use the slide animation
    dispatch({ type: 'SHUFFLE' });
    // Debounce: prevent double-tap during animation
    setTimeout(() => setIsShuffling(false), 500);
  }, [isShuffling, state.shufflesLeft]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Header ── */}
      <motion.header
        className="flex-shrink-0 px-5 pt-4 pb-2"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-dm text-ui-xs text-text-secondary mb-0.5">
              {getGreeting()} {currentUser.name}
            </p>
            <h1
              className="font-syne font-bold text-text-primary leading-none"
              style={{ fontSize: 'clamp(1.125rem, 4vw, 1.375rem)', letterSpacing: '-0.02em' }}
            >
              Today&apos;s Song
            </h1>
          </div>

          {/* Date pill */}
          <div
            className="px-3 py-1.5 rounded-full font-dm text-ui-xs text-text-secondary"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </motion.header>

      {/* ── Song Card — flex-1, fills available space ── */}
      <div className="flex-1 min-h-0 px-4 pb-3">
        <SongCard
          song={song}
          direction={state.direction}
          isReveal={isInitialReveal}
          onPress={() => onSongPress?.(song)}
        />
      </div>

      {/* ── Shuffle area ── */}
      <motion.div
        className="flex-shrink-0 px-4 pb-4 pt-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <ShuffleButton
          shufflesLeft={state.shufflesLeft}
          totalShuffles={currentUser.totalShuffles}
          onShuffle={handleShuffle}
          disabled={isShuffling}
        />
      </motion.div>
    </div>
  );
}
