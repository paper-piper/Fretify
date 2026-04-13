import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FretlyLogo from './components/FretlyLogo';
import BottomNav from './components/BottomNav';
import DailySong from './screens/DailySong';
import Explore from './screens/Explore';
import YourSongs from './screens/YourSongs';

/**
 * App shell for Fretly.
 *
 * Mobile-first: max-width 390px, full-height with header + content + bottom nav.
 * "Late-night practice energy — dark mode first, intimate, like playing in your room."
 * — Fretly Brand Brief
 */

const screens = {
  daily: DailySong,
  explore: Explore,
  yours: YourSongs,
};

// Page-level transitions — gentle vertical slide
const pageVariants = {
  enter: (direction) => ({
    y: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
  },
  exit: (direction) => ({
    y: direction < 0 ? 20 : -20,
    opacity: 0,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  }),
};

const tabOrder = ['daily', 'explore', 'yours'];

export default function App() {
  const [activeTab, setActiveTab] = useState('daily');
  const [direction, setDirection] = useState(1);

  // Respect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    const currentIndex = tabOrder.indexOf(activeTab);
    const nextIndex = tabOrder.indexOf(tab);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setActiveTab(tab);
  };

  const CurrentScreen = screens[activeTab];

  return (
    /*
     * Outer container — centres the 390px phone viewport on desktop,
     * full bleed on actual mobile.
     */
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#0A0912' }}
    >
      {/* Phone shell */}
      <div
        className="relative flex flex-col overflow-hidden bg-bg"
        style={{
          width: '100%',
          maxWidth: '390px',
          height: '100svh',
          maxHeight: '844px',
        }}
      >
        {/* Ambient radial glow */}
        <div
          className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 100% at 50% -10%, rgba(107,92,231,0.18) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Top header bar */}
        <header
          className="relative z-20 flex-shrink-0 flex items-center justify-between px-5"
          style={{
            paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
            paddingBottom: '8px',
          }}
        >
          <FretlyLogo size={28} withWordmark />

          {/* Profile avatar placeholder */}
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ background: '#2A2545', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Profile"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B84B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </header>

        {/* Main content area */}
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
              <CurrentScreen />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom navigation */}
        <div className="relative z-20 flex-shrink-0">
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>
    </div>
  );
}
