import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 8888;
const HOST = '127.0.0.1';

const CLIENT_ID = '83604cef997c48f4aa69c6eca94c891c';
const CLIENT_SECRET = 'c8aef6d03e2042f7938669c843d36c8f';
const REDIRECT_URI = 'http://127.0.0.1:8888/callback';

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:4173',
  'https://fretify-indol.vercel.app',
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'x-token');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/login', (req, res) => {
  const scope = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
    'user-read-currently-playing',
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.send(popupHTML(null, 'access_denied'));
  }

  try {
    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = tokenRes.data;
    res.send(popupHTML(access_token, null));
  } catch (err) {
    console.error('Token exchange failed:', err.response?.data || err.message);
    res.send(popupHTML(null, 'auth_failed'));
  }
});

function popupHTML(token, error) {
  const msg = token
    ? `{ spotifyToken: ${JSON.stringify(token)} }`
    : `{ spotifyError: ${JSON.stringify(error)} }`;
  return `<!DOCTYPE html><html><body><script>
    if (window.opener) {
      window.opener.postMessage(${msg}, '*');
      window.close();
    } else {
      document.body.textContent = 'Auth complete. You may close this window.';
    }
  </script></body></html>`;
}

// Chrome DevTools probes this on any local server — return empty config to suppress the 404
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => res.json({}));

// Combined endpoint: top tracks + artist genres (audio-features deprecated Nov 2024)
app.get('/api/mix-data', async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const headers = { Authorization: `Bearer ${token}` };

    const [topTracksRes, topArtistsRes] = await Promise.all([
      axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term', { headers }),
      axios.get('https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term', { headers }),
    ]);

    const topTracks  = topTracksRes.data.items;
    const topArtists = topArtistsRes.data.items;

    // Build genre map from top artists
    const artistGenreMap = {};
    for (const a of topArtists) artistGenreMap[a.id] = a.genres;

    // Batch-fetch genres for track artists not already in the map
    const missing = [...new Set(
      topTracks.flatMap(t => t.artists.map(a => a.id)).filter(id => !artistGenreMap[id])
    )].slice(0, 50);

    if (missing.length) {
      const artRes = await axios.get(
        `https://api.spotify.com/v1/artists?ids=${missing.join(',')}`,
        { headers }
      );
      for (const a of artRes.data.artists) {
        if (a) artistGenreMap[a.id] = a.genres;
      }
    }

    const topArtistIds = new Set(topArtists.map(a => a.id));

    const tracks = topTracks.map(t => ({
      id:              t.id,
      name:            t.name,
      artist:          t.artists[0]?.name ?? '',
      album:           t.album?.name ?? '',
      art300:          t.album?.images?.[1]?.url ?? t.album?.images?.[0]?.url ?? null,
      art640:          t.album?.images?.[0]?.url ?? null,
      popularity:      t.popularity,
      isFavoriteArtist: t.artists.some(a => topArtistIds.has(a.id)),
      genres:          [...new Set(t.artists.flatMap(a => artistGenreMap[a.id] ?? []))],
    }));

    res.json({ tracks });
  } catch (err) {
    console.error('mix-data error:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { error: 'Spotify API error' });
  }
});

app.get('/api/me', (req, res) => spotifyProxy('https://api.spotify.com/v1/me', req, res));

app.get('/api/top-tracks', (req, res) => {
  const { time_range = 'medium_term' } = req.query;
  spotifyProxy(`https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=${time_range}`, req, res);
});

app.get('/api/top-artists', (req, res) => {
  const { time_range = 'medium_term' } = req.query;
  spotifyProxy(`https://api.spotify.com/v1/me/top/artists?limit=10&time_range=${time_range}`, req, res);
});

app.get('/api/recently-played', (req, res) => {
  spotifyProxy('https://api.spotify.com/v1/me/player/recently-played?limit=20', req, res);
});

async function spotifyProxy(url, req, res) {
  const token = req.headers['x-token'];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 204) return res.status(204).end();
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json(err.response?.data || { error: 'Spotify API error' });
  }
}

app.listen(PORT, HOST, () => {
  console.log(`Fretify auth server running at http://${HOST}:${PORT}`);
});
