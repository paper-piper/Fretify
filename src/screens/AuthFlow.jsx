/**
 * AuthFlow — full onboarding experience.
 *
 * Steps:
 *   welcome  → sign-up form → spotify-connect → quiz (5 Qs) → done
 *   welcome  → sign-in form → done (existing users skip onboarding)
 *
 * The quiz is framed as a quick "60-second starter" so we can
 * recommend the right songs right away. Results are stored in AuthContext.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FretlyLogo from '../components/FretlyLogo';
import { useAuth } from '../context/AuthContext';

// ─── Chord diagram SVG (Am chord — Q3) ───────────────────────────────────────

function AmDiagram() {
  // Am: x02210
  // Fret box: 6 strings, 4 frets shown
  const strings = 6;
  const fretCount = 4;
  const sx = 10, sy = 28, sw = 9, sh = 10;

  const dots = [
    { s: 1, f: 1 }, // A string, fret 2 (index 1 = fret 2)
    { s: 2, f: 1 }, // D string, fret 2
    { s: 3, f: 2 }, // G string, fret 2 (index 2 = fret 2; adjust)
  ];
  // Corrected Am: e=0, B=1, G=2, D=2, A=0, E=x
  // Strings 0-5 (high e to low E), but let's show from low to high left-right:
  // Low E: x, A: 0, D: 2, G: 2, B: 1, high e: 0
  const markers = [
    { s: 0, type: 'x' },  // Low E muted
    { s: 1, type: 'o' },  // A open
    { s: 2, f: 2, type: 'dot' }, // D fret 2
    { s: 3, f: 2, type: 'dot' }, // G fret 2
    { s: 4, f: 1, type: 'dot' }, // B fret 1
    { s: 5, type: 'o' },  // high e open
  ];

  const w = sw * (strings - 1);
  const h = sh * fretCount;

  return (
    <svg width={sx * 2 + w} height={sy + h + 10} viewBox={`0 0 ${sx * 2 + w} ${sy + h + 10}`} aria-label="Am chord diagram">
      {/* Nut */}
      <rect x={sx} y={sy} width={w} height={2.5} fill="#6B5CE7" rx={1} />
      {/* Fret lines */}
      {Array.from({ length: fretCount }).map((_, fi) => (
        <line key={fi} x1={sx} y1={sy + sh * (fi + 1)} x2={sx + w} y2={sy + sh * (fi + 1)} stroke="#3D3860" strokeWidth={0.8} />
      ))}
      {/* String lines */}
      {Array.from({ length: strings }).map((_, si) => (
        <line key={si} x1={sx + sw * si} y1={sy} x2={sx + sw * si} y2={sy + h} stroke="#3D3860" strokeWidth={0.8} />
      ))}
      {/* Markers */}
      {markers.map(({ s, f, type }, i) => {
        const cx = sx + sw * s;
        if (type === 'x') return <text key={i} x={cx} y={sy - 6} textAnchor="middle" fontSize={8} fill="#8B84B0" fontFamily="system-ui">×</text>;
        if (type === 'o') return <circle key={i} cx={cx} cy={sy - 7} r={3.5} fill="none" stroke="#8B84B0" strokeWidth={1} />;
        const cy = sy + sh * (f - 0.5);
        return <circle key={i} cx={cx} cy={cy} r={3.8} fill="#6B5CE7" />;
      })}
    </svg>
  );
}

// ─── Quiz questions ───────────────────────────────────────────────────────────

