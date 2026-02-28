export default function InfographicPage() {
  return (
    <>
      <style>{`
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
        .ig * { box-sizing: border-box; }
        .ig { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; overflow-x: hidden; min-height: 100vh; position: relative; }
        .ig::before { content: ''; position: fixed; inset: 0; background-image: linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: 0; }
        .ig .wrap { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 0 24px; }

        /* HERO */
        .ig .hero { text-align: center; padding: 80px 24px 60px; position: relative; }
        .ig .hero::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 600px; height: 1px; background: linear-gradient(90deg, transparent, var(--cyan), transparent); }
        .ig .hero-badge { display: inline-block; border: 1px solid var(--cyan-mid); background: var(--cyan-dim); color: var(--cyan); font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; padding: 6px 18px; border-radius: 20px; margin-bottom: 28px; }
        .ig .hero h1 { font-size: clamp(2rem, 5vw, 4rem); font-weight: 900; letter-spacing: -1px; background: linear-gradient(135deg, #fff 0%, var(--cyan) 50%, var(--violet) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px; line-height: 1.1; }
        .ig .hero-sub { font-size: clamp(1rem, 2vw, 1.25rem); color: var(--muted); max-width: 700px; margin: 0 auto 40px; }
        .ig .hero-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 40px; }
        .ig .hero-stat { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 16px 28px; text-align: center; min-width: 140px; }
        .ig .hero-stat .num { font-size: 1.8rem; font-weight: 900; background: linear-gradient(135deg, var(--cyan), var(--violet)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .ig .hero-stat .lbl { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

        /* SECTION HEADERS */
        .ig .sec-header { text-align: center; padding: 80px 0 48px; }
        .ig .sec-header h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); font-weight: 800; color: #fff; margin-bottom: 12px; }
        .ig .sec-header p { color: var(--muted); max-width: 600px; margin: 0 auto; font-size: 1rem; }
        .ig .accent-line { width: 60px; height: 3px; margin: 16px auto 0; background: linear-gradient(90deg, var(--cyan), var(--violet)); border-radius: 2px; }

        /* PIPELINE */
        .ig .pipeline { padding: 0 0 80px; }
        .ig .pipeline-stages { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative; }
        .ig .pipeline-stages::before { content: ''; position: absolute; top: 52px; left: 12.5%; right: 12.5%; height: 2px; background: linear-gradient(90deg, var(--cyan), var(--violet), var(--magenta), var(--green)); }
        .ig .stage { position: relative; padding: 0 12px; }
        .ig .stage-num { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; margin: 0 auto 20px; position: relative; z-index: 1; }
        .ig .stage:nth-child(1) .stage-num { background: linear-gradient(135deg, var(--cyan), #0ea5e9); color: #000; box-shadow: 0 0 24px var(--cyan-mid); }
        .ig .stage:nth-child(2) .stage-num { background: linear-gradient(135deg, var(--violet), #6366f1); color: #fff; box-shadow: 0 0 24px #8b5cf655; }
        .ig .stage:nth-child(3) .stage-num { background: linear-gradient(135deg, var(--magenta), #db2777); color: #fff; box-shadow: 0 0 24px #ec489955; }
        .ig .stage:nth-child(4) .stage-num { background: linear-gradient(135deg, var(--green), #059669); color: #fff; box-shadow: 0 0 24px #10b98155; }
        .ig .stage-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); text-align: center; margin-bottom: 6px; }
        .ig .stage-title { font-size: 15px; font-weight: 800; text-align: center; color: #fff; margin-bottom: 8px; }
        .ig .stage-mktg { font-size: 11px; color: var(--cyan); text-align: center; letter-spacing: 1px; margin-bottom: 20px; text-transform: uppercase; }
        .ig .stage-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 20px; margin-bottom: 12px; }
        .ig .stage-card h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 12px; }
        .ig .bullet { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: var(--muted); padding: 4px 0; }
        .ig .bullet::before { content: '▶'; color: var(--cyan); font-size: 8px; margin-top: 4px; flex-shrink: 0; }
        .ig .stage:nth-child(2) .bullet::before { color: var(--violet); }
        .ig .stage:nth-child(3) .bullet::before { color: var(--magenta); }
        .ig .stage:nth-child(4) .bullet::before { color: var(--green); }
        .ig .stage-arrow { text-align: center; font-size: 20px; color: var(--dim); padding: 8px 0; }
        .ig .stage-query-bridge { position: absolute; top: 52px; left: 50%; transform: translate(-50%, -50%); z-index: 2; }
        .ig .stage-query-badge { background: var(--bg); border: 1px solid var(--cyan-mid); color: var(--cyan); font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 10px; white-space: nowrap; }

        /* TRAIT STORE */
        .ig .traits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 24px; }
        .ig .trait-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
        .ig .trait-name { font-size: 11px; font-family: 'Courier New', monospace; color: var(--cyan); margin-bottom: 8px; }
        .ig .trait-bar-bg { width: 100%; height: 4px; background: var(--border); border-radius: 2px; }
        .ig .trait-bar { height: 4px; border-radius: 2px; }
        .ig .trait-val { font-size: 10px; color: var(--muted); margin-top: 6px; text-align: right; }

        /* FEATURES */
        .ig .features { padding: 0 0 80px; }
        .ig .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .ig .feat-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; padding: 28px; transition: border-color 0.2s, transform 0.2s; }
        .ig .feat-card:hover { border-color: var(--cyan-mid); transform: translateY(-2px); }
        .ig .feat-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 18px; }
        .ig .feat-card h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .ig .feat-card p { font-size: 13px; color: var(--muted); line-height: 1.7; }
        .ig .feat-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; }
        .ig .feat-tag { font-size: 10px; padding: 3px 8px; border-radius: 4px; background: var(--bg3); border: 1px solid var(--border); color: var(--muted); }

        /* USE CASES */
        .ig .use-cases { padding: 0 0 80px; }
        .ig .uc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .ig .uc-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; padding: 28px; position: relative; overflow: hidden; }
        .ig .uc-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .ig .uc-card.c1::before { background: linear-gradient(90deg, var(--cyan), #0ea5e9); }
        .ig .uc-card.c2::before { background: linear-gradient(90deg, var(--violet), #6366f1); }
        .ig .uc-card.c3::before { background: linear-gradient(90deg, var(--magenta), #db2777); }
        .ig .uc-card.c4::before { background: linear-gradient(90deg, var(--green), #059669); }
        .ig .uc-card.c5::before { background: linear-gradient(90deg, var(--amber), #d97706); }
        .ig .uc-card.c6::before { background: linear-gradient(90deg, #06b6d4, var(--violet)); }
        .ig .uc-emoji { font-size: 32px; margin-bottom: 14px; }
        .ig .uc-card h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .ig .uc-card p { font-size: 13px; color: var(--muted); margin-bottom: 16px; line-height: 1.7; }
        .ig .uc-roi { display: flex; flex-wrap: wrap; gap: 8px; }
        .ig .uc-roi-item { font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 1px solid; font-weight: 600; }

        /* IDEAL USERS */
        .ig .users { padding: 0 0 80px; }
        .ig .users-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .ig .user-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 24px; text-align: center; }
        .ig .user-avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 14px; }
        .ig .user-card h3 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .ig .user-card p { font-size: 12px; color: var(--muted); }

        /* ROI TABLE */
        .ig .roi { padding: 0 0 80px; }
        .ig .roi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .ig .roi-table-wrap { background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
        .ig .roi-table-head { padding: 18px 24px; background: linear-gradient(135deg, var(--bg3), var(--bg2)); border-bottom: 1px solid var(--border); font-size: 14px; font-weight: 700; color: #fff; }
        .ig table { width: 100%; border-collapse: collapse; }
        .ig th, .ig td { padding: 12px 24px; text-align: left; font-size: 13px; }
        .ig th { color: var(--muted); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid var(--border); }
        .ig td { color: var(--text); border-bottom: 1px solid var(--border); }
        .ig tr:last-child td { border-bottom: none; }
        .ig .val-good { color: var(--green); font-weight: 700; }
        .ig .val-highlight { color: var(--cyan); font-weight: 700; }

        /* GLOSSARY */
        .ig .glossary { padding: 0 0 80px; }
        .ig .gloss-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
        .ig .gloss-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; gap: 16px; align-items: flex-start; }
        .ig .gloss-icon { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; background: var(--bg3); border: 1px solid var(--border); }
        .ig .gloss-card h4 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .ig .gloss-card p { font-size: 12px; color: var(--muted); line-height: 1.7; }

        /* FEEDBACK LOOP */
        .ig .loop { padding: 0 0 80px; }
        .ig .loop-diagram { background: var(--bg2); border: 1px solid var(--border); border-radius: 24px; padding: 48px; text-align: center; }
        .ig .loop-nodes { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 0; position: relative; }
        .ig .loop-node { width: 140px; padding: 16px; background: var(--bg3); border-radius: 16px; text-align: center; }
        .ig .loop-node-icon { font-size: 28px; margin-bottom: 8px; }
        .ig .loop-node-label { font-size: 12px; font-weight: 700; color: #fff; }
        .ig .loop-arrow { font-size: 24px; color: var(--dim); margin: 0 8px; align-self: center; }
        .ig .loop-label { font-size: 13px; color: var(--muted); margin-top: 24px; max-width: 600px; margin-left: auto; margin-right: auto; }

        /* INFRA */
        .ig .infra { padding: 0 0 80px; }
        .ig .infra-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
        .ig .infra-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 20px; }
        .ig .infra-icon { font-size: 24px; margin-bottom: 10px; }
        .ig .infra-card h4 { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .ig .infra-card p { font-size: 12px; color: var(--muted); }

        /* FOOTER */
        .ig footer { border-top: 1px solid var(--border); padding: 40px 24px; text-align: center; }
        .ig footer p { color: var(--dim); font-size: 13px; }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .ig .pipeline-stages { grid-template-columns: 1fr 1fr; }
          .ig .pipeline-stages::before { display: none; }
          .ig .roi-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .ig .pipeline-stages { grid-template-columns: 1fr; }
          .ig .loop-nodes { flex-direction: column; }
          .ig .loop-arrow { transform: rotate(90deg); }
        }
      `}</style>

      <div className="ig">

        {/* HERO */}
        <section className="hero">
          <div className="wrap">
            <div className="hero-badge">Systems Architecture · Platform Overview · 2026</div>
            <h1>knXw Psychographic<br />Intelligence Platform</h1>
            <p className="hero-sub">
              A universal AI infrastructure layer that ingests behavioral signals, infers real-time psychographic state, and delivers adaptive interventions — across web, mobile, game, and enterprise environments.
            </p>
            <div className="hero-stats">
              <div className="hero-stat"><div className="num">&lt;100ms</div><div className="lbl">Event Latency</div></div>
              <div className="hero-stat"><div className="num">7+</div><div className="lbl">Trait Dimensions</div></div>
              <div className="hero-stat"><div className="num">4</div><div className="lbl">Pipeline Stages</div></div>
              <div className="hero-stat"><div className="num">∞</div><div className="lbl">Online Learning</div></div>
              <div className="hero-stat"><div className="num">4×</div><div className="lbl">Avg ROAS Lift</div></div>
            </div>
          </div>
        </section>

        {/* 4-STAGE PIPELINE */}
        <section className="pipeline">
          <div className="wrap">
            <div className="sec-header">
              <h2>Systems Architecture View</h2>
              <p>Four-stage pipeline from raw behavioral exhaust to closed-loop adaptive intelligence.</p>
              <div className="accent-line"></div>
            </div>
            <div className="pipeline-stages" style={{ position: 'relative' }}>
              {/* Stage 2 → 3 query interface label */}
              <div style={{ position: 'absolute', top: '48px', left: '50%', transform: 'translateX(-50%)', zIndex: 3, pointerEvents: 'none' }}>
                <span style={{ background: 'var(--bg)', border: '1px solid var(--cyan-mid)', color: 'var(--cyan)', fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '10px', whiteSpace: 'nowrap' }}>Psychographic State Query Interface</span>
              </div>

              {/* Stage 1 */}
              <div className="stage">
                <div className="stage-num">1</div>
                <div className="stage-label">Stage 1</div>
                <div className="stage-title">Behavioral Event Ingestion</div>
                <div className="stage-mktg">MKTG: Data Capture</div>
                <div className="stage-card">
                  <h4>Event Sources</h4>
                  <div className="bullet">web session events</div>
                  <div className="bullet">SDK interaction logs</div>
                  <div className="bullet">mobile telemetry</div>
                  <div className="bullet">in-app actions</div>
                  <div className="bullet">game state transitions</div>
                  <div className="bullet">IoT interaction events</div>
                  <div className="bullet">CRM lifecycle updates</div>
                  <div className="bullet">transactional metadata</div>
                </div>
                <div className="stage-arrow">↓</div>
                <div className="stage-card">
                  <h4>Event Schema Layer</h4>
                  <div className="bullet">user_id</div>
                  <div className="bullet">session_id</div>
                  <div className="bullet">timestamp</div>
                  <div className="bullet">interaction_type</div>
                  <div className="bullet">feature_context</div>
                  <div className="bullet">dwell_time</div>
                  <div className="bullet">navigation_path</div>
                  <div className="bullet">conversion_flag</div>
                  <div className="bullet">device_class</div>
                  <div className="bullet">content_exposure</div>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="stage" style={{ position: 'relative' }}>
                <div className="stage-num">2</div>
                <div className="stage-label">Stage 2</div>
                <div className="stage-title">Psychographic Inference Engine</div>
                <div className="stage-mktg">MKTG: AI Processing Layer</div>
                <div className="stage-card">
                  <h4>Inference Service</h4>
                  <div className="bullet">temporal sequence modeling</div>
                  <div className="bullet">intent inference</div>
                  <div className="bullet">sentiment classification</div>
                  <div className="bullet">decision latency estimation</div>
                  <div className="bullet">risk tolerance modeling</div>
                  <div className="bullet">engagement volatility scoring</div>
                </div>
                <div className="stage-arrow">↓</div>
                <div className="stage-card">
                  <h4>Live Psychographic Identity Graph</h4>
                  <div className="bullet" style={{ color: 'var(--cyan)', fontStyle: 'italic' }}>Serves as the runtime psychographic state layer queried at decision time by the Trigger Engine and downstream engagement systems.</div>
                  <div className="bullet">decision_velocity_index</div>
                  <div className="bullet">trust_acquisition_threshold</div>
                  <div className="bullet">novelty_seeking_score</div>
                  <div className="bullet">loss_aversion_gradient</div>
                  <div className="bullet">cognitive_load_tolerance</div>
                  <div className="bullet">narrative_receptivity_score</div>
                  <div className="bullet">price_sensitivity_index</div>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="stage">
                <div className="stage-num">3</div>
                <div className="stage-label">Stage 3</div>
                <div className="stage-title">Engagement Optimization</div>
                <div className="stage-mktg">MKTG: Insight Generation</div>
                <div className="stage-card">
                  <h4>Trigger Engine</h4>
                  <div className="bullet" style={{ color: 'var(--cyan)', fontStyle: 'italic' }}>Performs real-time decision-time queries against the Trait Store runtime state layer.</div>
                  <div className="bullet">intent trajectory</div>
                  <div className="bullet">state change velocity</div>
                  <div className="bullet">confidence decay</div>
                  <div className="bullet">decision boundary proximity</div>
                  <div className="bullet">adaptive UI logic</div>
                  <div className="bullet">content sequencing</div>
                  <div className="bullet">pricing strategy</div>
                  <div className="bullet">nudge timing</div>
                  <div className="bullet">message framing</div>
                  <div className="bullet">game narrative progression</div>
                </div>
                <div className="stage-arrow">↓</div>
                <div className="stage-card">
                  <h4>Experiment Framework</h4>
                  <div className="bullet">multivariate intervention testing</div>
                  <div className="bullet">contextual bandit optimization</div>
                  <div className="bullet">adaptive reward modeling</div>
                  <div className="bullet">psychographic cohort segmentation</div>
                </div>
              </div>

              {/* Stage 4 */}
              <div className="stage">
                <div className="stage-num">4</div>
                <div className="stage-label">Stage 4</div>
                <div className="stage-title">Outcome Measurement</div>
                <div className="stage-mktg">MKTG: Actionable Output</div>
                <div className="stage-card">
                  <h4>Response Logger</h4>
                  <div className="bullet">post-trigger interaction delta</div>
                  <div className="bullet">conversion state change</div>
                  <div className="bullet">engagement duration</div>
                  <div className="bullet">task completion rate</div>
                  <div className="bullet">retention probability shift</div>
                  <div className="bullet">feature adoption variance</div>
                </div>
                <div className="stage-arrow">↓</div>
                <div className="stage-card">
                  <h4>Online Adaptation Loop</h4>
                  <div className="bullet">Trait State → Policy Deployment</div>
                  <div className="bullet">Behavior → Reinforcement Feedback</div>
                  <div className="bullet">Continuous engagement policy optimization via observed behavioral response</div>
                  <div className="bullet">No offline retraining required</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TRAIT STORE */}
        <section style={{ padding: '0 0 80px' }}>
          <div className="wrap">
            <div className="sec-header">
              <h2>Live Psychographic Identity Graph</h2>
              <p>Continuously updated runtime state layer representing real-time cognitive and behavioral trajectory per user.<br />Queried at decision time by downstream engagement systems.</p>
              <div className="accent-line"></div>
            </div>
            <div className="traits-grid">
              {[
                { name: 'decision_velocity_index', pct: 72, grad: 'linear-gradient(90deg,var(--cyan),#0ea5e9)', val: '0.72 — How quickly a user moves from awareness to decision' },
                { name: 'trust_acquisition_threshold', pct: 58, grad: 'linear-gradient(90deg,var(--violet),#6366f1)', val: '0.58 — Minimum signal required before engagement' },
                { name: 'novelty_seeking_score', pct: 85, grad: 'linear-gradient(90deg,var(--magenta),#db2777)', val: '0.85 — Preference for new features vs familiar patterns' },
                { name: 'loss_aversion_gradient', pct: 63, grad: 'linear-gradient(90deg,var(--amber),#d97706)', val: '0.63 — Sensitivity to framing around loss vs gain' },
                { name: 'cognitive_load_tolerance', pct: 44, grad: 'linear-gradient(90deg,var(--green),#059669)', val: '0.44 — Capacity for complex information processing' },
                { name: 'narrative_receptivity_score', pct: 79, grad: 'linear-gradient(90deg,#06b6d4,var(--violet))', val: '0.79 — Openness to story-driven vs data-driven content' },
                { name: 'price_sensitivity_index', pct: 51, grad: 'linear-gradient(90deg,var(--cyan),var(--violet))', val: '0.51 — Behavioral elasticity around pricing interventions' },
                { name: 'engagement_volatility_score', pct: 38, grad: 'linear-gradient(90deg,var(--magenta),var(--amber))', val: '0.38 — Variance in engagement patterns over time' },
              ].map(t => (
                <div className="trait-card" key={t.name}>
                  <div className="trait-name">{t.name}</div>
                  <div className="trait-bar-bg"><div className="trait-bar" style={{ width: `${t.pct}%`, background: t.grad }}></div></div>
                  <div className="trait-val">{t.val}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLATFORM FEATURES */}
        <section className="features">
          <div className="wrap">
            <div className="sec-header">
              <h2>Platform Capabilities</h2>
              <p>Every feature is built to serve the inference-to-intervention pipeline.</p>
              <div className="accent-line"></div>
            </div>
            <div className="features-grid">
              <div className="feat-card">
                <div className="feat-icon" style={{ background: 'linear-gradient(135deg,#00d4ff22,#0ea5e922)' }}>🧠</div>
                <h3>Psychographic Inference Engine</h3>
                <p>Multi-layer AI that processes behavioral event streams in real time to produce probabilistic trait vectors covering motivation, risk, emotion, and cognition.</p>
                <div className="feat-tags"><span className="feat-tag">OCEAN Model</span><span className="feat-tag">Temporal Modeling</span><span className="feat-tag">LLM-Assisted</span></div>
              </div>
              <div className="feat-card">
                <div className="feat-icon" style={{ background: 'linear-gradient(135deg,#8b5cf622,#6366f122)' }}>⚡</div>
                <h3>Real-Time Event Capture</h3>
                <p>Universal SDK accepts behavioral signals from web, mobile, game engines, IoT, and CRM systems. Structured via a unified event schema for immediate processing.</p>
                <div className="feat-tags"><span className="feat-tag">sub-100ms</span><span className="feat-tag">Multi-Platform</span><span className="feat-tag">REST + SDK</span></div>
              </div>
              <div className="feat-card">
                <div className="feat-icon" style={{ background: 'linear-gradient(135deg,#ec489922,#db277722)' }}>🎯</div>
                <h3>Trigger Engine</h3>
                <p>Performs real-time state queries against the Trait Store to evaluate decision thresholds and behavioral trajectory, mapping inferred state to downstream engagement interventions with precision timing.</p>
                <div className="feat-tags"><span className="feat-tag">Rule Builder</span><span className="feat-tag">Threshold Engine</span><span className="feat-tag">Auto-Trigger</span></div>
              </div>
              <div className="feat-card">
                <div className="feat-icon" style={{ background: 'linear-gradient(135deg,#10b98122,#05996922)' }}>🧪</div>
                <h3>Experiment Framework</h3>
                <p>Native A/B and multivariate testing with contextual bandit optimization. Each intervention generates outcome data used to update engagement policy via reinforcement feedback.</p>
                <div className="feat-tags"><span className="feat-tag">A/B Testing</span><span className="feat-tag">Bandit Optimizer</span><span className="feat-tag">Cohort Splits</span></div>
              </div>
              <div className="feat-card">
                <div className="feat-icon" style={{ background: 'linear-gradient(135deg,#f59e0b22,#d9770622)' }}>📊</div>
                <h3>Batch Analytics &amp; Reporting</h3>
                <p>Run deep psychographic clustering, churn prediction, cohort comparisons, and behavioral trend analysis across your entire user population on demand.</p>
                <div className="feat-tags"><span className="feat-tag">Clustering</span><span className="feat-tag">Churn Prediction</span><span className="feat-tag">Trend Analysis</span></div>
              </div>
              <div className="feat-card">
                <div className="feat-icon" style={{ background: 'linear-gradient(135deg,#06b6d422,#0ea5e922)' }}>🔁</div>
                <h3>Online Adaptation Loop</h3>
                <p>Updates behavioral policy based on observed response to deployed interventions — without requiring offline retraining or manual model updates.</p>
                <div className="feat-tags"><span className="feat-tag">Reinforcement</span><span className="feat-tag">Policy Optimization</span><span className="feat-tag">No Retraining</span></div>
              </div>
              <div className="feat-card">
                <div className="feat-icon" style={{ background: 'linear-gradient(135deg,#8b5cf622,#ec489922)' }}>🗺️</div>
                <h3>AI Journey Orchestrator</h3>
                <p>Dynamically sequences user journeys based on live psychographic state, adapting content, timing, and channel selection to each user's inferred cognitive profile.</p>
                <div className="feat-tags"><span className="feat-tag">Journey Builder</span><span className="feat-tag">AI Sequencing</span><span className="feat-tag">Multi-Channel</span></div>
              </div>
              <div className="feat-card">
                <div className="feat-icon" style={{ background: 'linear-gradient(135deg,#10b98122,#06b6d422)' }}>🔗</div>
                <h3>Enterprise Integrations</h3>
                <p>Native connectors for HubSpot, Salesforce, Segment, GA4, Meta CAPI, Google Ads, AWS S3/EventBridge, Azure Blob, Shopify, Magento, Pipedrive, and Zoho CRM.</p>
                <div className="feat-tags"><span className="feat-tag">HubSpot</span><span className="feat-tag">Salesforce</span><span className="feat-tag">Meta CAPI</span><span className="feat-tag">GA4</span></div>
              </div>
              <div className="feat-card">
                <div className="feat-icon" style={{ background: 'linear-gradient(135deg,#f59e0b22,#8b5cf622)' }}>🛡️</div>
                <h3>Compliance &amp; Data Governance</h3>
                <p>Full audit logging, GDPR-aligned data request handling (export + deletion), consent management, and role-based access controls for enterprise data governance.</p>
                <div className="feat-tags"><span className="feat-tag">GDPR</span><span className="feat-tag">Audit Logs</span><span className="feat-tag">RBAC</span><span className="feat-tag">Data Requests</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* IDEAL USERS */}
        <section className="users">
          <div className="wrap">
            <div className="sec-header">
              <h2>Ideal Users</h2>
              <p>Built for teams that need to understand the psychology behind behavior — not just the behavior itself.</p>
              <div className="accent-line"></div>
            </div>
            <div className="users-grid">
              {[
                { avatar: 'linear-gradient(135deg,#00d4ff22,#0ea5e922)', icon: '📈', title: 'Growth Marketers', desc: 'Optimize conversion funnels using real-time psychographic state instead of demographic proxies.' },
                { avatar: 'linear-gradient(135deg,#8b5cf622,#6366f122)', icon: '🎮', title: 'Game Developers', desc: 'Adapt game narrative, difficulty, and reward systems to player cognitive and emotional state.' },
                { avatar: 'linear-gradient(135deg,#ec489922,#db277722)', icon: '🛒', title: 'E-commerce Teams', desc: 'Personalize pricing display, urgency signals, and product sequencing by user risk and loss aversion profiles.' },
                { avatar: 'linear-gradient(135deg,#10b98122,#05996922)', icon: '🏢', title: 'Enterprise SaaS', desc: 'Drive feature adoption and reduce churn by detecting cognitive overload and motivation decay early.' },
                { avatar: 'linear-gradient(135deg,#f59e0b22,#d9770622)', icon: '📡', title: 'Ad Platform Teams', desc: 'Improve ROAS by targeting based on real-time inferred intent rather than static audience segments.' },
                { avatar: 'linear-gradient(135deg,#06b6d422,#8b5cf622)', icon: '🤖', title: 'AI / ML Engineers', desc: 'Integrate psychographic trait vectors as input features into downstream recommendation and personalization models.' },
                { avatar: 'linear-gradient(135deg,#8b5cf622,#ec489922)', icon: '🔬', title: 'Product Researchers', desc: 'Understand behavioral intent behind product interactions without surveys or explicit feedback collection.' },
                { avatar: 'linear-gradient(135deg,#10b98122,#06b6d422)', icon: '🏭', title: 'Industrial / IoT', desc: 'Apply operator psychographic state to adaptive safety systems and dynamic interface complexity management.' },
              ].map(u => (
                <div className="user-card" key={u.title}>
                  <div className="user-avatar" style={{ background: u.avatar }}>{u.icon}</div>
                  <h3>{u.title}</h3>
                  <p>{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="use-cases">
          <div className="wrap">
            <div className="sec-header">
              <h2>Use Cases</h2>
              <p>Psychographic intelligence applied across industries and product categories.</p>
              <div className="accent-line"></div>
            </div>
            <div className="uc-grid">
              <div className="uc-card c1">
                <div className="uc-emoji">🛒</div>
                <h3>E-Commerce Personalization</h3>
                <p>Detect loss-aversion and price-sensitivity in real time. Adapt urgency messaging, social proof placement, and checkout flow to match the user's inferred psychological state.</p>
                <div className="uc-roi">
                  <span className="uc-roi-item" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>+34% CVR</span>
                  <span className="uc-roi-item" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>+2.8× ROAS</span>
                </div>
              </div>
              <div className="uc-card c2">
                <div className="uc-emoji">🎮</div>
                <h3>Game Intelligence</h3>
                <p>Adapt difficulty curves, narrative pacing, and reward cadence based on player engagement volatility and novelty-seeking scores. Reduce churn by detecting frustration before drop-off.</p>
                <div className="uc-roi">
                  <span className="uc-roi-item" style={{ borderColor: 'var(--violet)', color: 'var(--violet)' }}>+41% D30 Retention</span>
                  <span className="uc-roi-item" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>+3.1× LTV</span>
                </div>
              </div>
              <div className="uc-card c3">
                <div className="uc-emoji">📣</div>
                <h3>Programmatic Ad Targeting</h3>
                <p>Replace static audience segments with live psychographic state vectors. Bid on users when their decision_velocity_index peaks and trust_acquisition_threshold is lowest.</p>
                <div className="uc-roi">
                  <span className="uc-roi-item" style={{ borderColor: 'var(--magenta)', color: 'var(--magenta)' }}>+4.2× ROAS</span>
                  <span className="uc-roi-item" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>-38% CPA</span>
                </div>
              </div>
              <div className="uc-card c4">
                <div className="uc-emoji">🏢</div>
                <h3>SaaS Activation &amp; Retention</h3>
                <p>Identify cognitive overload and motivation decay signals during onboarding. Trigger adaptive tooltips, simplified flows, or human outreach at the precise moment of risk.</p>
                <div className="uc-roi">
                  <span className="uc-roi-item" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>+28% Activation</span>
                  <span className="uc-roi-item" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>-22% Churn</span>
                </div>
              </div>
              <div className="uc-card c5">
                <div className="uc-emoji">📱</div>
                <h3>Mobile App Engagement</h3>
                <p>Sequence push notifications and in-app moments using inferred energy level and engagement volatility. Reach users when receptivity is highest, not just when a timer fires.</p>
                <div className="uc-roi">
                  <span className="uc-roi-item" style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }}>+52% Open Rate</span>
                  <span className="uc-roi-item" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>+1.9× Session Length</span>
                </div>
              </div>
              <div className="uc-card c6">
                <div className="uc-emoji">🤖</div>
                <h3>AI Assistant Personalization</h3>
                <p>Modulate AI assistant tone, depth, and pacing based on cognitive load tolerance and narrative receptivity. Reduce abandonment and increase task completion in conversational interfaces.</p>
                <div className="uc-roi">
                  <span className="uc-roi-item" style={{ borderColor: '#06b6d4', color: '#06b6d4' }}>+37% Task Completion</span>
                  <span className="uc-roi-item" style={{ borderColor: 'var(--violet)', color: 'var(--violet)' }}>+2.4× CSAT</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROI / ROAS */}
        <section className="roi">
          <div className="wrap">
            <div className="sec-header">
              <h2>User ROI &amp; ROAS Benchmarks</h2>
              <p>Measured outcomes from psychographic-driven interventions vs. traditional demographic targeting.</p>
              <div className="accent-line"></div>
            </div>
            <div className="roi-grid">
              <div className="roi-table-wrap">
                <div className="roi-table-head">📈 Marketing &amp; Ad Performance</div>
                <table>
                  <thead><tr><th>Metric</th><th>Baseline</th><th>With knXw</th><th>Lift</th></tr></thead>
                  <tbody>
                    <tr><td>ROAS</td><td>1.8×</td><td className="val-highlight">4.2×</td><td className="val-good">+133%</td></tr>
                    <tr><td>CPA</td><td>$48</td><td className="val-highlight">$29</td><td className="val-good">-40%</td></tr>
                    <tr><td>CVR</td><td>2.1%</td><td className="val-highlight">3.9%</td><td className="val-good">+86%</td></tr>
                    <tr><td>CTR</td><td>1.4%</td><td className="val-highlight">2.9%</td><td className="val-good">+107%</td></tr>
                    <tr><td>Impression-to-Intent</td><td>8%</td><td className="val-highlight">19%</td><td className="val-good">+138%</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="roi-table-wrap">
                <div className="roi-table-head">🏢 Product &amp; Retention Performance</div>
                <table>
                  <thead><tr><th>Metric</th><th>Baseline</th><th>With knXw</th><th>Lift</th></tr></thead>
                  <tbody>
                    <tr><td>D30 Retention</td><td>24%</td><td className="val-highlight">41%</td><td className="val-good">+71%</td></tr>
                    <tr><td>Churn Rate</td><td>8.2%</td><td className="val-highlight">5.9%</td><td className="val-good">-28%</td></tr>
                    <tr><td>Feature Adoption</td><td>31%</td><td className="val-highlight">54%</td><td className="val-good">+74%</td></tr>
                    <tr><td>Session Length</td><td>4.2 min</td><td className="val-highlight">7.8 min</td><td className="val-good">+86%</td></tr>
                    <tr><td>LTV</td><td>$180</td><td className="val-highlight">$440</td><td className="val-good">+144%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FEEDBACK LOOP */}
        <section className="loop">
          <div className="wrap">
            <div className="sec-header">
              <h2>Online Adaptation Loop</h2>
              <p>Continuous behavioral policy optimization via reinforcement feedback — no offline retraining required.</p>
              <div className="accent-line"></div>
            </div>
            <div className="loop-diagram">
              <div className="loop-nodes">
                <div className="loop-node">
                  <div className="loop-node-icon">🧠</div>
                  <div className="loop-node-label">INFERENCE</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>Trait vectors computed from behavioral stream</div>
                </div>
                <div className="loop-arrow">→</div>
                <div className="loop-node">
                  <div className="loop-node-icon">⚡</div>
                  <div className="loop-node-label">POLICY DEPLOYMENT</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>Adaptive UI, content, timing, framing</div>
                </div>
                <div className="loop-arrow">→</div>
                <div className="loop-node">
                  <div className="loop-node-icon">📊</div>
                  <div className="loop-node-label">BEHAVIOR</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>Observed response to interventions logged</div>
                </div>
                <div className="loop-arrow">→</div>
                <div className="loop-node">
                  <div className="loop-node-icon">🔄</div>
                  <div className="loop-node-label">REINFORCEMENT FEEDBACK</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>Behavioral policy updated via reinforcement feedback</div>
                </div>
                <div className="loop-arrow" style={{ color: 'var(--cyan)' }}>↩</div>
              </div>
              <p className="loop-label">Each intervention generates outcome data used to update engagement policy via reinforcement feedback. The system continuously optimizes behavioral policy with every user interaction.</p>
            </div>
          </div>
        </section>

        {/* COMPONENTS GLOSSARY */}
        <section className="glossary">
          <div className="wrap">
            <div className="sec-header">
              <h2>System Components</h2>
              <p>Each component maps directly to an implemented system artifact.</p>
              <div className="accent-line"></div>
            </div>
            <div className="gloss-grid">
              <div className="gloss-card">
                <div className="gloss-icon">📋</div>
                <div>
                  <h4>Event Schema</h4>
                  <p>Structured representation of behavioral interactions (clicks, purchases, feature usage). Normalizes heterogeneous telemetry into a unified signal format for downstream inference.</p>
                </div>
              </div>
              <div className="gloss-card">
                <div className="gloss-icon">🤖</div>
                <div>
                  <h4>Inference Service</h4>
                  <p>Processes behavioral data streams to estimate latent psychological and decision-making traits. Produces probabilistic trait vectors per user updated continuously in real time.</p>
                </div>
              </div>
              <div className="gloss-card">
                <div className="gloss-icon">🗄️</div>
                <div>
                  <h4>Trait Store</h4>
                  <p>Persistent database containing inferred user psychographic runtime state. Serves as the low-latency runtime state interface queried by Trigger Engine and downstream engagement systems at decision time. Queried at decision time by Trigger Engine and external engagement systems for runtime intervention selection.</p>
                </div>
              </div>
              <div className="gloss-card">
                <div className="gloss-icon">🎯</div>
                <div>
                  <h4>Trigger Engine</h4>
                  <p>Performs real-time state queries against the Trait Store to evaluate decision thresholds and behavioral trajectory. Determines when and how engagement interventions are deployed.</p>
                </div>
              </div>
              <div className="gloss-card">
                <div className="gloss-icon">🧪</div>
                <div>
                  <h4>Experiment Framework</h4>
                  <p>Evaluates intervention effectiveness across psychographic cohorts using multivariate testing and adaptive bandit algorithms to continuously surface optimal engagement policies.</p>
                </div>
              </div>
              <div className="gloss-card">
                <div className="gloss-icon">📝</div>
                <div>
                  <h4>Response Logger</h4>
                  <p>Records behavioral changes following system-driven interventions. Provides outcome data that feeds the online adaptation loop for continuous behavioral policy optimization.</p>
                </div>
              </div>
              <div className="gloss-card">
                <div className="gloss-icon">🎰</div>
                <div>
                  <h4>Contextual Bandit</h4>
                  <p>Adaptive algorithm that selects optimal intervention actions based on observed user context and reinforcement feedback signals. Balances exploration of new strategies with exploitation of proven ones.</p>
                </div>
              </div>
              <div className="gloss-card">
                <div className="gloss-icon">🔗</div>
                <div>
                  <h4>Identity Graph</h4>
                  <p>Cross-session and cross-device user identity resolution layer that unifies behavioral signals into a coherent per-user psychographic runtime state across all touchpoints.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INFRA SPECS */}
        <section className="infra">
          <div className="wrap">
            <div className="sec-header">
              <h2>Infrastructure &amp; Compliance</h2>
              <p>Enterprise-grade security, privacy, and reliability built into the core architecture.</p>
              <div className="accent-line"></div>
            </div>
            <div className="infra-grid">
              <div className="infra-card"><div className="infra-icon">⚡</div><h4>sub-100ms Event Latency</h4><p>Real-time event ingestion with ultra-low latency for immediate psychographic state updates.</p></div>
              <div className="infra-card"><div className="infra-icon">🔒</div><h4>Enterprise Security</h4><p>Encrypted at rest and in transit. HMAC-signed event payloads. Role-based access controls throughout.</p></div>
              <div className="infra-card"><div className="infra-icon">📜</div><h4>GDPR Compliance</h4><p>Data export and deletion request workflows. Consent management layer. Full audit log trail.</p></div>
              <div className="infra-card"><div className="infra-icon">🌐</div><h4>Multi-Platform SDKs</h4><p>JavaScript, REST API, and mobile SDKs. Game engine integrations. IoT event endpoints.</p></div>
              <div className="infra-card"><div className="infra-icon">🔄</div><h4>Online Model Adaptation</h4><p>Continuous behavioral policy optimization via reinforcement feedback. No offline retraining cycles required.</p></div>
              <div className="infra-card"><div className="infra-icon">☁️</div><h4>Cloud Data Exports</h4><p>Native AWS S3, Azure Blob, EventBridge, and BI export connectors for enterprise data pipelines.</p></div>
              <div className="infra-card"><div className="infra-icon">📊</div><h4>Real-Time Data Refresh</h4><p>Live dashboard with continuous trait and event stream updates. No manual refresh required.</p></div>
              <div className="infra-card"><div className="infra-icon">🧩</div><h4>Open Integration Layer</h4><p>Webhooks, REST API v1, and native CRM/ad platform connectors for seamless ecosystem embedding.</p></div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>knXw</p>
          <p>Psychographic Intelligence Platform &nbsp;·&nbsp; Universal AI Infrastructure for Behavioral Understanding</p>
          <p style={{ marginTop: '8px', color: 'var(--dim)' }}>© 2026 knXw &nbsp;·&nbsp; All architecture descriptions reflect implemented platform capabilities.</p>
        </footer>

      </div>
    </>
  );
}