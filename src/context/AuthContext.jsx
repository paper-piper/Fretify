/**
 * AuthContext — mock auth with localStorage persistence.
 * No real backend: accounts are stored in localStorage keyed by email.
 */

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'fretify_current_user';
const ACCOUNTS_KEY = 'fretify_accounts';

function loadCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadCurrentUser);

  /** Derive a player level from quiz answers */
  function deriveLevel(quizAnswers = {}) {
    const { experience, chords = [], switchSpeed, capoKnowledge } = quizAnswers;
    let score = 0;
    if (experience === '2plus') score += 3;
    else if (experience === '1to2') score += 2;
    else if (experience === '6to12') score += 1;
    score += Math.min(chords.length, 4);
    if (switchSpeed === 'smooth' || switchSpeed === 'fluid') score += 2;
    if (capoKnowledge === 'correct') score += 1;
    if (score >= 7) return 'advanced';
    if (score >= 4) return 'intermediate';
    return 'beginner';
  }

  const signUp = (userData) => {
    const accounts = loadAccounts();
    const newUser = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      spotifyConnected: false,
      quizComplete: false,
      level: 'beginner',
      knownChords: [],
      goal: null,
      ...userData,
    };
    accounts[userData.email.toLowerCase()] = newUser;
    saveAccounts(accounts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const signIn = (email, _password) => {
    const accounts = loadAccounts();
    const existing = accounts[email.toLowerCase()];
    if (existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      setUser(existing);
      return { ok: true, user: existing };
    }
    return { ok: false, error: 'No account found with that email.' };
  };

  const updateUser = (updates) => {
    // Always read the freshest persisted user to avoid stale-closure overwrites
    // (e.g. connectSpotify followed by completeQuiz in the same render cycle).
    const base = loadCurrentUser() ?? user;
    const updated = { ...base, ...updates };
    const accounts = loadAccounts();
    if (updated.email) accounts[updated.email.toLowerCase()] = updated;
    saveAccounts(accounts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  const completeQuiz = (quizAnswers) => {
    const level = deriveLevel(quizAnswers);
    return updateUser({
      quizComplete: true,
      level,
      knownChords: quizAnswers.chords ?? [],
      goal: quizAnswers.goal ?? null,
    });
  };

  const connectSpotify = () => updateUser({ spotifyConnected: true });

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, updateUser, completeQuiz, connectSpotify, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