const QUIZ = [
  {
    id: 'experience',
    question: 'How long have you been playing guitar?',
    type: 'single',
    options: [
      { value: 'new',    label: 'Just picked it up',        sub: 'Less than a month' },
      { value: '1to6',   label: 'Still figuring it out',    sub: '1–6 months' },
      { value: '6to24',  label: 'Getting the hang of it',   sub: '6 months – 2 years' },
      { value: '2plus',  label: 'Been playing a while',     sub: '2+ years' },
    ],
  },
  {
    id: 'chords',
    question: 'Which chords can you play right now?',
    type: 'multi',
    hint: 'Tap all that apply',
    options: [
      { value: 'GCD',   label: 'G, C, D' },
      { value: 'EmAm',  label: 'Em, Am' },
      { value: 'F',     label: 'F chord' },
      { value: 'Bm',    label: 'Bm' },
      { value: 'barre', label: 'Barre chords' },
    ],
  },
  {
    id: 'capoKnowledge',
    question: 'What does a capo do?',
    type: 'single',
    diagram: <AmDiagram />,
    diagramLabel: 'Am chord — do you recognise this?',
    options: [
      { value: 'loud',    label: 'Makes the guitar louder' },
      { value: 'correct', label: 'Raises the key without relearning chords', accent: true },
      { value: 'tune',    label: 'Changes the tuning' },
      { value: 'dunno',   label: "I'm not sure yet" },
    ],
  },
  {
    id: 'switchSpeed',
    question: 'How do you switch between chords?',
    type: 'single',
    options: [
      { value: 'slow',   label: 'I stop and think about each one' },
      { value: 'pause',  label: 'I pause briefly, then find it' },
      { value: 'smooth', label: 'Mostly smooth with some hiccups' },
      { value: 'fluid',  label: 'Clean switches — pure muscle memory' },
    ],
  },
  {
    id: 'goal',
    question: "What's your main guitar goal?",
    type: 'single',
    options: [
      { value: 'songs',   label: 'Play my favourite songs' },
      { value: 'create',  label: 'Write and create my own music' },
      { value: 'jam',     label: 'Jam with friends or a band' },
      { value: 'relax',   label: 'Just for fun and relaxation' },
    ],
  },
];

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const slide = {
  initial:  { opacity: 0, x: 32 },
  animate:  { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },
  exit:     { opacity: 0, x: -32, transition: { duration: 0.15 } },
};

function Field({ label, type = 'text', value, onChange, placeholder, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-dm text-ui-xs text-text-secondary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
        className="w-full h-12 px-4 rounded-2xl font-dm text-ui-sm text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{
          background: '#1E1B30',
          border: error ? '1px solid #FF4466' : '1px solid rgba(255,255,255,0.1)',
        }}
      />
      {error && <p className="font-dm text-[11px]" style={{ color: '#FF4466' }}>{error}</p>}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-12 rounded-2xl font-dm font-medium text-ui-sm text-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-opacity duration-150"
      style={{ background: disabled || loading ? '#3D3860' : '#6B5CE7', opacity: disabled ? 0.5 : 1 }}
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}

function GhostBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-12 rounded-2xl font-dm text-ui-sm text-text-secondary cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {children}
    </button>
  );
}

// ─── Step screens ─────────────────────────────────────────────────────────────

