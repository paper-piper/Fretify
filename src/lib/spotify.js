const BASE = 'http://127.0.0.1:8888';

async function request(path, token) {
  const res = await fetch(`${BASE}${path}`, { headers: { 'x-token': token } });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Spotify API ${res.status}`);
  return res.json();
}

export const getMe = (token) => request('/api/me', token);
export const getMixData = (token) => request('/api/mix-data', token);
export const getTopTracks = (token, timeRange = 'medium_term') => request(`/api/top-tracks?time_range=${timeRange}`, token);
export const getTopArtists = (token, timeRange = 'medium_term') => request(`/api/top-artists?time_range=${timeRange}`, token);
export const getRecentlyPlayed = (token) => request('/api/recently-played', token);
