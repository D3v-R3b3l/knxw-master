
import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

function jsonResponse(body, status = 200) {
  return Response.json(body, { status });
}

function extractChannelIdFromInput(input) {
  if (!input) return null;
  const trimmed = String(input).trim();

  // If plain channelId-like
  if (/^UC[0-9A-Za-z_-]{20,}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    // e.g. https://www.youtube.com/channel/UCxxxxxxxxxxxx
    const channelMatch = url.pathname.match(/\/channel\/(UC[0-9A-Za-z_-]+)/i);
    if (channelMatch) return channelMatch[1];

    // e.g. https://www.youtube.com/@handle
    const handleMatch = url.pathname.match(/\/@([A-Za-z0-9._-]+)/);
    if (handleMatch) return '@' + handleMatch[1];

    // Fallback: sometimes links like /c/CustomName or /user/legacy
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && (parts[0] === 'c' || parts[0] === 'user')) {
      return parts[1]; // we'll search this
    }
    return trimmed;
  } catch {
    // Not a URL, treat as id/handle/name
    return trimmed;
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error (${res.status}): ${text}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    // Read API key from multiple env names; trim and pick the first valid one
    const candidates = [
      Deno.env.get('API_KEY'),
      Deno.env.get('GOOGLE_API_KEY'),
      Deno.env.get('YOUTUBE_API_KEY'),
      Deno.env.get('key')
    ];
    const API_KEY = candidates.find((v) => typeof v === 'string' && v.trim().length > 0);

    if (!API_KEY) {
      return jsonResponse({ error: 'Missing YouTube API key. Please set API_KEY (preferred) or GOOGLE_API_KEY or YOUTUBE_API_KEY.' }, 500);
    }

    const { input } = await req.json().catch(() => ({}));
    if (!input || typeof input !== 'string') {
      return jsonResponse({ error: 'Missing required "input" (channel ID, handle, or URL)' }, 400);
    }

    const channelIdOrQuery = extractChannelIdFromInput(input);

    // Resolve channelId (supports @handle, custom names, and direct UC ids)
    let channelId = null;

    if (channelIdOrQuery.startsWith('@')) {
      const handle = channelIdOrQuery.replace(/^@/, '');
      try {
        const handleUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${API_KEY}`;
        const handleJson = await fetchJson(handleUrl);
        channelId = handleJson?.items?.[0]?.id || null;
      } catch (_e) {
        // fallback to search
      }
      if (!channelId) {
        const q = encodeURIComponent(handle);
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${q}&key=${API_KEY}`;
        const searchJson = await fetchJson(searchUrl);
        channelId = searchJson?.items?.[0]?.id?.channelId || null;
      }
    } else if (!channelIdOrQuery.startsWith('UC')) {
      const q = encodeURIComponent(channelIdOrQuery);
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${q}&key=${API_KEY}`;
      const searchJson = await fetchJson(searchUrl);
      channelId = searchJson?.items?.[0]?.id?.channelId || null;
    } else {
      channelId = channelIdOrQuery;
    }

    if (!channelId || typeof channelId !== 'string') {
      return jsonResponse({ error: 'Unable to resolve a valid channel ID from input' }, 400);
    }

    // Fetch channel details
    const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${encodeURIComponent(channelId)}&key=${API_KEY}`;
    const channelJson = await fetchJson(channelsUrl);
    const channel = channelJson?.items?.[0];
    if (!channel) {
      return jsonResponse({ error: 'Channel not found' }, 404);
    }

    const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;
    const videos = [];

    if (uploadsPlaylistId) {
      const playlistItemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(uploadsPlaylistId)}&maxResults=20&key=${API_KEY}`;
      const playlistJson = await fetchJson(playlistItemsUrl);
      const videoIds = (playlistJson?.items || [])
        .map((it) => it?.contentDetails?.videoId)
        .filter(Boolean);

      if (videoIds.length > 0) {
        const chunks = [];
        for (let i = 0; i < videoIds.length; i += 50) {
          chunks.push(videoIds.slice(i, i + 50));
        }

        for (const chunk of chunks) {
          const idsParam = encodeURIComponent(chunk.join(','));
          const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${idsParam}&key=${API_KEY}`;
          const vidsJson = await fetchJson(videosUrl);
          videos.push(...(vidsJson?.items || []));
        }
      }
    }

    // NEW: Fetch top comments for up to 5 most recent videos (top-level threads)
    const comments_map = {};
    try {
      const sorted = [...videos].sort((a, b) => {
        const da = new Date(a?.snippet?.publishedAt || 0).getTime();
        const db = new Date(b?.snippet?.publishedAt || 0).getTime();
        return db - da;
      });
      const recent = sorted.slice(0, 5);
      for (const vid of recent) {
        const vidId = vid?.id;
        if (!vidId) continue;
        try {
          const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${encodeURIComponent(vidId)}&maxResults=20&order=relevance&textFormat=plainText&key=${API_KEY}`;
          const cjson = await fetchJson(commentsUrl);
          const texts = (cjson?.items || []).map((it) => {
            const tsn = it?.snippet?.topLevelComment?.snippet;
            return tsn?.textDisplay || tsn?.textOriginal || '';
          }).filter(Boolean);
          comments_map[vidId] = texts;
        } catch (_e) {
          // comments disabled or quota/permissions issue - skip gracefully
          comments_map[vidId] = [];
        }
      }
    } catch (_e) {
      // ignore comment fetching failures entirely
    }

    return jsonResponse({ channel, videos, comments_map });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
});
