const template = document.getElementById('chatlist_item').innerHTML.trim();
const log = document.getElementById('log');
const alerts = document.getElementById('alerts');
const offlineBanner = document.getElementById('offline');

const themes = ['theme-neon', 'theme-synth', 'theme-circuit'];
const hideDelayMs = 12000;
const alertDuration = hideDelayMs + 600;

const alertLabels = {
  follower: 'Follow',
  subscriber: 'Sub',
  raid: 'Raid'
};

const alertText = {
  follower: (name) => `${name} just followed!`,
  subscriber: (name, data = {}) => {
    const tier = data.tier ? ` ${data.tier}` : '';
    const months = data.amount ? ` (${data.amount} months)` : '';
    return `${name} just subscribed${tier}${months}!`;
  },
  raid: (name, data = {}) => {
    const viewers = data.amount ? ` with ${data.amount} raiders` : '';
    return `${name} is raiding${viewers}!`;
  }
};

const badgeMap = (badges = []) => badges.map(({ url }) => `<img class="badge" src="${url}" alt="badge" />`).join('');

const uniqueId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function applyTheme(preference) {
  const app = document.getElementById('app');
  themes.forEach((cls) => app.classList.remove(cls));
  const chosen = themes.includes(preference) ? preference : themes[0];
  app.classList.add(chosen);
}

function sanitize(text = '') {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function buildMessage(data) {
  const compiled = template
    .replace(/{from}/g, sanitize(data.from))
    .replace(/{messageId}/g, sanitize(data.id || data.messageId || uniqueId()))
    .replace(/{color}/g, data.color || 'var(--text)')
    .replace(/{message}/g, data.message || '');

  const wrapper = document.createElement('div');
  wrapper.innerHTML = compiled;
  const node = wrapper.firstElementChild;

  const badges = node.querySelector('.badges');
  badges.innerHTML = badgeMap(data.badges);

  return node;
}

function appendMessage(data) {
  const node = buildMessage(data);
  log.appendChild(node);
  setTimeout(() => {
    node.remove();
  }, hideDelayMs + 600);
}

function showAlert(type, name, data = {}) {
  const label = alertLabels[type];
  if (!label) return;
  const item = document.createElement('div');
  item.className = `alert alert-${type}`;
  item.style.borderImage = `linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3)) 1`;
  item.innerHTML = `
    <div class="label">${label}</div>
    <div class="text">${alertText[type](name, data)}</div>
  `;
  alerts.appendChild(item);
  setTimeout(() => item.remove(), alertDuration);
}

function handleChat(event) {
  const data = event.data || {};
  appendMessage({
    from: data.displayName || data.nick || data.name || 'Guest',
    id: data.messageId || data.msgId,
    color: data.displayColor || data.color,
    message: data.text || data.displayText || '',
    badges: data.badges || []
  });
}

function handleFollow(event) {
  const name = event.name || event.username || event.displayName || 'Follower';
  showAlert('follower', name);
}

function handleSub(event) {
  const name = event.name || event.username || event.displayName || 'Subscriber';
  showAlert('subscriber', name, { amount: event.amount || event.months, tier: event.tier });
}

function handleRaid(event) {
  const name = event.name || event.username || event.displayName || 'Raider';
  showAlert('raid', name, { amount: event.amount || event.viewers });
}

function toggleOffline(show) {
  if (!offlineBanner) return;
  offlineBanner.classList.toggle('hidden', !show);
}

function loadRecents(recents = []) {
  recents.forEach((msg) => handleChat({ data: msg }));
}

function routeEvent(obj) {
  const { listener, event } = obj.detail || {};
  if (!listener) return;

  switch (listener) {
    case 'message':
      handleChat(event);
      break;
    case 'follower-latest':
      handleFollow(event);
      break;
    case 'subscriber-latest':
      handleSub(event);
      break;
    case 'raid-latest':
      handleRaid(event);
      break;
    case 'stream-offline':
      toggleOffline(true);
      break;
    case 'stream-online':
      toggleOffline(false);
      break;
    default:
      break;
  }
}

document.addEventListener('onLoad', function (obj) {
  const detail = obj.detail || {};
  const fieldData = detail.fieldData || {};

  if (fieldData.theme) {
    applyTheme(`theme-${fieldData.theme}`);
  } else {
    applyTheme(themes[0]);
  }

  if (Array.isArray(detail.recents)) {
    loadRecents(detail.recents);
  }

  if (fieldData.offline) {
    toggleOffline(true);
  }
});

document.addEventListener('onEventReceived', function (obj) {
  routeEvent(obj);
});
