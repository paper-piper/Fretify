import { motion } from 'framer-motion';

/**
 * BottomNav — 3-icon tab bar, no hamburger menus.
 * "Navigation: bottom tab bar, 3 icons only. No hamburger menus."
 * — Fretly Brand Brief
 *
 * Touch targets: min 44px (accessibility).
 */

const tabs = [
  {
    id: 'daily',
    label: 'Today',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* Guitar pick / music note shape */}
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" fill={active ? '#6B5CE7' : 'none'} />
        <circle cx="18" cy="16" r="3" fill={active ? '#6B5CE7' : 'none'} />
      </svg>
    ),
  },
  {
    id: 'explore',
    label: 'Explore',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: 'yours',
    label: 'Your Songs',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h18M3 12h18M3 18h18" />
        {active && <circle cx="19" cy="6" r="3" fill="#6B5CE7" stroke="none" />}
      </svg>
    ),
  },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav
      className="relative flex items-center justify-around pb-safe"
      style={{
        background: 'linear-gradient(0deg, #12111C 80%, rgba(18,17,28,0) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingTop: '8px',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
      }}
      aria-label="Main navigation"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] px-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Active indicator dot */}
            {isActive && (
              <motion.div
                layoutId="nav-dot"
                className="absolute -top-px left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}

            {/* Icon */}
            <motion.div
              animate={{
                color: isActive ? '#6B5CE7' : '#3D3860',
                scale: isActive ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {tab.icon(isActive)}
            </motion.div>

            {/* Label */}
            <span
              className="font-dm font-medium transition-colors duration-200"
              style={{
                fontSize: '10px',
                letterSpacing: '0.02em',
                color: isActive ? '#6B5CE7' : '#3D3860',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
