import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreSentiment(words) {
  const pos = new Set(['good','great','love','like','amazing','awesome','helpful','fast','easy','trust','win','best','happy','thanks','thank']);
  const neg = new Set(['bad','hate','angry','slow','bug','issue','problem','hard','confusing','worst','sad','disappoint','refund','broken']);
  let s = 0;
  for (const w of words) {
    if (pos.has(w)) s += 1;
    if (neg.has(w)) s -= 1;
  }
  return s;
}

function inferMotivations(words) {
  const motifs = {
    value: ['price','cheaper','discount','deal','worth','cost'],
    convenience: ['easy','quick','simple','faster','save','time'],
    trust: ['trust','secure','safe','privacy','reliable'],
    status: ['premium','exclusive','pro','elite','brand'],
    curiosity: ['new','discover','learn','explore','try'],
  };
  const hits = {};
  Object.entries(motifs).forEach(([k, arr]) => {
    hits[k] = arr.reduce((acc, t) => acc + (words.includes(t) ? 1 : 0), 0);
  });
  return Object.entries(hits)
    .sort((a,b) => b[1]-a[1])
    .filter(([,v]) => v > 0)
    .map(([k]) => k);
}

function inferCognitiveStyles(words) {
  const analytical = ['data','analysis','compare','metrics','technical','details'];
  const intuitive = ['feel','vibe','inspire','creative','imagine','story'];
  const map = { analytical, intuitive };
  const scores = { analytical: 0, intuitive: 0 };
  for (const [k, arr] of Object.entries(map)) {
    for (const t of arr) if (words.includes(t)) scores[k]++;
  }
  return Object.entries(scores).filter(([,v]) => v>0).map(([k]) => k);
}

function inferRiskSignals(words) {
  const conservative = ['safe','secure','stable','reliable','guarantee'];
  const aggressive = ['growth','scale','risk','bold','fast'];
  const map = { conservative, aggressive };
  const scores = { conservative: 0, aggressive: 0 };
  for (const [k, arr] of Object.entries(map)) {
    for (const t of arr) if (words.includes(t)) scores[k]++;
  }
  return Object.entries(scores).filter(([,v]) => v>0).map(([k]) => k);
}

function labelSentiment(totalScore, commentsCount) {
  const avg = commentsCount ? totalScore / commentsCount : 0;
  if (avg >= 0.8) return 'very_positive';
  if (avg >= 0.3) return 'positive';
  if (avg <= -0.8) return 'very_negative';
  if (avg <= -0.3) return 'negative';
  if (Math.abs(avg) < 0.1) return 'neutral';
  return 'mixed';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const pageId = body.page_id;
    const periodDays = Number(body.since_days || 14);
    if (!pageId) return Response.json({ error: 'Missing page_id' }, { status: 400 });

    const sinceMs = Date.now() - periodDays * 24 * 3600 * 1000;

    const pageRows = await base44.entities.MetaPage.filter({ fb_page_id: pageId }, null, 1);
    const pageName = pageRows?.[0]?.name || 'Facebook Page';

    const posts = await base44.entities.MetaPost.filter({ fb_page_id: pageId }, '-created_time', 100);
    const filteredPosts = (Array.isArray(posts) ? posts : []).filter(p => {
      const t = new Date(p.created_time).getTime();
      return !isNaN(t) && t >= sinceMs;
    });

    let commentsAnalyzed = 0;
    let totalSentiment = 0;
    const wordsBag = new Set();
    const postSummaries = [];

    for (const p of filteredPosts) {
      const comments = await base44.entities.MetaComment.filter({ fb_post_id: p.fb_post_id }, '-created_time', 500);
      const texts = (comments || []).map(c => c.message || '');
      let postScore = 0;
      for (const t of texts) {
        const words = tokenize(t);
        words.forEach(w => wordsBag.add(w));
        postScore += scoreSentiment(words);
      }
      totalSentiment += postScore;
      commentsAnalyzed += texts.length;

      postSummaries.push({
        fb_post_id: p.fb_post_id,
        why_it_worked: p.reactions_total > 50 || p.shares_count > 10
          ? 'High social proof (reactions/shares) indicates resonance.' 
          : 'Moderate engagement; messaging may be niche.',
        psychographic_appeal: [] // filled from global signals below
      });
    }

    const vocab = Array.from(wordsBag);
    const motivations = inferMotivations(vocab).slice(0, 5);
    const cog = inferCognitiveStyles(vocab).slice(0, 5);
    const risk = inferRiskSignals(vocab).slice(0, 5);
    const overall = labelSentiment(totalSentiment, commentsAnalyzed);

    // Assign global appeals to top posts
    for (const ps of postSummaries) {
      ps.psychographic_appeal = [...motivations, ...cog, ...risk].slice(0, 5);
    }

    const summary = `Analyzed ${filteredPosts.length} recent posts and ${commentsAnalyzed} comments. Audience sentiment is ${overall.replace('_',' ')}. Signals show motivations around ${motivations.join(', ') || 'varied themes'}. Content that emphasizes ${[...motivations, ...cog].slice(0,3).join(', ') || 'clear value'} should perform well.`;

    const analysis = {
      fb_page_id: pageId,
      page_name: pageName,
      period_days: periodDays,
      posts_analyzed: filteredPosts.length,
      comments_analyzed: commentsAnalyzed,
      summary,
      overall_sentiment: overall,
      top_motivations: motivations,
      cognitive_style_signals: cog,
      risk_profile_signals: risk,
      content_recommendations: [
        'Highlight concrete outcomes and social proof in headlines.',
        'Use visuals that support quick comprehension for intuitive audiences.',
        'Create comparison posts for analytical segments.'
      ],
      ad_recommendations: [
        'Test copy variants tailored to value- and trust-seeking segments.',
        'Retarget commenters with creative mapped to their inferred motivations.'
      ],
      top_posts: postSummaries.slice(0, 5),
      computed_at: new Date().toISOString()
    };

    const created = await base44.entities.MetaPageAnalysis.create(analysis);
    return Response.json({ status: 'ok', analysis: created });
  } catch (error) {
    return Response.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
});