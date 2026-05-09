import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePlayAlong } from '../hooks/usePlayAlong';

/**
 * TabView — full-screen overlay for learning a song.
 *
 * Parsing pipeline:
 *  1. Split on [tab]...[/tab] blocks
 *  2. Each [tab] block → chord_lyric (chords row + lyric) or tab_block (guitar notation)
 *  3. Non-[tab] lines → section markers, chord-only lines, or plain text
 *  4. Group consecutive chord_lyric rows under a section → verse_group (single card)
 *
 * Play Along: Spotify IFrame API provides ms-accurate position via playback_update.
 *             LRCLIB provides timestamped lyrics. A line-map links LRC lines → tab rows.
 */

// ─── Parsers ──────────────────────────────────────────────────────────────────

function isTabLine(line) {
  return /^[eEBGDAd]\|/.test(line.trim());
}

function extractChords(str) {
  const result = [];
  const re = /\[ch\](.*?)\[\/ch\]/g;
  let m;
  while ((m = re.exec(str)) !== null) result.push(m[1]);
  return result;
}

function parseTabInner(inner) {
  const nonEmpty = inner.split('\n').filter(l => l.trim());
  if (!nonEmpty.length) return null;

  if (nonEmpty.some(l => isTabLine(l.trim()))) {
    return { type: 'tab_block', content: inner };
  }

  const lastLine = nonEmpty[nonEmpty.length - 1];
  const lastHasChords = /\[ch\]/.test(lastLine);

  if (!lastHasChords && nonEmpty.length > 1) {
    return {
      type: 'chord_lyric',
      rawChordLine: nonEmpty.slice(0, -1).join('\n'),
      lyric: lastLine,
    };
  } else {
    const lyricText = inner.replace(/\[ch\].*?\[\/ch\]/g, '').trim();
    return {
      type: 'chord_lyric',
      rawChordLine: nonEmpty.join('\n'),
      lyric: lyricText,
    };
  }
}

function parseTabContent(raw) {
  if (!raw) return [];

  const text = raw.replace(/\r/g, '');
  const blocks = text.split(/(\[tab\][\s\S]*?\[\/tab\])/g);
  const flat = [];

  for (const block of blocks) {
    if (block.startsWith('[tab]')) {
      const inner = block.replace(/^\[tab\]/, '').replace(/\[\/tab\]$/, '').trim();
      const parsed = parseTabInner(inner);
      if (parsed) flat.push(parsed);
    } else {
      for (const rawLine of block.split('\n')) {
        const trimmed = rawLine.trim();
        if (!trimmed) {
          flat.push({ type: 'spacer' });
        } else if (/^\[.+\]$/.test(trimmed)) {
          flat.push({ type: 'section', content: trimmed.slice(1, -1) });
        } else {
          const hasChords = /\[ch\]/.test(trimmed);
          const withoutChords = trimmed.replace(/\[ch\].*?\[\/ch\]/g, '').trim();
          const isChordLine = hasChords && withoutChords.length <= 6;
          flat.push({
            type: 'line',
            content: trimmed,
            isChordLine,
            chords: hasChords ? extractChords(trimmed) : [],
            annotation: isChordLine ? withoutChords : '',
          });
        }
      }
    }
  }

  const result = [];
  let group = null;

  for (const item of flat) {
    if (item.type === 'spacer') {
      if (!group && result.at(-1)?.type !== 'spacer') result.push(item);
      continue;
    }
    if (item.type === 'section') {
      if (group?.rows.length) result.push(group);
      group = { type: 'verse_group', label: item.content, rows: [] };
      continue;
    }
    if (item.type === 'chord_lyric') {
      if (group) { group.rows.push(item); continue; }
      result.push(item);
      continue;
    }
    if (item.type === 'line' && item.isChordLine && group) {
      group.rows.push({ type: 'chord_lyric', rawChordLine: item.content, lyric: item.annotation });
      continue;
    }
    if (group?.rows.length) result.push(group);
    group = null;
    result.push(item);
  }

  if (group?.rows.length) result.push(group);
  return result;
}

// ─── Visual components ────────────────────────────────────────────────────────

