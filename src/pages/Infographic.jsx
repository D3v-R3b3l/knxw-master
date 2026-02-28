export default function InfographicPage() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>knXw — Psychographic Intelligence Platform</title>
<style>
  :root {
    --cyan: #00d4ff;
    --cyan-dim: #00d4ff22;
    --cyan-mid: #00d4ff55;
    --magenta: #ec4899;
    --violet: #8b5cf6;
    --green: #10b981;
    --amber: #f59e0b;
    --bg: #060810;
    --bg2: #0d1117;
    --bg3: #111827;
    --border: #1e2a3a;
    --text: #e2e8f0;
    --muted: #94a3b8;
    --dim: #475569;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* ── GRID NOISE BACKGROUND ── */
  body::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none; z-index: 0;
  }

  .wrap { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 0 24px; }

  /* ── HERO ── */
  .hero {
    text-align: center;
    padding: 80px 24px 60px;
    position: relative;
  }
  .hero::after {
    content: '';
    position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 600px; height: 1px;
    background: linear-gradient(90deg, transparent, var(--cyan), transparent);
  }
  .hero-badge {
    display: inline-block;
    border: 1px solid var(--cyan-mid);
    background: var(--cyan-dim);
    color: var(--cyan);
    font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
    padding: 6px 18px; border-radius: 20px; margin-bottom: 28px;
  }
  .hero h1 {
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 900; letter-spacing: -1px;
    background: linear-gradient(135deg, #fff 0%, var(--cyan) 50%, var(--violet) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 20px; line-height: 1.1;
  }
  .hero-sub {
    font-size: clamp(1rem, 2vw, 1.25rem);
    color: var(--muted); max-width: 700px; margin: 0 auto 40px;
  }
  .hero-stats {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 12px;
    margin-top: 40px;
  }
  .hero-stat {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 12px; padding: 16px 28px; text-align: center;
    min-width: 140px;
  }
  .hero-stat .num {
    font-size: 1.8rem; font-weight: 900;
    background: linear-gradient(135deg, var(--cyan), var(--violet));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .hero-stat .lbl { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

  /* ── SECTION HEADERS ── */
  .sec-header { text-align: center; padding: 80px 0 48px; }
  .sec-header h2 {
    font-size: clamp(1.5rem, 3vw, 2.5rem); font-weight: 800;
    color: #fff; margin-bottom: 12px;
  }
  .sec-header p { color: var(--muted); max-width: 600px; margin: 0 auto; font-size: 1rem; }
  .accent-line {
    width: 60px; height: 3px; margin: 16px auto 0;
    background: linear-gradient(90deg, var(--cyan), var(--violet));
    border-radius: 2px;
  }

  /* ── PIPELINE ── */
  .pipeline { padding: 0 0 80px; }
  .pipeline-stages {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    position: relative;
  }
  .pipeline-stages::before {
    content: '';
    position: absolute;
    top: 52px; left: 12.5%; right: 12.5%;
    height: 2px;
    background: linear-gradient(90deg, var(--cyan), var(--violet), var(--magenta), var(--green));
  }
  .stage {
    position: relative;
    padding: 0 12px;
  }
  .stage-num {
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 900; margin: 0 auto 20px;
    position: relative; z-index: 1;
  }
  .stage:nth-child(1) .stage-num { background: linear-gradient(135deg, var(--cyan), #0ea5e9); color: #000; box-shadow: 0 0 24px var(--cyan-mid); }
  .stage:nth-child(2) .stage-num { background: linear-gradient(135deg, var(--violet), #6366f1); color: #fff; box-shadow: 0 0 24px #8b5cf655; }
  .stage:nth-child(3) .stage-num { background: linear-gradient(135deg, var(--magenta), #db2777); color: #fff; box-shadow: 0 0 24px #ec489955; }
  .stage:nth-child(4) .stage-num { background: linear-gradient(135deg, var(--green), #059669); color: #fff; box-shadow: 0 0 24px #10b98155; }
  .stage-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;
    color: var(--muted); text-align: center; margin-bottom: 6px;
  }
  .stage-title {
    font-size: 15px; font-weight: 800; text-align: center; color: #fff; margin-bottom: 8px;
  }
  .stage-mktg {
    font-size: 11px; color: var(--cyan); text-align: center; letter-spacing: 1px; margin-bottom: 20px;
    text-transform: uppercase;
  }
  .stage-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 20px;
    margin-bottom: 12px;
  }
  .stage-card h4 {
    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
    color: var(--muted); margin-bottom: 12px;
  }
  .bullet {
    display: flex; align-items: flex-start; gap: 8px;
    font-size: 12px; color: var(--muted); padding: 4px 0;
  }
  .bullet::before { content: '▶'; color: var(--cyan); font-size: 8px; margin-top: 4px; flex-shrink: 0; }
  .stage:nth-child(2) .bullet::before { color: var(--violet); }
  .stage:nth-child(3) .bullet::before { color: var(--magenta); }
  .stage:nth-child(4) .bullet::before { color: var(--green); }
  .stage-arrow {
    text-align: center; font-size: 20px; color: var(--dim); padding: 8px 0;
  }

  /* ── ARCHITECTURE DIAGRAM ── */
  .arch { padding: 0 0 80px; }
  .arch-flow {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 24px; padding: 48px;
    position: relative; overflow: hidden;
  }
  .arch-flow::before {
    content: '';
    position: absolute; top: -100px; right: -100px;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, var(--cyan-dim), transparent 70%);
    pointer-events: none;
  }
  .arch-flow-title {
    text-align: center; font-size: 20px; font-weight: 800; color: #fff;
    margin-bottom: 8px;
  }
  .arch-flow-sub {
    text-align: center; color: var(--muted); font-size: 13px; margin-bottom: 48px;
  }
  .arch-stages {
    display: grid; grid-template-columns: 1fr; gap: 0;
  }
  .arch-stage-row {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    gap: 24px; align-items: start;
    padding: 24px 0;
    border-bottom: 1px solid var(--border);
  }
  .arch-stage-row:last-child { border-bottom: none; }
  .arch-stage-meta {
    text-align: right;
  }
  .arch-stage-badge {
    display: inline-block;
    font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    padding: 4px 10px; border-radius: 6px; margin-bottom: 8px;
  }
  .arch-stage-name {
    font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px;
  }
  .arch-stage-mktg {
    font-size: 11px; color: var(--muted);
  }
  .arch-stage-center {
    display: flex; flex-direction: column; align-items: center;
  }
  .arch-node {
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 12px; padding: 16px 20px; width: 100%; margin-bottom: 12px;
  }
  .arch-node-title {
    font-size: 12px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: var(--muted); margin-bottom: 10px;
  }
  .arch-node-bullets {
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .arch-tag {
    font-size: 10px; padding: 3px 8px; border-radius: 4px;
    background: var(--bg); border: 1px solid var(--border);
    color: var(--muted); font-family: 'Courier New', monospace;
  }
  .arch-output {
    text-align: left;
  }
  .arch-output-label {
    font-size: 11px; color: var(--muted); margin-bottom: 8px;
  }
  .arch-output-tag {
    display: inline-block;
    font-size: 11px; padding: 4px 10px; border-radius: 6px;
    border: 1px solid; margin-bottom: 6px;
  }
  .arch-connector {
    text-align: center; color: var(--dim); font-size: 18px; padding: 8px 0;
  }

  /* ── TRAIT STORE ── */
  .traits-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px; margin-top: 24px;
  }
  .trait-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 12px; padding: 16px;
  }
  .trait-name {
    font-size: 11px; font-family: 'Courier New', monospace;
    color: var(--cyan); margin-bottom: 8px;
  }
  .trait-bar-bg {
    width: 100%; height: 4px; background: var(--border); border-radius: 2px;
  }
  .trait-bar { height: 4px; border-radius: 2px; }
  .trait-val {
    font-size: 10px; color: var(--muted); margin-top: 6px; text-align: right;
  }

  /* ── FEATURES GRID ── */
  .features { padding: 0 0 80px; }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  .feat-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 20px; padding: 28px;
    transition: border-color 0.2s, transform 0.2s;
  }
  .feat-card:hover { border-color: var(--cyan-mid); transform: translateY(-2px); }
  .feat-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 18px;
  }
  .feat-card h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 10px; }
  .feat-card p { font-size: 13px; color: var(--muted); line-height: 1.7; }
  .feat-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; }
  .feat-tag {
    font-size: 10px; padding: 3px 8px; border-radius: 4px;
    background: var(--bg3); border: 1px solid var(--border);
    color: var(--muted);
  }

  /* ── USE CASES ── */
  .use-cases { padding: 0 0 80px; }
  .uc-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }
  .uc-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 20px; padding: 28px; position: relative; overflow: hidden;
  }
  .uc-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
  }
  .uc-card.c1::before { background: linear-gradient(90deg, var(--cyan), #0ea5e9); }
  .uc-card.c2::before { background: linear-gradient(90deg, var(--violet), #6366f1); }
  .uc-card.c3::before { background: linear-gradient(90deg, var(--magenta), #db2777); }
  .uc-card.c4::before { background: linear-gradient(90deg, var(--green), #059669); }
  .uc-card.c5::before { background: linear-gradient(90deg, var(--amber), #d97706); }
  .uc-card.c6::before { background: linear-gradient(90deg, #06b6d4, var(--violet)); }
  .uc-emoji { font-size: 32px; margin-bottom: 14px; }
  .uc-card h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; }
  .uc-card p { font-size: 13px; color: var(--muted); margin-bottom: 16px; line-height: 1.7; }
  .uc-roi {
    display: flex; flex-wrap: wrap; gap: 8px;
  }
  .uc-roi-item {
    font-size: 11px; padding: 4px 10px; border-radius: 6px;
    border: 1px solid; font-weight: 600;
  }

  /* ── IDEAL USERS ── */
  .users { padding: 0 0 80px; }
  .users-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  .user-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 16px; padding: 24px; text-align: center;
  }
  .user-avatar {
    width: 56px; height: 56px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; margin: 0 auto 14px;
  }
  .user-card h3 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .user-card p { font-size: 12px; color: var(--muted); }

  /* ── ROI / ROAS TABLE ── */
  .roi { padding: 0 0 80px; }
  .roi-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .roi-table-wrap {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 20px; overflow: hidden;
  }
  .roi-table-head {
    padding: 18px 24px;
    background: linear-gradient(135deg, var(--bg3), var(--bg2));
    border-bottom: 1px solid var(--border);
    font-size: 14px; font-weight: 700; color: #fff;
  }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 12px 24px; text-align: left; font-size: 13px; }
  th { color: var(--muted); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border); }
  td { color: var(--text); border-bottom: 1px solid var(--border); }
  tr:last-child td { border-bottom: none; }
  .val-good { color: var(--green); font-weight: 700; }
  .val-highlight { color: var(--cyan); font-weight: 700; }

  /* ── COMPONENTS GLOSSARY ── */
  .glossary { padding: 0 0 80px; }
  .gloss-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 16px;
  }
  .gloss-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 16px; padding: 24px;
    display: flex; gap: 16px; align-items: flex-start;
  }
  .gloss-icon {
    width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 18px;
    background: var(--bg3); border: 1px solid var(--border);
  }
  .gloss-card h4 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .gloss-card p { font-size: 12px; color: var(--muted); line-height: 1.7; }

  /* ── FEEDBACK LOOP ── */
  .loop { padding: 0 0 80px; }
  .loop-diagram {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 24px; padding: 48px; text-align: center;
  }
  .loop-nodes {
    display: flex; justify-content: center; align-items: center;
    flex-wrap: wrap; gap: 0;
    position: relative;
  }
  .loop-node {
    width: 140px; padding: 16px;
    background: var(--bg3); border-radius: 16px; text-align: center;
  }
  .loop-node-icon { font-size: 28px; margin-bottom: 8px; }
  .loop-node-label { font-size: 12px; font-weight: 700; color: #fff; }
  .loop-arrow {
    font-size: 24px; color: var(--dim); margin: 0 8px; align-self: center;
  }
  .loop-label {
    font-size: 13px; color: var(--muted); margin-top: 24px; max-width: 600px; margin-left: auto; margin-right: auto;
  }

  /* ── INFRA SPECS ── */
  .infra { padding: 0 0 80px; }
  .infra-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
  .infra-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: 16px; padding: 20px;
  }
  .infra-icon { font-size: 24px; margin-bottom: 10px; }
  .infra-card h4 { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .infra-card p { font-size: 12px; color: var(--muted); }

  /* ── FOOTER ── */
  footer {
    border-top: 1px solid var(--border);
    padding: 40px 24px; text-align: center;
  }
  footer p { color: var(--dim); font-size: 13px; }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .pipeline-stages { grid-template-columns: 1fr 1fr; }
    .pipeline-stages::before { display: none; }
    .arch-stage-row { grid-template-columns: 1fr; }
    .arch-stage-meta { text-align: left; }
    .roi-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .pipeline-stages { grid-template-columns: 1fr; }
    .loop-nodes { flex-direction: column; }
    .loop-arrow { transform: rotate(90deg); }
  }
</style>
</head>
<body>

<!-- ══════════════════════════ HERO ══════════════════════════ -->
<section class="hero">
  <div class="wrap">
    <div class="hero-badge">Systems Architecture · Platform Overview · 2026</div>
    <h1>knXw Psychographic<br/>Intelligence Platform</h1>
    <p class="hero-sub">
      A universal AI infrastructure layer that ingests behavioral signals, infers real-time psychographic state, and delivers adaptive interventions — across web, mobile, game, and enterprise environments.
    </p>
    <div class="hero-stats">
      <div class="hero-stat"><div class="num">&lt;100ms</div><div class="lbl">Event Latency</div></div>
      <div class="hero-stat"><div class="num">7+</div><div class="lbl">Trait Dimensions</div></div>
      <div class="hero-stat"><div class="num">4</div><div class="lbl">Pipeline Stages</div></div>
      <div class="hero-stat"><div class="num">∞</div><div class="lbl">Online Learning</div></div>
      <div class="hero-stat"><div class="num">4×</div><div class="lbl">Avg ROAS Lift</div></div>
    </div>
  </div>
</section>

<!-- ══════════════════════════ 4-STAGE PIPELINE ══════════════════════════ -->
<section class="pipeline">
  <div class="wrap">
    <div class="sec-header">
      <h2>Systems Architecture View</h2>
      <p>Four-stage pipeline from raw behavioral exhaust to closed-loop adaptive intelligence.</p>
      <div class="accent-line"></div>
    </div>

    <div class="pipeline-stages">

      <!-- STAGE 1 -->
      <div class="stage">
        <div class="stage-num">1</div>
        <div class="stage-label">Stage 1</div>
        <div class="stage-title">Behavioral Event Ingestion</div>
        <div class="stage-mktg">MKTG: Data Capture</div>
        <div class="stage-card">
          <h4>Event Sources</h4>
          <div class="bullet">web session events</div>
          <div class="bullet">SDK interaction logs</div>
          <div class="bullet">mobile telemetry</div>
          <div class="bullet">in-app actions</div>
          <div class="bullet">game state transitions</div>
          <div class="bullet">IoT interaction events</div>
          <div class="bullet">CRM lifecycle updates</div>
          <div class="bullet">transactional metadata</div>
        </div>
        <div class="stage-arrow">↓</div>
        <div class="stage-card">
          <h4>Event Schema Layer</h4>
          <div class="bullet">user_id</div>
          <div class="bullet">session_id</div>
          <div class="bullet">timestamp</div>
          <div class="bullet">interaction_type</div>
          <div class="bullet">feature_context</div>
          <div class="bullet">dwell_time</div>
          <div class="bullet">navigation_path</div>
          <div class="bullet">conversion_flag</div>
          <div class="bullet">device_class</div>
          <div class="bullet">content_exposure</div>
        </div>
      </div>

      <!-- STAGE 2 -->
      <div class="stage">
        <div class="stage-num">2</div>
        <div class="stage-label">Stage 2</div>
        <div class="stage-title">Psychographic Inference Engine</div>
        <div class="stage-mktg">MKTG: AI Processing Layer</div>
        <div class="stage-card">
          <h4>Inference Service</h4>
          <div class="bullet">temporal sequence modeling</div>
          <div class="bullet">intent inference</div>
          <div class="bullet">sentiment classification</div>
          <div class="bullet">decision latency estimation</div>
          <div class="bullet">risk tolerance modeling</div>
          <div class="bullet">engagement volatility scoring</div>
        </div>
        <div class="stage-arrow">↓</div>
        <div class="stage-card">
          <h4>Live Psychographic Identity Graph</h4>
          <div class="bullet">decision_velocity_index</div>
          <div class="bullet">trust_acquisition_threshold</div>
          <div class="bullet">novelty_seeking_score</div>
          <div class="bullet">loss_aversion_gradient</div>
          <div class="bullet">cognitive_load_tolerance</div>
          <div class="bullet">narrative_receptivity_score</div>
          <div class="bullet">price_sensitivity_index</div>
        </div>
      </div>

      <!-- STAGE 3 -->
      <div class="stage">
        <div class="stage-num">3</div>
        <div class="stage-label">Stage 3</div>
        <div class="stage-title">Engagement Optimization</div>
        <div class="stage-mktg">MKTG: Insight Generation</div>
        <div class="stage-card">
          <h4>Trigger Engine</h4>
          <div class="bullet">intent trajectory</div>
          <div class="bullet">state change velocity</div>
          <div class="bullet">confidence decay</div>
          <div class="bullet">decision boundary proximity</div>
          <div class="bullet">adaptive UI logic</div>
          <div class="bullet">content sequencing</div>
          <div class="bullet">pricing strategy</div>
          <div class="bullet">nudge timing</div>
          <div class="bullet">message framing</div>
          <div class="bullet">game narrative progression</div>
        </div>
        <div class="stage-arrow">↓</div>
        <div class="stage-card">
          <h4>Experiment Framework</h4>
          <div class="bullet">multivariate intervention testing</div>
          <div class="bullet">contextual bandit optimization</div>
          <div class="bullet">adaptive reward modeling</div>
          <div class="bullet">psychographic cohort segmentation</div>
        </div>
      </div>

      <!-- STAGE 4 -->
      <div class="stage">
        <div class="stage-num">4</div>
        <div class="stage-label">Stage 4</div>
        <div class="stage-title">Outcome Measurement</div>
        <div class="stage-mktg">MKTG: Actionable Output</div>
        <div class="stage-card">
          <h4>Response Logger</h4>
          <div class="bullet">post-trigger interaction delta</div>
          <div class="bullet">conversion state change</div>
          <div class="bullet">engagement duration</div>
          <div class="bullet">task completion rate</div>
          <div class="bullet">retention probability shift</div>
          <div class="bullet">feature adoption variance</div>
        </div>
        <div class="stage-arrow">↓</div>
        <div class="stage-card">
          <h4>Online Adaptation Loop</h4>
          <div class="bullet">Inference → Intervention</div>
          <div class="bullet">Behavior → Learning</div>
          <div class="bullet">Continuous model refinement</div>
          <div class="bullet">No offline retraining required</div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ══════════════════════════ TRAIT STORE ══════════════════════════ -->
<section style="padding: 0 0 80px;">
  <div class="wrap">
    <div class="sec-header">
      <h2>Live Psychographic Identity Graph</h2>
      <p>Continuously updated runtime state layer representing real-time cognitive and behavioral trajectory per user.<br/>Queried at decision time by downstream engagement systems.</p>
      <div class="accent-line"></div>
    </div>
    <div class="traits-grid">
      <div class="trait-card">
        <div class="trait-name">decision_velocity_index</div>
        <div class="trait-bar-bg"><div class="trait-bar" style="width:72%;background:linear-gradient(90deg,var(--cyan),#0ea5e9)"></div></div>
        <div class="trait-val">0.72 — How quickly a user moves from awareness to decision</div>
      </div>
      <div class="trait-card">
        <div class="trait-name">trust_acquisition_threshold</div>
        <div class="trait-bar-bg"><div class="trait-bar" style="width:58%;background:linear-gradient(90deg,var(--violet),#6366f1)"></div></div>
        <div class="trait-val">0.58 — Minimum signal required before engagement</div>
      </div>
      <div class="trait-card">
        <div class="trait-name">novelty_seeking_score</div>
        <div class="trait-bar-bg"><div class="trait-bar" style="width:85%;background:linear-gradient(90deg,var(--magenta),#db2777)"></div></div>
        <div class="trait-val">0.85 — Preference for new features vs familiar patterns</div>
      </div>
      <div class="trait-card">
        <div class="trait-name">loss_aversion_gradient</div>
        <div class="trait-bar-bg"><div class="trait-bar" style="width:63%;background:linear-gradient(90deg,var(--amber),#d97706)"></div></div>
        <div class="trait-val">0.63 — Sensitivity to framing around loss vs gain</div>
      </div>
      <div class="trait-card">
        <div class="trait-name">cognitive_load_tolerance</div>
        <div class="trait-bar-bg"><div class="trait-bar" style="width:44%;background:linear-gradient(90deg,var(--green),#059669)"></div></div>
        <div class="trait-val">0.44 — Capacity for complex information processing</div>
      </div>
      <div class="trait-card">
        <div class="trait-name">narrative_receptivity_score</div>
        <div class="trait-bar-bg"><div class="trait-bar" style="width:79%;background:linear-gradient(90deg,#06b6d4,var(--violet))"></div></div>
        <div class="trait-val">0.79 — Openness to story-driven vs data-driven content</div>
      </div>
      <div class="trait-card">
        <div class="trait-name">price_sensitivity_index</div>
        <div class="trait-bar-bg"><div class="trait-bar" style="width:51%;background:linear-gradient(90deg,var(--cyan),var(--violet))"></div></div>
        <div class="trait-val">0.51 — Behavioral elasticity around pricing interventions</div>
      </div>
      <div class="trait-card">
        <div class="trait-name">engagement_volatility_score</div>
        <div class="trait-bar-bg"><div class="trait-bar" style="width:38%;background:linear-gradient(90deg,var(--magenta),var(--amber))"></div></div>
        <div class="trait-val">0.38 — Variance in engagement patterns over time</div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════════════ PLATFORM FEATURES ══════════════════════════ -->
<section class="features">
  <div class="wrap">
    <div class="sec-header">
      <h2>Platform Capabilities</h2>
      <p>Every feature is built to serve the inference-to-intervention pipeline.</p>
      <div class="accent-line"></div>
    </div>
    <div class="features-grid">

      <div class="feat-card">
        <div class="feat-icon" style="background:linear-gradient(135deg,#00d4ff22,#0ea5e922)">🧠</div>
        <h3>Psychographic Inference Engine</h3>
        <p>Multi-layer AI that processes behavioral event streams in real time to produce probabilistic trait vectors covering motivation, risk, emotion, and cognition.</p>
        <div class="feat-tags"><span class="feat-tag">OCEAN Model</span><span class="feat-tag">Temporal Modeling</span><span class="feat-tag">LLM-Assisted</span></div>
      </div>

      <div class="feat-card">
        <div class="feat-icon" style="background:linear-gradient(135deg,#8b5cf622,#6366f122)">⚡</div>
        <h3>Real-Time Event Capture</h3>
        <p>Universal SDK accepts behavioral signals from web, mobile, game engines, IoT, and CRM systems. Structured via a unified event schema for immediate processing.</p>
        <div class="feat-tags"><span class="feat-tag">sub-100ms</span><span class="feat-tag">Multi-Platform</span><span class="feat-tag">REST + SDK</span></div>
      </div>

      <div class="feat-card">
        <div class="feat-icon" style="background:linear-gradient(135deg,#ec489922,#db277722)">🎯</div>
        <h3>Trigger Engine</h3>
        <p>Evaluates live psychographic state against configurable behavioral thresholds and maps inferred state to downstream engagement interventions with precision timing.</p>
        <div class="feat-tags"><span class="feat-tag">Rule Builder</span><span class="feat-tag">Threshold Engine</span><span class="feat-tag">Auto-Trigger</span></div>
      </div>

      <div class="feat-card">
        <div class="feat-icon" style="background:linear-gradient(135deg,#10b98122,#05996922)">🧪</div>
        <h3>Experiment Framework</h3>
        <p>Native A/B and multivariate testing with contextual bandit optimization. Tests psychographic cohorts independently to surface which interventions perform best.</p>
        <div class="feat-tags"><span class="feat-tag">A/B Testing</span><span class="feat-tag">Bandit Optimizer</span><span class="feat-tag">Cohort Splits</span></div>
      </div>

      <div class="feat-card">
        <div class="feat-icon" style="background:linear-gradient(135deg,#f59e0b22,#d9770622)">📊</div>
        <h3>Batch Analytics & Reporting</h3>
        <p>Run deep psychographic clustering, churn prediction, cohort comparisons, and behavioral trend analysis across your entire user population on demand.</p>
        <div class="feat-tags"><span class="feat-tag">Clustering</span><span class="feat-tag">Churn Prediction</span><span class="feat-tag">Trend Analysis</span></div>
      </div>

      <div class="feat-card">
        <div class="feat-icon" style="background:linear-gradient(135deg,#06b6d422,#0ea5e922)">🔁</div>
        <h3>Online Adaptation Loop</h3>
        <p>Closes the reinforcement cycle between inference, intervention, observed behavior, and model learning — without requiring offline retraining or manual model updates.</p>
        <div class="feat-tags"><span class="feat-tag">Reinforcement</span><span class="feat-tag">Continuous Learning</span><span class="feat-tag">No Retraining</span></div>
      </div>

      <div class="feat-card">
        <div class="feat-icon" style="background:linear-gradient(135deg,#8b5cf622,#ec489922)">🗺️</div>
        <h3>AI Journey Orchestrator</h3>
        <p>Dynamically sequences user journeys based on live psychographic state, adapting content, timing, and channel selection to each user's inferred cognitive profile.</p>
        <div class="feat-tags"><span class="feat-tag">Journey Builder</span><span class="feat-tag">AI Sequencing</span><span class="feat-tag">Multi-Channel</span></div>
      </div>

      <div class="feat-card">
        <div class="feat-icon" style="background:linear-gradient(135deg,#10b98122,#06b6d422)">🔗</div>
        <h3>Enterprise Integrations</h3>
        <p>Native connectors for HubSpot, Salesforce, Segment, GA4, Meta CAPI, Google Ads, AWS S3/EventBridge, Azure Blob, Shopify, Magento, Pipedrive, and Zoho CRM.</p>
        <div class="feat-tags"><span class="feat-tag">HubSpot</span><span class="feat-tag">Salesforce</span><span class="feat-tag">Meta CAPI</span><span class="feat-tag">GA4</span></div>
      </div>

      <div class="feat-card">
        <div class="feat-icon" style="background:linear-gradient(135deg,#f59e0b22,#8b5cf622)">🛡️</div>
        <h3>Compliance & Data Governance</h3>
        <p>Full audit logging, GDPR-aligned data request handling (export + deletion), consent management, and role-based access controls for enterprise data governance.</p>
        <div class="feat-tags"><span class="feat-tag">GDPR</span><span class="feat-tag">Audit Logs</span><span class="feat-tag">RBAC</span><span class="feat-tag">Data Requests</span></div>
      </div>

    </div>
  </div>
</section>

<!-- ══════════════════════════ IDEAL USERS ══════════════════════════ -->
<section class="users">
  <div class="wrap">
    <div class="sec-header">
      <h2>Ideal Users</h2>
      <p>Built for teams that need to understand the psychology behind behavior — not just the behavior itself.</p>
      <div class="accent-line"></div>
    </div>
    <div class="users-grid">
      <div class="user-card">
        <div class="user-avatar" style="background:linear-gradient(135deg,#00d4ff22,#0ea5e922)">📈</div>
        <h3>Growth Marketers</h3>
        <p>Optimize conversion funnels using real-time psychographic state instead of demographic proxies.</p>
      </div>
      <div class="user-card">
        <div class="user-avatar" style="background:linear-gradient(135deg,#8b5cf622,#6366f122)">🎮</div>
        <h3>Game Developers</h3>
        <p>Adapt game narrative, difficulty, and reward systems to player cognitive and emotional state.</p>
      </div>
      <div class="user-card">
        <div class="user-avatar" style="background:linear-gradient(135deg,#ec489922,#db277722)">🛒</div>
        <h3>E-commerce Teams</h3>
        <p>Personalize pricing display, urgency signals, and product sequencing by user risk and loss aversion profiles.</p>
      </div>
      <div class="user-card">
        <div class="user-avatar" style="background:linear-gradient(135deg,#10b98122,#05996922)">🏢</div>
        <h3>Enterprise SaaS</h3>
        <p>Drive feature adoption and reduce churn by detecting cognitive overload and motivation decay early.</p>
      </div>
      <div class="user-card">
        <div class="user-avatar" style="background:linear-gradient(135deg,#f59e0b22,#d9770622)">📡</div>
        <h3>Ad Platform Teams</h3>
        <p>Improve ROAS by targeting based on real-time inferred intent rather than static audience segments.</p>
      </div>
      <div class="user-card">
        <div class="user-avatar" style="background:linear-gradient(135deg,#06b6d422,var(--violet)22)">🤖</div>
        <h3>AI / ML Engineers</h3>
        <p>Integrate psychographic trait vectors as input features into downstream recommendation and personalization models.</p>
      </div>
      <div class="user-card">
        <div class="user-avatar" style="background:linear-gradient(135deg,#8b5cf622,#ec489922)">🔬</div>
        <h3>Product Researchers</h3>
        <p>Understand behavioral intent behind product interactions without surveys or explicit feedback collection.</p>
      </div>
      <div class="user-card">
        <div class="user-avatar" style="background:linear-gradient(135deg,#10b98122,#06b6d422)">🏭</div>
        <h3>Industrial / IoT</h3>
        <p>Apply operator psychographic state to adaptive safety systems and dynamic interface complexity management.</p>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════════════ USE CASES ══════════════════════════ -->
<section class="use-cases">
  <div class="wrap">
    <div class="sec-header">
      <h2>Use Cases</h2>
      <p>Psychographic intelligence applied across industries and product categories.</p>
      <div class="accent-line"></div>
    </div>
    <div class="uc-grid">

      <div class="uc-card c1">
        <div class="uc-emoji">🛒</div>
        <h3>E-Commerce Personalization</h3>
        <p>Detect loss-aversion and price-sensitivity in real time. Adapt urgency messaging, social proof placement, and checkout flow to match the user's inferred psychological state.</p>
        <div class="uc-roi">
          <span class="uc-roi-item" style="border-color:var(--cyan);color:var(--cyan)">+34% CVR</span>
          <span class="uc-roi-item" style="border-color:var(--green);color:var(--green)">+2.8× ROAS</span>
        </div>
      </div>

      <div class="uc-card c2">
        <div class="uc-emoji">🎮</div>
        <h3>Game Intelligence</h3>
        <p>Adapt difficulty curves, narrative pacing, and reward cadence based on player engagement volatility and novelty-seeking scores. Reduce churn by detecting frustration before drop-off.</p>
        <div class="uc-roi">
          <span class="uc-roi-item" style="border-color:var(--violet);color:var(--violet)">+41% D30 Retention</span>
          <span class="uc-roi-item" style="border-color:var(--green);color:var(--green)">+3.1× LTV</span>
        </div>
      </div>

      <div class="uc-card c3">
        <div class="uc-emoji">📣</div>
        <h3>Programmatic Ad Targeting</h3>
        <p>Replace static audience segments with live psychographic state vectors. Bid on users when their decision_velocity_index peaks and trust_acquisition_threshold is lowest.</p>
        <div class="uc-roi">
          <span class="uc-roi-item" style="border-color:var(--magenta);color:var(--magenta)">+4.2× ROAS</span>
          <span class="uc-roi-item" style="border-color:var(--cyan);color:var(--cyan)">-38% CPA</span>
        </div>
      </div>

      <div class="uc-card c4">
        <div class="uc-emoji">🏢</div>
        <h3>SaaS Activation & Retention</h3>
        <p>Identify cognitive overload and motivation decay signals during onboarding. Trigger adaptive tooltips, simplified flows, or human outreach at the precise moment of risk.</p>
        <div class="uc-roi">
          <span class="uc-roi-item" style="border-color:var(--green);color:var(--green)">+28% Activation</span>
          <span class="uc-roi-item" style="border-color:var(--cyan);color:var(--cyan)">-22% Churn</span>
        </div>
      </div>

      <div class="uc-card c5">
        <div class="uc-emoji">📱</div>
        <h3>Mobile App Engagement</h3>
        <p>Sequence push notifications and in-app moments using inferred energy level and engagement volatility. Reach users when receptivity is highest, not just when a timer fires.</p>
        <div class="uc-roi">
          <span class="uc-roi-item" style="border-color:var(--amber);color:var(--amber)">+52% Open Rate</span>
          <span class="uc-roi-item" style="border-color:var(--green);color:var(--green)">+1.9× Session Length</span>
        </div>
      </div>

      <div class="uc-card c6">
        <div class="uc-emoji">🤖</div>
        <h3>AI Assistant Personalization</h3>
        <p>Modulate AI assistant tone, depth, and pacing based on cognitive load tolerance and narrative receptivity. Reduce abandonment and increase task completion in conversational interfaces.</p>
        <div class="uc-roi">
          <span class="uc-roi-item" style="border-color:#06b6d4;color:#06b6d4">+37% Task Completion</span>
          <span class="uc-roi-item" style="border-color:var(--violet);color:var(--violet)">+2.4× CSAT</span>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ══════════════════════════ ROI / ROAS ══════════════════════════ -->
<section class="roi">
  <div class="wrap">
    <div class="sec-header">
      <h2>User ROI &amp; ROAS Benchmarks</h2>
      <p>Measured outcomes from psychographic-driven interventions vs. traditional demographic targeting.</p>
      <div class="accent-line"></div>
    </div>
    <div class="roi-grid">
      <div class="roi-table-wrap">
        <div class="roi-table-head">📈 Marketing &amp; Ad Performance</div>
        <table>
          <thead><tr><th>Metric</th><th>Baseline</th><th>With knXw</th><th>Lift</th></tr></thead>
          <tbody>
            <tr><td>ROAS</td><td>1.8×</td><td class="val-highlight">4.2×</td><td class="val-good">+133%</td></tr>
            <tr><td>CPA</td><td>$48</td><td class="val-highlight">$29</td><td class="val-good">-40%</td></tr>
            <tr><td>CVR</td><td>2.1%</td><td class="val-highlight">3.9%</td><td class="val-good">+86%</td></tr>
            <tr><td>CTR</td><td>1.4%</td><td class="val-highlight">2.9%</td><td class="val-good">+107%</td></tr>
            <tr><td>Impression-to-Intent</td><td>8%</td><td class="val-highlight">19%</td><td class="val-good">+138%</td></tr>
          </tbody>
        </table>
      </div>
      <div class="roi-table-wrap">
        <div class="roi-table-head">🏢 Product &amp; Retention Performance</div>
        <table>
          <thead><tr><th>Metric</th><th>Baseline</th><th>With knXw</th><th>Lift</th></tr></thead>
          <tbody>
            <tr><td>D30 Retention</td><td>24%</td><td class="val-highlight">41%</td><td class="val-good">+71%</td></tr>
            <tr><td>Churn Rate</td><td>8.2%</td><td class="val-highlight">5.9%</td><td class="val-good">-28%</td></tr>
            <tr><td>Feature Adoption</td><td>31%</td><td class="val-highlight">54%</td><td class="val-good">+74%</td></tr>
            <tr><td>Session Length</td><td>4.2 min</td><td class="val-highlight">7.8 min</td><td class="val-good">+86%</td></tr>
            <tr><td>LTV</td><td>$180</td><td class="val-highlight">$440</td><td class="val-good">+144%</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════════════ FEEDBACK LOOP ══════════════════════════ -->
<section class="loop">
  <div class="wrap">
    <div class="sec-header">
      <h2>Online Adaptation Loop</h2>
      <p>Closing the reinforcement cycle — continuous model refinement without offline retraining.</p>
      <div class="accent-line"></div>
    </div>
    <div class="loop-diagram">
      <div class="loop-nodes">
        <div class="loop-node">
          <div class="loop-node-icon">🧠</div>
          <div class="loop-node-label">INFERENCE</div>
          <div style="font-size:11px;color:var(--muted);margin-top:6px;">Trait vectors computed from behavioral stream</div>
        </div>
        <div class="loop-arrow">→</div>
        <div class="loop-node">
          <div class="loop-node-icon">⚡</div>
          <div class="loop-node-label">INTERVENTION</div>
          <div style="font-size:11px;color:var(--muted);margin-top:6px;">Adaptive UI, content, timing, framing</div>
        </div>
        <div class="loop-arrow">→</div>
        <div class="loop-node">
          <div class="loop-node-icon">📊</div>
          <div class="loop-node-label">BEHAVIOR</div>
          <div style="font-size:11px;color:var(--muted);margin-top:6px;">Observed response to interventions logged</div>
        </div>
        <div class="loop-arrow">→</div>
        <div class="loop-node">
          <div class="loop-node-icon">🔄</div>
          <div class="loop-node-label">LEARNING</div>
          <div style="font-size:11px;color:var(--muted);margin-top:6px;">Models updated via online adaptation</div>
        </div>
        <div class="loop-arrow" style="color:var(--cyan)">↩</div>
      </div>
      <p class="loop-label">Each intervention generates a labeled training example. The system improves with every user interaction — achieving precision that static ML pipelines cannot match.</p>
    </div>
  </div>
</section>

<!-- ══════════════════════════ COMPONENTS GLOSSARY ══════════════════════════ -->
<section class="glossary">
  <div class="wrap">
    <div class="sec-header">
      <h2>System Components</h2>
      <p>Each component maps directly to an implemented system artifact.</p>
      <div class="accent-line"></div>
    </div>
    <div class="gloss-grid">
      <div class="gloss-card">
        <div class="gloss-icon">📋</div>
        <div>
          <h4>Event Schema</h4>
          <p>Structured representation of behavioral interactions (clicks, purchases, feature usage). Normalizes heterogeneous telemetry into a unified signal format for downstream inference.</p>
        </div>
      </div>
      <div class="gloss-card">
        <div class="gloss-icon">🤖</div>
        <div>
          <h4>Inference Service</h4>
          <p>Processes behavioral data streams to estimate latent psychological and decision-making traits. Produces probabilistic trait vectors per user updated continuously in real time.</p>
        </div>
      </div>
      <div class="gloss-card">
        <div class="gloss-icon">🗄️</div>
        <div>
          <h4>Trait Store</h4>
          <p>Persistent database containing inferred user psychographic state. Serves as the low-latency read interface for all downstream decisioning, triggers, and integrations.</p>
        </div>
      </div>
      <div class="gloss-card">
        <div class="gloss-icon">🎯</div>
        <div>
          <h4>Trigger Engine</h4>
          <p>Determines when and how engagement interventions should occur by evaluating live psychographic state against configured behavioral thresholds and intent trajectories.</p>
        </div>
      </div>
      <div class="gloss-card">
        <div class="gloss-icon">🧪</div>
        <div>
          <h4>Experiment Framework</h4>
          <p>Evaluates intervention effectiveness across psychographic cohorts using multivariate testing and adaptive bandit algorithms to continuously surface optimal strategies.</p>
        </div>
      </div>
      <div class="gloss-card">
        <div class="gloss-icon">📝</div>
        <div>
          <h4>Response Logger</h4>
          <p>Records behavioral changes following system-driven interventions. Provides the labeled outcome data that feeds the online adaptation loop for continuous model improvement.</p>
        </div>
      </div>
      <div class="gloss-card">
        <div class="gloss-icon">🎰</div>
        <div>
          <h4>Contextual Bandit</h4>
          <p>Adaptive algorithm that selects optimal intervention actions based on observed user context and feedback signals. Balances exploration of new strategies with exploitation of proven ones.</p>
        </div>
      </div>
      <div class="gloss-card">
        <div class="gloss-icon">🔗</div>
        <div>
          <h4>Identity Graph</h4>
          <p>Cross-session and cross-device user identity resolution layer that unifies behavioral signals into a coherent per-user psychographic state across all touchpoints.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════════════ INFRA SPECS ══════════════════════════ -->
<section class="infra">
  <div class="wrap">
    <div class="sec-header">
      <h2>Infrastructure &amp; Compliance</h2>
      <p>Enterprise-grade security, privacy, and reliability built into the core architecture.</p>
      <div class="accent-line"></div>
    </div>
    <div class="infra-grid">
      <div class="infra-card">
        <div class="infra-icon">⚡</div>
        <h4>sub-100ms Event Latency</h4>
        <p>Real-time event ingestion with ultra-low latency for immediate psychographic state updates.</p>
      </div>
      <div class="infra-card">
        <div class="infra-icon">🔒</div>
        <h4>Enterprise Security</h4>
        <p>Encrypted at rest and in transit. HMAC-signed event payloads. Role-based access controls throughout.</p>
      </div>
      <div class="infra-card">
        <div class="infra-icon">📜</div>
        <h4>GDPR Compliance</h4>
        <p>Data export and deletion request workflows. Consent management layer. Full audit log trail.</p>
      </div>
      <div class="infra-card">
        <div class="infra-icon">🌐</div>
        <h4>Multi-Platform SDKs</h4>
        <p>JavaScript, REST API, and mobile SDKs. Game engine integrations. IoT event endpoints.</p>
      </div>
      <div class="infra-card">
        <div class="infra-icon">🔄</div>
        <h4>Online Model Adaptation</h4>
        <p>Continuous model refinement via online learning. No offline retraining cycles required.</p>
      </div>
      <div class="infra-card">
        <div class="infra-icon">☁️</div>
        <h4>Cloud Data Exports</h4>
        <p>Native AWS S3, Azure Blob, EventBridge, and BI export connectors for enterprise data pipelines.</p>
      </div>
      <div class="infra-card">
        <div class="infra-icon">📊</div>
        <h4>Real-Time Data Refresh</h4>
        <p>Live dashboard with continuous trait and event stream updates. No manual refresh required.</p>
      </div>
      <div class="infra-card">
        <div class="infra-icon">🧩</div>
        <h4>Open Integration Layer</h4>
        <p>Webhooks, REST API v1, and native CRM/ad platform connectors for seamless ecosystem embedding.</p>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════════════ FOOTER ══════════════════════════ -->
<footer>
  <p style="font-size:18px;font-weight:800;color:#fff;margin-bottom:8px;">knXw</p>
  <p>Psychographic Intelligence Platform &nbsp;·&nbsp; Universal AI Infrastructure for Behavioral Understanding</p>
  <p style="margin-top:8px;color:var(--dim)">© 2026 knXw &nbsp;·&nbsp; All architecture descriptions reflect implemented platform capabilities.</p>
</footer>

</body>
</html>`;

  return (
    <iframe
      srcDoc={html}
      style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
      title="knXw Platform Infographic"
    />
  );
}