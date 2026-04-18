/**
 * ProfileSheet — slide-up panel showing user info and sign-out.
 * Triggered by the profile button in the app header.
 */

import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LEVEL_META = {
  beginner:     { label: 'Beginner',     color: '#4ADE80', icon: '🌱' },
  intermediate: { label: 'Intermediate', color: '#EF9F27', icon: '🎸' },
  advanced:     { label: 'Advanced',     color: '#FF4466', icon: '⚡' },
};

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

export default function ProfileSheet({ onClose }) {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const lvl = LEVEL_META[user.level] ?? LEVEL_META.beginner;

  const handleSignOut = () => {
    onClose();
    signOut();
  };

  return (
    <>
      {/* Scrim */}
      <motion.div
        className="absolute inset-0 z-40 cursor-pointer"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{ background: '#1A1828', border: '1px solid rgba(255,255,255,0.08)' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 36 }}
        role="dialog"
        aria-label="Profile"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <div className="px-5 pb-8 pt-3">
          {/* Avatar + identity */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6B5CE7, #4A3DB8)' }}
            >
              <span className="font-syne font-bold text-white" style={{ fontSize: '1.2rem' }}>
                {initials(user.name)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-syne font-bold text-text-primary truncate" style={{ fontSize: '1.05rem' }}>
                {user.name}
              </p>
              <p className="font-dm text-ui-xs text-text-secondary truncate">{user.email}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 mb-6">
            <div
              className="flex-1 px-3 py-3 rounded-2xl text-center"
              style={{ background: `${lvl.color}12`, border: `1px solid ${lvl.color}25` }}
            >
              <p className="font-dm text-[10px] text-text-tertiary mb-0.5 uppercase tracking-widest">Level</p>
              <p className="font-syne font-bold" style={{ color: lvl.color, fontSize: '0.9rem' }}>{lvl.label}</p>
            </div>

            <div className="flex-1 px-3 py-3 rounded-2xl text-center" style={{ background: '#12111C', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-dm text-[10px] text-text-tertiary mb-0.5 uppercase tracking-widest">Spotify</p>
              <p className="font-syne font-bold" style={{ color: user.spotifyConnected ? '#1ED760' : '#3D3860', fontSize: '0.9rem' }}>
                {user.spotifyConnected ? 'Linked' : 'Not linked'}
              </p>
            </div>

            {user.knownChords?.length > 0 && (
              <div className="flex-1 px-3 py-3 rounded-2xl text-center" style={{ background: '#12111C', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="font-dm text-[10px] text-text-tertiary mb-0.5 uppercase tracking-widest">Chords</p>
                <p className="font-syne font-bold text-text-primary" style={{ fontSize: '0.9rem' }}>{user.knownChords.length * 2}+</p>
              </div>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full h-12 rounded-2xl font-dm font-medium text-ui-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center justify-center gap-2 transition-opacity duration-150 hover:opacity-80"
            style={{ background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.25)', color: '#FF4466' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </motion.div>
    </>
  );
}