function MetaPill({ label, value }) {
  if (!value) return null;
  return (
    <div
      className="flex flex-col items-center px-4 py-2.5 rounded-2xl flex-shrink-0"
      style={{ background: '#1E1B30', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <span className="font-dm text-[10px] uppercase tracking-widest text-text-tertiary mb-0.5">{label}</span>
      <span className="font-syne font-bold text-ui-sm text-text-primary">{value}</span>
    </div>
  );
}

function ChordChip({ name }) {
  return (
    <span
      className="inline-flex items-center rounded-md font-dm font-semibold flex-shrink-0"
      style={{
        fontSize: '10px', lineHeight: '1.4', padding: '2px 7px',
        background: 'rgba(107,92,231,0.22)', border: '1px solid rgba(107,92,231,0.45)', color: '#B5AEFF',
      }}
    >
      {name}
    </span>
  );
}

function ChordLyricRow({ rawChordLine, lyric, isActive }) {
  const hasChords = rawChordLine && /\[ch\]/.test(rawChordLine);
  const parts = hasChords ? rawChordLine.split(/(\[ch\].*?\[\/ch\])/g) : [];

  return (
    <div
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        lineHeight: 1.7,
        borderRadius: 6,
        padding: isActive ? '4px 6px' : '0',
        margin: isActive ? '-4px -6px' : '0',
        background: isActive ? 'rgba(107,92,231,0.18)' : 'transparent',
        borderLeft: isActive ? '3px solid #6B5CE7' : '3px solid transparent',
        transition: 'background 0.25s, border-color 0.25s',
      }}
    >
      {hasChords ? (
        <div style={{ whiteSpace: 'pre', fontSize: '11px', overflowWrap: 'normal' }}>
          {parts.map((part, i) => {
            const m = part.match(/^\[ch\](.*?)\[\/ch\]$/);
            if (m) {
              return (
                <span
                  key={i}
                  style={{
                    color: isActive ? '#D4CAFF' : '#B5AEFF',
                    fontWeight: 700,
                    background: isActive ? 'rgba(107,92,231,0.35)' : 'rgba(107,92,231,0.2)',
                    borderRadius: '3px',
                    boxShadow: isActive
                      ? '0 0 0 1px rgba(107,92,231,0.7)'
                      : '0 0 0 1px rgba(107,92,231,0.45)',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                >
                  {m[1]}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      ) : null}
      {lyric && (
        <div style={{
          whiteSpace: 'pre-wrap', fontSize: '12px',
          color: isActive ? '#D4D0F0' : '#8B84B0',
          overflowWrap: 'break-word',
          transition: 'color 0.25s',
        }}>
          {lyric}
        </div>
      )}
    </div>
  );
}

function VerseGroup({ group, sectionIdx, activeKey }) {
  return (
    <div
      className="my-3 rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div
        className="px-4 pt-3 pb-2 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="font-syne font-bold text-primary uppercase tracking-widest" style={{ fontSize: '10px' }}>
          {group.label}
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(107,92,231,0.15)' }} />
      </div>
      <div className="px-4 py-3 space-y-3">
        {group.rows.map((row, ri) => {
          const lineKey = `${sectionIdx}-${ri}`;
          return (
            <div key={ri} data-line-key={lineKey}>
              <ChordLyricRow
                rawChordLine={row.rawChordLine}
                lyric={row.lyric}
                isActive={activeKey === lineKey}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabItem({ section, sectionIdx, activeKey }) {
  if (section.type === 'spacer') return <div className="h-2" />;

  if (section.type === 'verse_group') {
    return <VerseGroup group={section} sectionIdx={sectionIdx} activeKey={activeKey} />;
  }

  if (section.type === 'chord_lyric') {
    const lineKey = `${sectionIdx}-0`;
    return (
      <div className="py-1" data-line-key={lineKey}>
        <ChordLyricRow
          rawChordLine={section.rawChordLine}
          lyric={section.lyric}
          isActive={activeKey === lineKey}
        />
      </div>
    );
  }

  if (section.type === 'tab_block') {
    const lines = section.content.split('\n');
    return (
      <div
        className="my-3 rounded-xl overflow-x-auto"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <pre
          className="px-4 py-3 text-[11px] leading-relaxed text-text-secondary"
          style={{ fontFamily: "'Courier New', Courier, monospace", whiteSpace: 'pre' }}
        >
          {lines.map((line, i) => {
            if (isTabLine(line)) {
              return (
                <span key={i} className="block">
                  <span style={{ color: '#6B5CE7', fontWeight: 600 }}>{line[0]}</span>
                  {line.slice(1)}{'\n'}
                </span>
              );
            }
            return <span key={i} className="block">{line}{'\n'}</span>;
          })}
        </pre>
      </div>
    );
  }

  if (section.type === 'section') {
    return (
      <div className="flex items-center gap-3 my-4">
        <span className="font-syne font-bold text-primary uppercase tracking-widest" style={{ fontSize: '10px' }}>
          {section.content}
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(107,92,231,0.2)' }} />
      </div>
    );
  }

  if (section.isChordLine) {
    return (
      <div className="flex flex-wrap gap-1.5 my-2">
        {section.chords.map((ch, i) => <ChordChip key={i} name={ch} />)}
        {section.annotation && (
          <span className="font-dm text-[10px] text-text-tertiary self-center">{section.annotation}</span>
        )}
      </div>
    );
  }

  const parts = section.content.split(/(\[ch\].*?\[\/ch\])/g);
  return (
    <p className="font-dm text-ui-sm text-text-secondary leading-relaxed py-0.5" style={{ wordBreak: 'break-word' }}>
      {parts.map((part, i) => {
        const m = part.match(/^\[ch\](.*?)\[\/ch\]$/);
        if (m) return <ChordChip key={i} name={m[1]} />;
        return part ? <span key={i}>{part}</span> : null;
      })}
    </p>
  );
}

// ─── Play Along UI ────────────────────────────────────────────────────────────

function PlayAlongButton({ status, onActivate, onDeactivate }) {
  const isActive = status !== 'idle' && status !== 'error';
  const isLoading = status === 'loading';

  if (isActive) {
    return (
      <button
        onClick={onDeactivate}
        className="flex items-center gap-1.5 px-3 h-9 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors duration-200"
        style={{ background: 'rgba(107,92,231,0.25)', border: '1px solid rgba(107,92,231,0.5)' }}
        aria-label="Stop play along"
      >
        {isLoading ? (
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="#B5AEFF" strokeWidth="2.5" strokeLinecap="round"
            className="animate-spin" aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#B5AEFF" aria-hidden="true">
            <rect x="4" y="4" width="5" height="16" rx="1" />
            <rect x="15" y="4" width="5" height="16" rx="1" />
          </svg>
        )}
        <span className="font-dm font-medium" style={{ fontSize: '11px', color: '#B5AEFF' }}>
          {isLoading ? 'Syncing…' : 'Playing'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onActivate}
      className="flex items-center gap-1.5 px-3 h-9 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200"
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
      aria-label="Start play along"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#8B84B0" aria-hidden="true">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      <span className="font-dm font-medium" style={{ fontSize: '11px', color: '#8B84B0' }}>Play along</span>
    </button>
  );
}

function NoLyricsToast({ onDismiss }) {
  return (
    <div
      className="mx-4 mb-2 px-4 py-3 rounded-2xl flex items-center justify-between gap-3"
      style={{ background: 'rgba(239,159,39,0.1)', border: '1px solid rgba(239,159,39,0.25)' }}
    >
      <p className="font-dm text-ui-xs" style={{ color: '#EF9F27' }}>
        No synced lyrics found for this song
      </p>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 cursor-pointer focus:outline-none"
        aria-label="Dismiss"
        style={{ color: '#EF9F27', opacity: 0.7 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function SpotifyOnlyView({ song, onClose }) {
  const { albumArt } = song;
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: '#12111C' }}
      initial={{ y: '100%', opacity: 0.8 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 36 }}
    >
      {albumArt.url640 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <img src={albumArt.url640} alt="" className="w-full h-full object-cover opacity-10 scale-110 blur-2xl" />
        </div>
      )}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 cursor-pointer focus:outline-none text-text-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          <span className="font-dm text-ui-xs">Back</span>
        </button>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: `linear-gradient(135deg, ${albumArt.from}, ${albumArt.to})` }}>
            {albumArt.url300 && <img src={albumArt.url300} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="font-syne font-bold text-text-primary truncate" style={{ fontSize: '1.1rem' }}>{song.title}</p>
            <p className="font-dm text-ui-sm text-text-secondary truncate">{song.artist}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full font-dm text-[10px]" style={{ background: 'rgba(107,92,231,0.2)', color: '#9B84F0' }}>
              {song.readinessScore}% ready
            </span>
          </div>
        </div>

        {/* Chords */}
        <div>
          <p className="font-syne font-bold text-text-secondary uppercase mb-3" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>Key chords</p>
          <div className="flex flex-wrap gap-2">
            {song.chords.map(chord => (
              <div key={chord.name} className="px-3 py-2 rounded-xl font-dm font-medium text-ui-sm" style={{
                background: chord.known ? 'rgba(107,92,231,0.2)' : 'rgba(255,255,255,0.05)',
                border: chord.known ? '1px solid rgba(107,92,231,0.5)' : '1px solid rgba(255,255,255,0.1)',
                color: chord.known ? '#C4B5FD' : '#8B84B0',
              }}>
                {chord.name}
              </div>
            ))}
          </div>
          <p className="font-dm text-[11px] text-text-tertiary mt-2">
            Purple = chords you already know
          </p>
        </div>

        {/* UG link */}
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#1E1B30', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="font-dm text-ui-sm text-text-secondary">Full tab available on Ultimate Guitar</p>
          <a
            href={song.tab_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 rounded-xl font-dm font-medium text-ui-sm flex items-center justify-center gap-2 cursor-pointer"
            style={{ background: '#6B5CE7', color: '#fff' }}
          >
            Open on Ultimate Guitar ↗
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function TabView({ song, onClose }) {
  const scrollRef = useRef(null);
  if (!song) return null;

  if (song.isSpotifyOnly) return <SpotifyOnlyView song={song} onClose={onClose} />;

  const sections = useMemo(() => parseTabContent(song.tabContent), [song.tabContent]);

  const {
    status, activeKey, showEmbed,
    setEmbedRef, activate, deactivate,
  } = usePlayAlong(song, sections, scrollRef);

  const { albumArt } = song;
  const capoLabel   = song.capo > 0 ? `Capo ${song.capo}` : 'No capo';
  const diffLabel   = song.difficulty || 'intermediate';
  const ratingLabel = song.rating ? `${song.rating.toFixed(1)} ★` : null;

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: '#12111C' }}
      initial={{ y: '100%', opacity: 0.8 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 36 }}
      aria-label={`Tab view for ${song.title}`}
      role="dialog"
      aria-modal="true"
    >
      {/* Blurred art background */}
      {albumArt.url640 && (
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <img
            src={albumArt.url640} alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'blur(60px) saturate(1.2) brightness(0.25)', transform: 'scale(1.2)' }}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(18,17,28,0.75)' }} />
        </div>
      )}

      {/* Sticky header */}
      <header
        className="relative z-10 flex-shrink-0 flex items-center gap-3 px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{ background: 'rgba(255,255,255,0.07)' }}
          aria-label="Close tab view"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0EEF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {albumArt.url300 && (
          <img
            src={albumArt.url300}
            alt={`${song.title} album art`}
            className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        )}

        <div className="flex-1 min-w-0">
          <h1
            className="font-syne font-bold text-text-primary truncate leading-tight"
            style={{ fontSize: 'clamp(1rem, 4vw, 1.125rem)', letterSpacing: '-0.01em' }}
          >
            {song.title}
          </h1>
          <p className="font-dm text-ui-xs text-text-secondary truncate">{song.artist}</p>
        </div>

        {/* Play Along button */}
        <PlayAlongButton
          status={status}
          onActivate={activate}
          onDeactivate={deactivate}
        />

        {song.tab_url && (
          <a
            href={song.tab_url} target="_blank" rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ background: 'rgba(255,255,255,0.07)' }}
            aria-label="Open on Ultimate Guitar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B84B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </header>

      {/* Metadata pills */}
      <div
        className="relative z-10 flex-shrink-0 px-4 py-3 flex gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <MetaPill label="Tuning" value={song.tuning} />
        <MetaPill label="Capo"   value={capoLabel} />
        <MetaPill label="Level"  value={diffLabel.charAt(0).toUpperCase() + diffLabel.slice(1)} />
        {ratingLabel && <MetaPill label="Rating" value={ratingLabel} />}
        {song.votes > 0 && <MetaPill label="Votes" value={song.votes.toLocaleString()} />}
      </div>

      {/* "No lyrics" toast */}
      {status === 'no-lyrics' && <NoLyricsToast onDismiss={deactivate} />}

      {/* Spotify embed — mounts when play along is activated */}
      {showEmbed && status !== 'no-lyrics' && (
        <div
          className="relative z-10 flex-shrink-0 px-4 pb-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Container where Spotify IFrame API injects the <iframe> */}
          <div
            ref={setEmbedRef}
            style={{ borderRadius: 12, overflow: 'hidden', minHeight: 80 }}
          />
          {status === 'loading' && (
            <div
              className="absolute inset-4 rounded-xl flex items-center justify-center gap-2"
              style={{ background: '#1E1B30' }}
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#6B5CE7" strokeWidth="2.5" strokeLinecap="round"
                className="animate-spin" aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span className="font-dm text-ui-xs text-text-secondary">Loading lyrics…</span>
            </div>
          )}
        </div>
      )}

      {/* Tab content */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 pb-8"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3D3860" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
            </svg>
            <p className="font-dm text-ui-sm text-text-tertiary">Tab content not available</p>
          </div>
        ) : (
          <div className="pt-2">
            {sections.map((section, i) => (
              <TabItem key={i} section={section} sectionIdx={i} activeKey={activeKey} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
