import { useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * TabView — full-screen overlay for learning a song.
 *
 * Parsing pipeline:
 *  1. Split on [tab]...[/tab] blocks
 *  2. Each [tab] block → chord_lyric (chords row + lyric) or tab_block (guitar notation)
 *  3. Non-[tab] lines → section markers, chord-only lines, or plain text
 *  4. Group consecutive chord_lyric rows under a section → verse_group (single card)
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

/**
 * Parse a [tab]...[/tab] inner string.
 * Pattern: one or more chord-only lines, then a lyric line.
 * Returns { type: 'chord_lyric', rawChordLine, lyric } or { type: 'tab_block', content }.
 *
 * rawChordLine preserves the original text (including [ch] tags and spacing) so the
 * renderer can keep chord names positioned above the correct syllables.
 */
function parseTabInner(inner) {
  const nonEmpty = inner.split('\n').filter(l => l.trim());
  if (!nonEmpty.length) return null;

  // Actual guitar tab notation (e|, B|, etc.)
  if (nonEmpty.some(l => isTabLine(l.trim()))) {
    return { type: 'tab_block', content: inner };
  }

  const lastLine = nonEmpty[nonEmpty.length - 1];
  const lastHasChords = /\[ch\]/.test(lastLine);

  if (!lastHasChords && nonEmpty.length > 1) {
    // Classic chord-above-lyric: chord line(s) then lyric
    return {
      type: 'chord_lyric',
      rawChordLine: nonEmpty.slice(0, -1).join('\n'), // preserve spacing + [ch] tags
      lyric: lastLine, // preserve internal spaces (UG uses them for syllable alignment)
    };
  } else {
    // All chord lines (e.g. interlude) or single mixed line
    const lyricText = inner.replace(/\[ch\].*?\[\/ch\]/g, '').trim();
    return {
      type: 'chord_lyric',
      rawChordLine: nonEmpty.join('\n'),
      lyric: lyricText,
    };
  }
}

/**
 * Full parser. Returns a grouped array:
 *  - verse_group  { label, rows: chord_lyric[] }
 *  - tab_block    { content }
 *  - chord_lyric  standalone (before first section)
 *  - line         plain/chord-only line outside a section
 *  - spacer
 */
function parseTabContent(raw) {
  if (!raw) return [];

  const text = raw.replace(/\r/g, '');
  const blocks = text.split(/(\[tab\][\s\S]*?\[\/tab\])/g);

  // ── Step 1: flat parse ──────────────────────────────────────────────────────
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
          // "Chord-dominant" if all remaining text is a short annotation like "x2"
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

  // ── Step 2: group chord_lyric rows under sections ───────────────────────────
  const result = [];
  let group = null;

  for (const item of flat) {
    // Spacers: skip inside groups, dedupe outside
    if (item.type === 'spacer') {
      if (!group && result.at(-1)?.type !== 'spacer') result.push(item);
      continue;
    }

    // New section → open a fresh group
    if (item.type === 'section') {
      if (group?.rows.length) result.push(group);
      group = { type: 'verse_group', label: item.content, rows: [] };
      continue;
    }

    // chord_lyric from [tab] blocks
    if (item.type === 'chord_lyric') {
      if (group) { group.rows.push(item); continue; }
      result.push(item); // standalone (before any section)
      continue;
    }

    // Chord-dominant plain line inside an open group (e.g. interlude chord rows)
    if (item.type === 'line' && item.isChordLine && group) {
      group.rows.push({ type: 'chord_lyric', rawChordLine: item.content, lyric: item.annotation });
      continue;
    }

    // Anything else (tab_block, plain text line) closes the current group
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
      <span className="font-dm text-[10px] uppercase tracking-widest text-text-tertiary mb-0.5">
        {label}
      </span>
      <span className="font-syne font-bold text-ui-sm text-text-primary">{value}</span>
    </div>
  );
}

/** Chord chip used for standalone sequences (interlude, intro) outside verse cards */
function ChordChip({ name }) {
  return (
    <span
      className="inline-flex items-center rounded-md font-dm font-semibold flex-shrink-0"
      style={{
        fontSize: '10px',
        lineHeight: '1.4',
        padding: '2px 7px',
        background: 'rgba(107,92,231,0.22)',
        border: '1px solid rgba(107,92,231,0.45)',
        color: '#B5AEFF',
      }}
    >
      {name}
    </span>
  );
}

/**
 * Render one chord+lyric pair with proper positional alignment.
 *
 * Both lines use monospace so character positions match exactly.
 * Chord names get background + box-shadow styling — box-shadow is used instead
 * of border/padding so it's purely visual and doesn't affect character layout.
 */
function ChordLyricRow({ rawChordLine, lyric }) {
  const hasChords = rawChordLine && /\[ch\]/.test(rawChordLine);

  // No chord line — plain lyric only
  if (!hasChords) {
    return lyric ? (
      <p style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '12px', color: '#8B84B0', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', lineHeight: 1.7 }}>
        {lyric}
      </p>
    ) : null;
  }

  // Split chord line into alternating [spaces] and [ch]Name[/ch] tokens
  const parts = rawChordLine.split(/(\[ch\].*?\[\/ch\])/g);

  return (
    <div style={{ fontFamily: "'Courier New', Courier, monospace", lineHeight: 1.7 }}>
      {/* Chord row — white-space:pre keeps spacing, box-shadow gives chip look without shifting layout */}
      <div style={{ whiteSpace: 'pre', fontSize: '11px', overflowWrap: 'normal' }}>
        {parts.map((part, i) => {
          const m = part.match(/^\[ch\](.*?)\[\/ch\]$/);
          if (m) {
            return (
              <span
                key={i}
                style={{
                  color: '#B5AEFF',
                  fontWeight: 700,
                  background: 'rgba(107,92,231,0.2)',
                  borderRadius: '3px',
                  // box-shadow acts as a border without adding to the element's layout width
                  boxShadow: '0 0 0 1px rgba(107,92,231,0.45)',
                }}
              >
                {m[1]}
              </span>
            );
          }
          // Plain spaces / non-chord text — render as-is to preserve positioning
          return <span key={i}>{part}</span>;
        })}
      </div>
      {/* Lyric row — pre-wrap preserves UG's intentional extra spaces, allows wrapping */}
      {lyric && (
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#8B84B0', overflowWrap: 'break-word' }}>
          {lyric}
        </div>
      )}
    </div>
  );
}

/**
 * VerseGroup — one card for an entire section (Verse, Chorus, Bridge, etc.)
 * Each row uses ChordLyricRow for positionally-correct chord alignment.
 */
function VerseGroup({ group }) {
  return (
    <div
      className="my-3 rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Section label */}
      <div
        className="px-4 pt-3 pb-2 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="font-syne font-bold text-primary uppercase tracking-widest" style={{ fontSize: '10px' }}>
          {group.label}
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(107,92,231,0.15)' }} />
      </div>

      {/* Chord-lyric rows */}
      <div className="px-4 py-3 space-y-3">
        {group.rows.map((row, i) => (
          <ChordLyricRow key={i} rawChordLine={row.rawChordLine} lyric={row.lyric} />
        ))}
      </div>
    </div>
  );
}

/** Render one item from the parsed sections array */
function TabItem({ section }) {
  if (section.type === 'spacer') return <div className="h-2" />;

  // ── Grouped verse/chorus/bridge card ────────────────────────────────────────
  if (section.type === 'verse_group') return <VerseGroup group={section} />;

  // ── Standalone chord_lyric (before first section header) ────────────────────
  if (section.type === 'chord_lyric') {
    return (
      <div className="py-1">
        <ChordLyricRow rawChordLine={section.rawChordLine} lyric={section.lyric} />
      </div>
    );
  }

  // ── Guitar tablature block (monospace, scrollable) ───────────────────────────
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

  // ── Fallback section header (shouldn't appear after grouping) ────────────────
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

  // ── Plain line (outside any section) ────────────────────────────────────────
  // Chord-dominant line (interlude row outside a group)
  if (section.isChordLine) {
    return (
      <div className="flex flex-wrap gap-1.5 my-2">
        {section.chords.map((ch, i) => <ChordChip key={i} name={ch} />)}
        {section.annotation && (
          <span className="font-dm text-[10px] text-text-tertiary self-center">
            {section.annotation}
          </span>
        )}
      </div>
    );
  }

  // Mixed or plain text
  const parts = section.content.split(/(\[ch\].*?\[\/ch\])/g);
  return (
    <p
      className="font-dm text-ui-sm text-text-secondary leading-relaxed py-0.5"
      style={{ wordBreak: 'break-word' }}
    >
      {parts.map((part, i) => {
        const m = part.match(/^\[ch\](.*?)\[\/ch\]$/);
        if (m) return <ChordChip key={i} name={m[1]} />;
        return part ? <span key={i}>{part}</span> : null;
      })}
    </p>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TabView({ song, onClose }) {
  const scrollRef = useRef(null);
  if (!song) return null;

  const { albumArt } = song;
  const sections = parseTabContent(song.tabContent);

  const capoLabel   = song.capo  > 0 ? `Capo ${song.capo}`  : 'No capo';
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
      {/* ── Blurred art background ── */}
      {albumArt.url640 && (
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <img
            src={albumArt.url640}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'blur(60px) saturate(1.2) brightness(0.25)', transform: 'scale(1.2)' }}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(18,17,28,0.75)' }} />
        </div>
      )}

      {/* ── Sticky header ── */}
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

        {song.tab_url && (
          <a
            href={song.tab_url}
            target="_blank"
            rel="noopener noreferrer"
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

      {/* ── Metadata pills ── */}
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

      {/* ── Tab content ── */}
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
              <TabItem key={i} section={section} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
