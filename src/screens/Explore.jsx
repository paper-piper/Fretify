import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getMixData } from '../lib/spotify';
import { buildMixes } from '../lib/buildMixes';

// ─── Song row ─────────────────────────────────────────────────────────────────

function AlbumStack({ songs, accentColor }) {
  return (
    <div className="flex items-center gap-1 mt-2">
      {songs.slice(0, 3).map((song, i) => (
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

function MixCard({ mix, onPress, index }) {
  const guitarBadge = mix.guitarType === 'electric' ? '⚡ Electric' : '🎸 Acoustic';
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26, delay: index * 0.06 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onPress(mix)}
      className="relative overflow-hidden rounded-2xl cursor-pointer text-left focus:outline-none focus-visible:ring-2"
      style={{ background: mix.gradient, border: `1px solid ${mix.accentColor}25`, aspectRatio: '1 / 1' }}
      aria-label={`Open ${mix.name} mix`}
    >
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: mix.pattern,
        backgroundSize: mix.patternSize || '20px 20px',
        backgroundPosition: mix.patternPos || '0 0',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 75% 25%, ${mix.accentColor}28 0%, transparent 55%)`,
      }} />
      <div className="relative z-10 flex flex-col justify-end h-full p-3.5">
        <AlbumStack songs={mix.songs} accentColor={mix.accentColor} />
        <p className="font-syne font-bold mt-2 leading-tight" style={{ color: mix.textColor, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
          {mix.name}
        </p>
        <p className="font-dm mt-0.5" style={{ color: `${mix.textColor}90`, fontSize: '0.7rem' }}>
          {mix.subtitle}
        </p>
        <div className="mt-1.5 inline-flex self-start px-1.5 py-0.5 rounded-md" style={{ background: `${mix.accentColor}20`, border: `1px solid ${mix.accentColor}35` }}>
          <span className="font-dm" style={{ fontSize: '0.6rem', color: mix.accentColor }}>{guitarBadge}</span>
        </div>
      </div>
      <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${mix.accentColor}80, transparent)` }} />
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
      style={{
        background: song.isTopMatch ? `linear-gradient(135deg, ${accentColor}18, #1E1B30)` : '#1E1B30',
        border: song.isTopMatch ? `1px solid ${accentColor}50` : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden" style={{ background: `linear-gradient(135deg, ${song.albumArt.from}, ${song.albumArt.to})` }}>
        {song.albumArt.url300 && <img src={song.albumArt.url300} alt="" className="w-full h-full object-cover" loading="lazy" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {song.isTopMatch && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-dm font-medium flex-shrink-0" style={{ fontSize: '0.58rem', background: `${accentColor}25`, color: accentColor, border: `1px solid ${accentColor}40` }}>
              ★ Best match
            </span>
          )}
        </div>
        <p className="font-dm font-medium text-ui-md text-text-primary truncate">{song.title}</p>
        <p className="font-dm text-ui-xs text-text-secondary mt-0.5 truncate">{song.artist}</p>
      </div>
      <div className="flex-shrink-0 flex flex-col items-center px-2 py-1 rounded-xl" style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}35`, minWidth: '2.8rem' }}>
        <span className="font-dm font-bold leading-none" style={{ fontSize: '0.72rem', color: accentColor }}>{song.readinessScore}%</span>
        <span className="font-dm leading-none mt-0.5" style={{ fontSize: '0.52rem', color: `${accentColor}90` }}>playable</span>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D3860" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </motion.button>
  );
}

function PlaylistView({ mix, onBack, onSongPress }) {
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
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: mix.pattern, backgroundSize: mix.patternSize || '20px 20px', backgroundPosition: mix.patternPos || '0 0', opacity: 0.5 }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 80% 30%, ${mix.accentColor}30 0%, transparent 65%)` }} />
        <button onClick={onBack} className="relative z-10 flex items-center gap-2 mb-4 cursor-pointer focus:outline-none rounded-lg p-1 -ml-1" aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          <span className="font-dm text-ui-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Explore</span>
        </button>
        <div className="relative z-10">
          <p className="font-dm text-ui-xs mb-1" style={{ color: `${mix.textColor}80` }}>
            {mix.guitarType === 'electric' ? '⚡ Electric mix' : '🎸 Acoustic mix'} · matched to your taste
          </p>
          <h2 className="font-syne font-bold" style={{ fontSize: '1.6rem', letterSpacing: '-0.03em', color: mix.textColor }}>{mix.name}</h2>
          <p className="font-dm text-ui-sm mt-1" style={{ color: `${mix.textColor}80` }}>{mix.subtitle} · {mix.songs.length} songs</p>
          <div className="mt-3 h-0.5 w-12 rounded-full" style={{ background: mix.accentColor }} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        {mix.songs.map((song, i) => (
          <SongRow key={song.id} song={song} index={i} accentColor={mix.accentColor} onPress={onSongPress} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ label }) {
  return (
    <p className="font-syne font-bold text-text-secondary uppercase tracking-widest mb-3" style={{ letterSpacing: '0.08em', fontSize: '0.7rem' }}>
      {label}
    </p>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col h-full px-5 pt-4 pb-4 gap-4">
      <div className="h-7 w-28 rounded-xl animate-pulse" style={{ background: '#2A2545' }} />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl animate-pulse" style={{ background: '#1E1B30', aspectRatio: '1/1', animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Mix grid ─────────────────────────────────────────────────────────────────

function MixGrid({ mixes, onMixPress }) {
  const acoustic = mixes.filter(m => m.guitarType === 'acoustic');
  const electric = mixes.filter(m => m.guitarType === 'electric');

  return (
    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col h-full">
      <motion.div className="flex-shrink-0 px-5 pt-4 pb-3" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="font-syne font-bold text-text-primary" style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)', letterSpacing: '-0.02em' }}>Explore</h1>
        <p className="font-dm text-ui-sm text-text-secondary mt-1">Mixes built from your Spotify taste</p>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">
        <div>
          <SectionLabel label="Acoustic picks" />
          <div className="grid grid-cols-2 gap-3">
            {acoustic.map((mix, i) => <MixCard key={mix.id} mix={mix} onPress={() => onMixPress(mix)} index={i} />)}
          </div>
        </div>
        <div>
          <SectionLabel label="Electric guitar" />
          <div className="grid grid-cols-2 gap-3">
            {electric.map((mix, i) => <MixCard key={mix.id} mix={mix} onPress={() => onMixPress(mix)} index={i} />)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function Explore({ onSongPress }) {
  const { user } = useAuth();
  const [mixes, setMixes]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [activeMix, setActiveMix] = useState(null);

  useEffect(() => {
    if (!user?.spotifyToken) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMixData(user.spotifyToken)
      .then(data => {
        if (cancelled) return;
        setMixes(buildMixes(data.tracks, user.level ?? 'beginner'));
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user?.spotifyToken, user?.level]);

  if (loading || !mixes) return <Skeleton />;

  if (error) return (
    <div className="flex flex-col h-full items-center justify-center px-6 gap-4 text-center">
      <p className="font-syne font-bold text-text-primary">Couldn't load mixes</p>
      <p className="font-dm text-ui-sm text-text-secondary">{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {activeMix ? (
          <PlaylistView key="playlist" mix={activeMix} onBack={() => setActiveMix(null)} onSongPress={onSongPress} />
        ) : (
          <MixGrid key="grid" mixes={mixes} onMixPress={setActiveMix} />
        )}
      </AnimatePresence>
    </div>
  );
}
