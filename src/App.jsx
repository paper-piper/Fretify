import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FretlyLogo from './components/FretlyLogo';
import BottomNav from './components/BottomNav';
import ProfileSheet from './components/ProfileSheet';
import DailySong from './screens/DailySong';
import Explore from './screens/Explore';
import YourSongs from './screens/YourSongs';
import TabView from './screens/TabView';
import AuthFlow from './screens/AuthFlow';
import { AuthProvider, useAuth } from './context/AuthContext';

/**
 * App shell for Fretify.
 *
 * Mobile-first: max-width 390px, full-height with header + content + bottom nav.
 * Auth-gated: shows AuthFlow until a user signs up or in.
 * "Late-night practice energy — dark mode first, intimate, like playing in your room."
 * — Fretly Brand Brief
 */

const screens = {
  daily:   DailySong,
  explore: Explore,
  yours:   YourSongs,
};

const pageVariants = {
  enter:  (dir) => ({ y: dir > 0 ?  20 : -20, opacity: 0 }),
  center: { y: 0, opacity: 1, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
  exit:   (dir) => ({ y: dir < 0 ?  20 : -20, opacity: 0, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }),
};

const tabOrder = ['daily', 'explore', 'yours'];

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function AppShell() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(!user);

  const [activeTab,      setActiveTab]      = useState('daily');
  const [direction,      setDirection]      = useState(1);
  const [activeSong,     setActiveSong]     = useState(null);
  const [showProfile,    setShowProfile]    = useState(false);
  const [reducedMotion,  setReducedMotion]  = useState(false);

  // When user logs out, show auth again
  useEffect(() => {
    if (!user) setShowAuth(true);
  }, [user]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    const ci = tabOrder.indexOf(activeTab);
    const ni = tabOrder.indexOf(tab);
    setDirection(ni > ci ? 1 : -1);
    setActiveTab(tab);
  };

  const CurrentScreen = screens[activeTab];

  return (
    <div
      className="overflow-hidden md:flex md:items-center md:justify-center"
      style={{ height: '100svh', background: '#0A0912' }}
    >
      {/* Phone shell */}
      <div
        className="relative flex flex-col overflow-hidden bg-bg md:max-w-[390px] md:max-h-[844px]"
        style={{ width: '100%', height: '100svh' }}
      >
        {/* Ambient radial glow */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -10%, rgba(107,92,231,0.18) 0%, transparent 70%)' }}
        />

        {/* ── Auth overlay ── */}
        <AnimatePresence>
          {showAuth && (
            <motion.div
              className="absolute inset-0 z-50"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AuthFlow onComplete={() => setShowAuth(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Top header bar ── */}
        <header
          className="relative z-20 flex-shrink-0 flex items-center justify-between px-5"
          style={{
            paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
            paddingBottom: '8px',
          }}
        >
          <FretlyLogo size={28} withWordmark />

          {/* Profile button — shows user initials when logged in */}
          <button
            onClick={() => setShowProfile(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              background: user ? 'linear-gradient(135deg, #6B5CE7, #4A3DB8)' : '#2A2545',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            aria-label={user ? `Profile — ${user.name}` : 'Profile'}
          >
            {user ? (
              <span className="font-syne font-bold text-white" style={{ fontSize: '10px' }}>
                {initials(user.name)}
              </span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B84B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </button>
        </header>

        {/* ── Main content area ── */}
        <main className="relative z-10 flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={reducedMotion ? {} : pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col"
            >
              <CurrentScreen onSongPress={setActiveSong} />
            </motion.div>
          </AnimatePresence>

          {/* TabView overlay */}
          <AnimatePresence>
            {activeSong && (
              <TabView song={activeSong} onClose={() => setActiveSong(null)} />
            )}
          </AnimatePresence>

          {/* Profile sheet */}
          <AnimatePresence>
            {showProfile && (
              <ProfileSheet onClose={() => setShowProfile(false)} />
            )}
          </AnimatePresence>
        </main>

        {/* ── Bottom navigation — hidden while TabView or ProfileSheet is open ── */}
        <AnimatePresence>
          {!activeSong && !showProfile && (
            <motion.div
              className="relative z-20 flex-shrink-0"
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            >
              <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
