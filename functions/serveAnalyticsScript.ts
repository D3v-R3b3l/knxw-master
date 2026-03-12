import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function buildNoopScript() {
  return `(() => {
    const api = {
      init() { return api; },
      identify() { return api; },
      track() {},
      page() {},
      startEngagements() { return api; },
      stopEngagements() {},
      onEngagement() { return api; }
    };
    window.knxw = api;
    window.knXw = api;
  })();`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const origin = new URL(req.url).origin;

    let payload = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }

    const url = new URL(req.url);
    const requestedId = payload.id || payload.app_id || url.searchParams.get('id') || url.searchParams.get('app_id');
    const requestedSlug = payload.slug || payload.name || url.searchParams.get('slug') || url.searchParams.get('name');

    let app = null;
    if (requestedId) {
      app = await svc.entities.ClientApp.get(requestedId).catch(() => null);
    }

    if (!app && requestedSlug) {
      const matches = await svc.entities.ClientApp.filter({ name: requestedSlug }, null, 1).catch(() => []);
      app = matches?.[0] || null;
    }

    if (!app) {
      const list = await svc.entities.ClientApp.list('-created_date', 1).catch(() => []);
      app = list?.[0] || null;
    }

    if (!app) {
      return new Response(buildNoopScript(), {
        status: 200,
        headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
      });
    }

    const script = `(() => {
  if (window.knxw) return;

  const CONFIG = ${JSON.stringify({
    appId: app.id,
    apiKey: app.api_key,
    apiBase: `${origin}/functions`,
    pollInterval: 15000
  })};

  const SESSION_KEY = 'knxw_session_' + CONFIG.appId;
  const STATE = {
    appId: CONFIG.appId,
    apiKey: CONFIG.apiKey,
    apiBase: CONFIG.apiBase,
    pollInterval: CONFIG.pollInterval,
    sessionId: null,
    sessionStart: Date.now(),
    pageStart: Date.now(),
    lastActivity: Date.now(),
    userId: null,
    traits: {},
    renderMode: 'auto',
    engagementCallback: null,
    engagementTimer: null,
    displayedDeliveries: new Set(),
    listenersBound: false
  };

  function uuid() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return 'knxw_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function ensureSession() {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    STATE.sessionId = existing || uuid();
    if (!existing) window.sessionStorage.setItem(SESSION_KEY, STATE.sessionId);
  }

  function nowIso(ms) {
    return new Date(ms).toISOString();
  }

  function updateActivity() {
    STATE.lastActivity = Date.now();
  }

  function deviceInfo() {
    return {
      user_agent: navigator.userAgent,
      screen_resolution: window.screen ? window.screen.width + 'x' + window.screen.height : null,
      viewport_size: window.innerWidth + 'x' + window.innerHeight
    };
  }

  function textForElement(target) {
    if (!target) return 'unknown';
    if (target.dataset?.knxwLabel) return target.dataset.knxwLabel;
    if (target.id) return '#' + target.id;
    if (target.name) return target.name;
    if (target.getAttribute?.('aria-label')) return target.getAttribute('aria-label');
    return (target.tagName || 'element').toLowerCase();
  }

  async function post(path, body, extraHeaders = {}) {
    const response = await fetch(STATE.apiBase + '/' + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': STATE.apiKey,
        ...extraHeaders
      },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'omit'
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || ('Request failed: ' + response.status));
    return data;
  }

  function identify(userId, traits = {}) {
    if (userId) STATE.userId = String(userId);
    STATE.traits = { ...STATE.traits, ...traits };
    return api;
  }

  function ensureUser() {
    if (!STATE.userId) {
      STATE.userId = uuid();
    }
  }

  async function track(eventType, payload = {}, options = {}) {
    ensureUser();
    updateActivity();
    return post('captureEvent', {
      user_id: STATE.userId,
      session_id: STATE.sessionId,
      event_type: eventType,
      event_payload: {
        ...payload,
        page_url: window.location.href,
        page_title: document.title,
        traits: Object.keys(STATE.traits).length ? STATE.traits : undefined
      },
      device_info: deviceInfo(),
      timestamp: options.timestamp || new Date().toISOString()
    });
  }

  function bindListeners() {
    if (STATE.listenersBound) return;
    STATE.listenersBound = true;

    document.addEventListener('click', (event) => {
      const target = event.target?.closest?.('button, a, [data-knxw-track], input, select, textarea') || event.target;
      if (!target) return;
      track('click', { element: textForElement(target) }).catch(() => {});
    }, true);

    document.addEventListener('submit', (event) => {
      const target = event.target;
      track('form_submit', { element: textForElement(target) }).catch(() => {});
    }, true);

    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });
    window.addEventListener('pagehide', () => {
      track('page_exit', { url: window.location.href }).catch(() => {});
    });
  }

  function removeNode(node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
  }

  async function recordEngagement(deliveryId, actionTaken, responseData = {}, startedAt = Date.now()) {
    try {
      await post('recordEngagementResponse', {
        apiKey: STATE.apiKey,
        delivery_id: deliveryId,
        user_id: STATE.userId,
        action_taken: actionTaken,
        response_data: responseData,
        response_time_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000))
      });
    } catch (_) {}
  }

  function baseCardStyles() {
    return 'font-family:Inter,system-ui,sans-serif;background:#111;color:#fff;border:1px solid rgba(255,255,255,0.08);border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,0.35);max-width:360px;';
  }

  function renderNotification(engagement) {
    const startedAt = Date.now();
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:2147483647;';
    wrapper.innerHTML = '<div style="' + baseCardStyles() + 'padding:16px;">' +
      '<div style="font-size:14px;font-weight:700;margin-bottom:8px;">' + (engagement.content?.title || 'knxw') + '</div>' +
      '<div style="font-size:13px;line-height:1.5;color:#d4d4d8;margin-bottom:14px;">' + (engagement.content?.message || '') + '</div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
      '<button data-action="dismiss" style="background:transparent;border:1px solid rgba(255,255,255,0.12);color:#fff;border-radius:10px;padding:8px 12px;cursor:pointer;">Dismiss</button>' +
      '<button data-action="primary" style="background:#00d4ff;border:none;color:#000;border-radius:10px;padding:8px 12px;font-weight:700;cursor:pointer;">' + ((engagement.content?.buttons?.[0]?.text) || 'View') + '</button>' +
      '</div></div>';

    wrapper.querySelector('[data-action="dismiss"]').onclick = () => {
      recordEngagement(engagement.delivery_id, 'dismissed', { type: 'notification' }, startedAt);
      removeNode(wrapper);
    };

    wrapper.querySelector('[data-action="primary"]').onclick = () => {
      const button = engagement.content?.buttons?.[0] || {};
      recordEngagement(engagement.delivery_id, button.action === 'redirect' ? 'clicked' : 'responded', { type: 'notification', button: button.text || 'primary' }, startedAt);
      if (button.action === 'redirect' && button.action_value) window.location.href = button.action_value;
      if (button.action === 'track_event') track(button.action_value || 'engagement_click').catch(() => {});
      removeNode(wrapper);
    };

    document.body.appendChild(wrapper);
  }

  function renderTooltip(engagement) {
    const startedAt = Date.now();
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:fixed;top:20px;right:20px;z-index:2147483647;';
    wrapper.innerHTML = '<div style="' + baseCardStyles() + 'padding:14px;max-width:320px;">' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:6px;">' + (engagement.content?.title || 'Helpful tip') + '</div>' +
      '<div style="font-size:12px;line-height:1.5;color:#d4d4d8;margin-bottom:10px;">' + (engagement.content?.message || '') + '</div>' +
      '<button data-action="close" style="background:#1f2937;border:1px solid rgba(255,255,255,0.08);color:#fff;border-radius:10px;padding:7px 10px;cursor:pointer;">Got it</button>' +
      '</div>';

    wrapper.querySelector('[data-action="close"]').onclick = () => {
      recordEngagement(engagement.delivery_id, 'responded', { type: 'tooltip' }, startedAt);
      removeNode(wrapper);
    };

    document.body.appendChild(wrapper);
  }

  function renderModal(engagement) {
    const startedAt = Date.now();
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.62);display:flex;align-items:center;justify-content:center;padding:20px;z-index:2147483647;';

    const buttons = engagement.content?.buttons?.length ? engagement.content.buttons : [{ text: 'Continue', action: 'dismiss' }];
    overlay.innerHTML = '<div style="' + baseCardStyles() + 'padding:20px;width:100%;max-width:460px;">' +
      '<div style="font-size:18px;font-weight:800;margin-bottom:10px;">' + (engagement.content?.title || 'Personalized recommendation') + '</div>' +
      '<div style="font-size:14px;line-height:1.6;color:#d4d4d8;margin-bottom:18px;">' + (engagement.content?.message || '') + '</div>' +
      '<div data-buttons style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;"></div>' +
      '</div>';

    const buttonsRoot = overlay.querySelector('[data-buttons]');
    buttons.forEach((button, index) => {
      const el = document.createElement('button');
      el.textContent = button.text || ('Option ' + (index + 1));
      el.style.cssText = index === 0
        ? 'background:#00d4ff;border:none;color:#000;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;'
        : 'background:transparent;border:1px solid rgba(255,255,255,0.12);color:#fff;border-radius:10px;padding:10px 14px;cursor:pointer;';
      el.onclick = () => {
        const action = button.action === 'redirect' ? 'clicked' : button.action === 'dismiss' ? 'dismissed' : 'responded';
        recordEngagement(engagement.delivery_id, action, { type: 'modal', button: button.text || 'action' }, startedAt);
        if (button.action === 'redirect' && button.action_value) window.location.href = button.action_value;
        if (button.action === 'track_event') track(button.action_value || 'engagement_action').catch(() => {});
        removeNode(overlay);
      };
      buttonsRoot.appendChild(el);
    });

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        recordEngagement(engagement.delivery_id, 'dismissed', { type: 'modal_backdrop' }, startedAt);
        removeNode(overlay);
      }
    });

    document.body.appendChild(overlay);
  }

  function renderEngagement(engagement) {
    if (!engagement || STATE.displayedDeliveries.has(engagement.delivery_id)) return;
    STATE.displayedDeliveries.add(engagement.delivery_id);

    if (STATE.renderMode === 'manual' && typeof STATE.engagementCallback === 'function') {
      STATE.engagementCallback(engagement);
      return;
    }

    switch (engagement.engagement_type) {
      case 'modal':
        renderModal(engagement);
        break;
      case 'tooltip':
        renderTooltip(engagement);
        break;
      default:
        renderNotification(engagement);
        break;
    }
  }

  async function pollEngagements() {
    ensureUser();
    try {
      const data = await post('evaluateEngagementRules', {
        apiKey: STATE.apiKey,
        user_id: STATE.userId,
        context: {
          session_id: STATE.sessionId,
          page_url: window.location.href,
          page_start_time: nowIso(STATE.pageStart),
          session_start_time: nowIso(STATE.sessionStart),
          last_activity: nowIso(STATE.lastActivity)
        }
      });

      (data.triggered_engagements || []).forEach(renderEngagement);
    } catch (_) {}
  }

  function startEngagements(options = {}) {
    if (typeof options.onTrigger === 'function') {
      STATE.engagementCallback = options.onTrigger;
      STATE.renderMode = options.render === false ? 'manual' : 'auto';
    } else if (options.render === false) {
      STATE.renderMode = 'manual';
    }

    STATE.pollInterval = options.pollInterval || STATE.pollInterval;
    if (STATE.engagementTimer) window.clearInterval(STATE.engagementTimer);
    pollEngagements();
    STATE.engagementTimer = window.setInterval(pollEngagements, STATE.pollInterval);
    return api;
  }

  function stopEngagements() {
    if (STATE.engagementTimer) {
      window.clearInterval(STATE.engagementTimer);
      STATE.engagementTimer = null;
    }
  }

  function page(payload = {}) {
    STATE.pageStart = Date.now();
    return track('page_view', { url: window.location.href, referrer: document.referrer, ...payload });
  }

  function init(options = {}) {
    ensureSession();
    STATE.sessionStart = Date.now();
    STATE.pageStart = Date.now();
    if (options.userId) identify(options.userId, options.traits || {});
    bindListeners();
    if (options.autoTrack !== false) page(options.pagePayload || {}).catch(() => {});
    if (options.engagements !== false) startEngagements(options.engagements || {});
    return api;
  }

  function onEngagement(callback) {
    STATE.engagementCallback = callback;
    STATE.renderMode = 'manual';
    return api;
  }

  const api = {
    init,
    identify,
    track,
    page,
    startEngagements,
    stopEngagements,
    onEngagement,
    config: { appId: STATE.appId, apiBase: STATE.apiBase }
  };

  window.knxw = api;
  window.knXw = api;
})();`;

    return new Response(script, {
      status: 200,
      headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
    });
  } catch (error) {
    console.error('serveAnalyticsScript error:', error);
    return new Response(buildNoopScript(), {
      status: 200,
      headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
    });
  }
});