function WelcomeStep({ onSignUp, onSignIn }) {
  return (
    <motion.div key="welcome" {...slide} className="flex flex-col h-full px-6 py-8">
      {/* Logo + brand */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6B5CE7 0%, #4A3DB8 100%)', boxShadow: '0 8px 32px rgba(107,92,231,0.45)' }}
        >
          <FretlyLogo size={40} />
        </div>
        <div>
          <h1 className="font-syne font-bold text-text-primary" style={{ fontSize: '2rem', letterSpacing: '-0.03em' }}>
            Fretify
          </h1>
          <p className="font-dm text-ui-sm text-text-secondary mt-2 leading-relaxed max-w-xs">
            Songs matched to your chords, your level, and your taste.
          </p>
        </div>

        {/* Decorative string lines */}
        <div className="flex gap-1 opacity-30" aria-hidden="true">
          {[0.7,1,0.5,0.9,0.6,0.8].map((h, i) => (
            <div key={i} className="w-0.5 rounded-full" style={{ height: `${h * 48}px`, background: '#6B5CE7' }} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-4">
        <PrimaryBtn onClick={onSignUp}>Create an account</PrimaryBtn>
        <GhostBtn onClick={onSignIn}>I already have an account</GhostBtn>
      </div>
    </motion.div>
  );
}

function SignUpStep({ onBack, onContinue }) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim())              e.name = 'Name is required';
    if (!email.includes('@'))      e.email = 'Enter a valid email';
    if (password.length < 6)      e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (validate()) onContinue({ name: name.trim(), email: email.trim().toLowerCase(), password });
  };

  return (
    <motion.div key="signup" {...slide} className="flex flex-col h-full px-6 py-6">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 cursor-pointer text-text-secondary focus:outline-none" aria-label="Back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="font-dm text-ui-xs">Back</span>
      </button>

      <h2 className="font-syne font-bold text-text-primary mb-1" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>Create account</h2>
      <p className="font-dm text-ui-xs text-text-secondary mb-6">Takes 60 seconds to set up</p>

      <div className="flex flex-col gap-4 flex-1">
        <Field label="Your name" value={name} onChange={setName} placeholder="Alex" error={errors.name} />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" error={errors.email} />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="6+ characters" error={errors.password} />
      </div>

      <div className="pb-4 mt-6">
        <PrimaryBtn onClick={submit}>Continue →</PrimaryBtn>
      </div>
    </motion.div>
  );
}

function SignInStep({ onBack, onContinue }) {
  const { signIn } = useAuth();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');

  const submit = () => {
    const result = signIn(email.trim().toLowerCase(), password);
    if (result.ok) {
      onContinue(result.user);
    } else {
      setError(result.error);
    }
  };

  return (
    <motion.div key="signin" {...slide} className="flex flex-col h-full px-6 py-6">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 cursor-pointer text-text-secondary focus:outline-none" aria-label="Back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="font-dm text-ui-xs">Back</span>
      </button>

      <h2 className="font-syne font-bold text-text-primary mb-1" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>Welcome back</h2>
      <p className="font-dm text-ui-xs text-text-secondary mb-6">Sign in to your Fretify account</p>

      <div className="flex flex-col gap-4 flex-1">
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" />
        {error && <p className="font-dm text-[11px]" style={{ color: '#FF4466' }}>{error}</p>}
      </div>

      <div className="pb-4 mt-6">
        <PrimaryBtn onClick={submit} disabled={!email || !password}>Sign in</PrimaryBtn>
      </div>
    </motion.div>
  );
}

function SpotifyStep({ onContinue, onSkip }) {
  const { connectSpotify } = useAuth();
  const [state, setState] = useState('idle'); // idle | connecting | done | error

  const connect = () => {
    setState('connecting');
    const popup = window.open(
      'http://127.0.0.1:8888/login',
      'spotify-auth',
      'width=500,height=700,left=200,top=100'
    );

    let resolved = false;

    const handleMessage = (event) => {
      if (!event.data) return;
      if (event.data.spotifyToken) {
        resolved = true;
        clearInterval(pollClosed);
        window.removeEventListener('message', handleMessage);
        connectSpotify(event.data.spotifyToken);
        setState('done');
        popup?.close();
      } else if (event.data.spotifyError) {
        resolved = true;
        clearInterval(pollClosed);
        window.removeEventListener('message', handleMessage);
        setState('error');
      }
    };

    window.addEventListener('message', handleMessage);

    const pollClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(pollClosed);
        if (!resolved) {
          window.removeEventListener('message', handleMessage);
          setState('idle');
        }
      }
    }, 500);
  };

  return (
    <motion.div key="spotify" {...slide} className="flex flex-col h-full px-6 py-8">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
        {/* Spotify logo */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: state === 'done' ? 'rgba(30,215,96,0.15)' : 'rgba(30,215,96,0.1)', border: '1px solid rgba(30,215,96,0.3)', transition: 'background 0.4s' }}
        >
          {state === 'done' ? (
            <motion.svg initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1ED760" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#1ED760" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 01-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.622.622 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.781.781 0 01-.973-.519.781.781 0 01.52-.972c3.632-1.102 8.147-.568 11.233 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.793c3.514-1.066 9.357-.86 13.045 1.345a.937.937 0 11-.885 1.605z"/>
            </svg>
          )}
        </div>

        <div>
          <h2 className="font-syne font-bold text-text-primary" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
            {state === 'done' ? 'Spotify connected!' : 'Connect Spotify'}
          </h2>
          <p className="font-dm text-ui-sm text-text-secondary mt-2 leading-relaxed max-w-xs">
            {state === 'done'
              ? 'Your listening history will power your song recommendations.'
              : 'Link your account so we can match songs to what you actually listen to.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-4">
        {state === 'idle' && (
          <>
            <button
              onClick={connect}
              className="w-full h-12 rounded-2xl font-dm font-medium text-ui-sm cursor-pointer focus:outline-none transition-opacity duration-150 flex items-center justify-center gap-2"
              style={{ background: '#1ED760', color: '#000' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#000" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 01-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.622.622 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.781.781 0 01-.973-.519.781.781 0 01.52-.972c3.632-1.102 8.147-.568 11.233 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.793c3.514-1.066 9.357-.86 13.045 1.345a.937.937 0 11-.885 1.605z"/>
              </svg>
              Connect with Spotify
            </button>
            <GhostBtn onClick={onSkip}>Skip for now</GhostBtn>
          </>
        )}
        {state === 'connecting' && (
          <div className="flex items-center justify-center gap-2 h-12">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1ED760" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span className="font-dm text-ui-sm" style={{ color: '#1ED760' }}>Waiting for Spotify…</span>
          </div>
        )}
        {state === 'error' && (
          <>
            <p className="font-dm text-ui-xs text-center" style={{ color: '#FF4466' }}>Connection failed. Please try again.</p>
            <button
              onClick={() => setState('idle')}
              className="w-full h-12 rounded-2xl font-dm font-medium text-ui-sm cursor-pointer focus:outline-none"
              style={{ background: '#1ED760', color: '#000' }}
            >
              Try again
            </button>
            <GhostBtn onClick={onSkip}>Skip for now</GhostBtn>
          </>
        )}
        {state === 'done' && (
          <PrimaryBtn onClick={onContinue}>Continue →</PrimaryBtn>
        )}
      </div>
    </motion.div>
  );
}

function QuizStep({ questionIndex, totalQuestions, question, answers, onAnswer, onNext, onBack }) {
  const isMulti    = question.type === 'multi';
  const selected   = isMulti ? (answers[question.id] ?? []) : (answers[question.id] ?? null);
  const canAdvance = isMulti ? selected.length > 0 : selected !== null;
  const progress   = ((questionIndex) / totalQuestions) * 100;

  const toggle = (value) => {
    if (!isMulti) { onAnswer(question.id, value); return; }
    const arr = selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value];
    onAnswer(question.id, arr);
  };

  return (
    <motion.div key={`q-${questionIndex}`} {...slide} className="flex flex-col h-full px-6 py-6">
      {/* Progress */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="flex items-center gap-1.5 cursor-pointer text-text-tertiary focus:outline-none" aria-label="Back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="font-dm text-ui-xs text-text-tertiary">{questionIndex + 1} / {totalQuestions}</span>
          <span className="font-dm text-ui-xs" style={{ color: '#6B5CE7' }}>60-sec quiz</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1E1B30' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#6B5CE7' }}
            initial={{ width: `${((questionIndex) / totalQuestions) * 100}%` }}
            animate={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="font-syne font-bold text-text-primary mb-1 flex-shrink-0" style={{ fontSize: '1.2rem', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
        {question.question}
      </h2>
      {question.hint && <p className="font-dm text-ui-xs text-text-tertiary mb-4">{question.hint}</p>}
      {!question.hint && <div className="mb-4" />}

      {/* Optional diagram */}
      {question.diagram && (
        <div className="flex flex-col items-center mb-4 p-3 rounded-2xl flex-shrink-0" style={{ background: '#1E1B30', border: '1px solid rgba(255,255,255,0.07)' }}>
          {question.diagram}
          {question.diagramLabel && <p className="font-dm text-[11px] text-text-tertiary mt-1">{question.diagramLabel}</p>}
        </div>
      )}

      {/* Options */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-2">
        {question.options.map(opt => {
          const isSelected = isMulti ? selected.includes(opt.value) : selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className="w-full text-left px-4 py-3.5 rounded-2xl cursor-pointer focus:outline-none transition-all duration-150"
              style={{
                background: isSelected ? 'rgba(107,92,231,0.2)' : '#1E1B30',
                border: isSelected ? '1px solid rgba(107,92,231,0.6)' : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: isSelected ? '#6B5CE7' : 'transparent',
                    border: isSelected ? 'none' : '1.5px solid #3D3860',
                  }}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-dm font-medium text-ui-sm" style={{ color: isSelected ? '#E2D9FF' : '#F0EEF8' }}>
                    {opt.label}
                  </p>
                  {opt.sub && <p className="font-dm text-[11px] text-text-tertiary">{opt.sub}</p>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Next */}
      <div className="flex-shrink-0 pt-3 pb-2">
        <PrimaryBtn onClick={onNext} disabled={!canAdvance}>
          {questionIndex === totalQuestions - 1 ? 'Finish quiz →' : 'Next →'}
        </PrimaryBtn>
      </div>
    </motion.div>
  );
}

function DoneStep({ name, level }) {
  const levelLabel = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[level] ?? 'Beginner';
  const levelColor = { beginner: '#4ADE80', intermediate: '#EF9F27', advanced: '#FF4466' }[level] ?? '#4ADE80';

  return (
    <motion.div key="done" {...slide} className="flex flex-col h-full px-6 py-8 items-center justify-center text-center gap-6">
      {/* Celebration */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
        className="w-24 h-24 rounded-3xl flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${levelColor}22 0%, #6B5CE720 100%)`, border: `1px solid ${levelColor}40` }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={levelColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
        </svg>
      </motion.div>

      <div>
        <h2 className="font-syne font-bold text-text-primary" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
          You're all set, {name}!
        </h2>
        <p className="font-dm text-ui-sm text-text-secondary mt-2 leading-relaxed">
          Your mixes are ready. We've matched songs to your level.
        </p>
      </div>

      <div
        className="px-5 py-3 rounded-2xl"
        style={{ background: `${levelColor}12`, border: `1px solid ${levelColor}30` }}
      >
        <p className="font-dm text-ui-xs text-text-tertiary mb-0.5">Your level</p>
        <p className="font-syne font-bold" style={{ color: levelColor, fontSize: '1.1rem' }}>{levelLabel}</p>
      </div>
    </motion.div>
  );
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

export default function AuthFlow({ onComplete }) {
  const { signUp, completeQuiz } = useAuth();

  const [screen, setScreen] = useState('welcome'); // welcome | signup | signin | spotify | quiz | done
  const [signUpData, setSignUpData]   = useState(null);
  const [quizIndex, setQuizIndex]     = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const quizAnswersRef = useRef({});
  const [completedUser, setCompletedUser] = useState(null);

  const handleSignUp = (data) => {
    setSignUpData(data);
    signUp(data); // persist immediately
    setScreen('spotify');
  };

  const handleSpotifyDone = () => setScreen('quiz');
  const handleSpotifySkip = () => setScreen('quiz');

  const handleAnswer = (id, value) => {
    const updated = { ...quizAnswersRef.current, [id]: value };
    quizAnswersRef.current = updated;
    setQuizAnswers(updated);
  };

  const handleQuizNext = () => {
    if (quizIndex < QUIZ.length - 1) {
      setQuizIndex(i => i + 1);
    } else {
      const user = completeQuiz(quizAnswersRef.current);
      setCompletedUser(user);
      setScreen('done');
    }
  };

  const handleQuizBack = () => {
    if (quizIndex === 0) setScreen('spotify');
    else setQuizIndex(i => i - 1);
  };

  const handleSignInDone = (user) => {
    setCompletedUser(user);
    // Existing users skip spotify + quiz
    setScreen('done');
  };

  // "Done" screen sits for 1.6s then auto-completes
  useEffect(() => {
    if (screen !== 'done') return;
    const t = setTimeout(onComplete, 1800);
    return () => clearTimeout(t);
  }, [screen, onComplete]);

  return (
    <div
      className="absolute inset-0 z-50 overflow-hidden"
      style={{ background: '#12111C' }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 100% at 50% -10%, rgba(107,92,231,0.2) 0%, transparent 70%)' }}
      />

      <AnimatePresence mode="sync">
        {screen === 'welcome' && (
          <WelcomeStep key="welcome" onSignUp={() => setScreen('signup')} onSignIn={() => setScreen('signin')} />
        )}
        {screen === 'signup' && (
          <SignUpStep key="signup" onBack={() => setScreen('welcome')} onContinue={handleSignUp} />
        )}
        {screen === 'signin' && (
          <SignInStep key="signin" onBack={() => setScreen('welcome')} onContinue={handleSignInDone} />
        )}
        {screen === 'spotify' && (
          <SpotifyStep key="spotify" onContinue={handleSpotifyDone} onSkip={handleSpotifySkip} />
        )}
        {screen === 'quiz' && (
          <QuizStep
            key={`quiz-${quizIndex}`}
            questionIndex={quizIndex}
            totalQuestions={QUIZ.length}
            question={QUIZ[quizIndex]}
            answers={quizAnswers}
            onAnswer={handleAnswer}
            onNext={handleQuizNext}
            onBack={handleQuizBack}
          />
        )}
        {screen === 'done' && (
          <DoneStep key="done" name={completedUser?.name ?? signUpData?.name ?? 'there'} level={completedUser?.level ?? 'beginner'} />
        )}
      </AnimatePresence>
    </div>
  );
}
