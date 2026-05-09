import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SongCard from '../components/SongCard';
import { getMixData } from '../lib/spotify';
import { buildMixes } from '../lib/buildMixes';
import { mockSongs, currentUser } from '../data/songs';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return 'Still up?';
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  if (h < 21) return 'Good evening,';
  return 'Late-night session,';
}

// Deterministic daily index — same song all day, changes at midnight
function todaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

const MAX_SHUFFLES = 3;

export default function DailySong({ onSongPress }) {
  const { user } = useAuth();
  const [songPool, setSongPool] = useState(null);
  const [shufflesLeft, setShufflesLeft] = useState(MAX_SHUFFLES);
  const [shuffleOffset, setShuffleOffset] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isInitialReveal, setIsInitialReveal] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);

  // Build taste-based pool from Spotify, fall back to mockSongs
  useEffect(() => {
    if (!user?.spotifyToken) {
      setSongPool(mockSongs);
      return;
    }
    getMixData(user.spotifyToken)
      .then(data => {
        const mixes = buildMixes(data.tracks, user.level ?? 'beginner');
        const seen = new Set();
        const allSongs = [];
        for (const mix of mixes) {
          for (const song of mix.songs) {
            const key = song.spotifyId ?? song.id;
            if (!seen.has(key)) { seen.add(key); allSongs.push(song); }
          }
        }
        allSongs.sort((a, b) => b.readinessScore - a.readinessScore);
        setSongPool(allSongs.length > 0 ? allSongs : mockSongs);
      })
      .catch(() => setSongPool(mockSongs));
  }, [user?.spotifyToken, user?.level]);

  const pool = songPool ?? mockSongs;
  const baseIndex = useMemo(() => todaySeed() % pool.length, [pool.length]);
  const song = pool[(baseIndex + shuffleOffset) % pool.length];

  const handleShuffle = useCallback(() => {
    if (isShuffling || shufflesLeft <= 0) return;
    setIsShuffling(true);
    setIsInitialReveal(false);
    setDirection(1);
    setShuffleOffset(o => o + 1);
    setShufflesLeft(s => s - 1);
    setTimeout(() => setIsShuffling(false), 500);
  }, [isShuffling, shufflesLeft]);

  const isExhausted = shufflesLeft <= 0;
  const canShuffle = !isShuffling && !isExhausted;
  const displayName = user?.name ?? currentUser.name;

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Header ── */}
      <motion.header
        className="flex-shrink-0 px-5 pt-4 pb-2"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-dm text-ui-xs text-text-secondary mb-0.5">
              {getGreeting()} {displayName}
            </p>
            <h1
              className="font-syne font-bold text-text-primary leading-none"
              style={{ fontSize: 'clamp(1.125rem, 4vw, 1.375rem)', letterSpacing: '-0.02em' }}
            >
              Today&apos;s Song
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Date pill */}
            <div
              className="px-3 py-1.5 rounded-full font-dm text-ui-xs text-text-secondary"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>

            {/* Compact shuffle icon button */}
            <motion.button
              onClick={canShuffle ? handleShuffle : undefined}
              disabled={!canShuffle}
              whileTap={canShuffle ? { scale: 0.88 } : {}}
              whileHover={canShuffle ? { scale: 1.08 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative flex items-center justify-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{
                width: 40,
                height: 40,
                background: canShuffle ? 'rgba(107,92,231,0.15)' : 'rgba(255,255,255,0.04)',
                border: canShuffle ? '1px solid rgba(107,92,231,0.3)' : '1px solid rgba(255,255,255,0.06)',
                cursor: canShuffle ? 'pointer' : 'not-allowed',
              }}
              aria-label={isExhausted ? 'No shuffles remaining today' : `Shuffle — ${shufflesLeft} left today`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={canShuffle ? '#6B5CE7' : 'rgba(255,255,255,0.2)'}
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

              {/* Remaining count badge */}
              {!isExhausted && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-dm font-bold"
                  style={{ fontSize: '0.55rem', background: '#6B5CE7', color: 'white', lineHeight: 1 }}
                >
                  {shufflesLeft}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── Song Card — fills all remaining space ── */}
      <div className="flex-1 min-h-0 px-4 pb-4">
        <SongCard
          song={song}
          direction={direction}
          isReveal={isInitialReveal}
          onPress={() => onSongPress?.(song)}
          onEnterPress={() => onSongPress?.(song)}
        />
      </div>
    </div>
  );
}
