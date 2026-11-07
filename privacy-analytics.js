/* Aggregate statistics only after a valid choice. No visitor IDs or sessions. */
(function () {
  'use strict';
  var KEY = 'frp-aggregate-consent-v2', TTL = 180 * 86400000;
  var choice = null, chosenAt = 0, counted = false;
  var route = location.pathname.replace(/index\.html$/, '');
  var pages = {
    '/': 'en/home', '/pt/': 'pt/home', '/es/': 'es/home', '/fr/': 'fr/home',
    '/ja/': 'ja/home', '/ko/': 'ko/home', '/zh-cn/': 'zh-cn/home',
    '/guides/': 'en/guides',
    '/guides/where-to-stay-porto-for-two/': 'en/where-to-stay-porto-for-two',
    '/guides/porto-for-two-in-winter/': 'en/porto-for-two-in-winter'
  };
  var page = pages[route], privacy = route === '/privacy.html';
  if (!page && !privacy) return;
  function restore() {
    choice = null; chosenAt = 0;
    try {
      var saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && ['accept', 'reject'].indexOf(saved.choice) !== -1 &&
          Number.isFinite(saved.at) && saved.at <= Date.now() && Date.now() - saved.at < TTL) {
        choice = saved.choice; chosenAt = saved.at;
      }
    } catch (_) {}
  }
  function permitted() { return choice === 'accept' && Date.now() - chosenAt < TTL; }
  restore();
  // Read optional arrival information only after permission. Never transmit raw URLs.
  function details() {
    var query = new URLSearchParams(location.search);
    var known = {
      pinterest: 'pinterest', instagram: 'instagram', facebook: 'facebook', reddit: 'reddit',
      google: 'google', bing: 'bing', 'ai-chatgpt': 'ai-chatgpt',
      'ai-perplexity': 'ai-perplexity', 'ai-gemini': 'ai-gemini', 'ai-copilot': 'ai-copilot',
      external: 'external', unknown: 'unknown'
    };
    var source = known[(query.get('utm_source') || '').toLowerCase()] || 'unknown';
    if (source === 'unknown') {
      try {
        var host = new URL(document.referrer).hostname.toLowerCase();
        var is = function (domain) { return host === domain || host.endsWith('.' + domain); };
        if (is('pinterest.com') || is('pinterest.pt')) source = 'pinterest';
        else if (is('instagram.com')) source = 'instagram';
        else if (is('facebook.com')) source = 'facebook';
        else if (is('reddit.com')) source = 'reddit';
        else if (is('chatgpt.com') || is('chat.openai.com')) source = 'ai-chatgpt';
        else if (is('perplexity.ai')) source = 'ai-perplexity';
        else if (is('gemini.google.com')) source = 'ai-gemini';
        else if (is('copilot.microsoft.com')) source = 'ai-copilot';
        else if (is('bing.com')) source = 'bing';
        else if (/(^|\.)google\.(com|pt|co\.uk|fr|es|de|co\.jp|co\.kr|co\.il|ca|com\.au)$/.test(host)) source = 'google';
        else if (host !== location.hostname) source = 'external';
      } catch (_) {}
    }
    return { source: source, test: query.get('frp_test') };
  }
  function send(placement) {
    if (!page || !permitted() || (!placement && counted)) return;
    var info = details();
    if (info.test === '1') return;
    var name = placement ? 'v3/airbnb-click/' + page + '/placement/' + placement : '/v3/page/' + page;
    name += '/source/' + info.source;
    if (info.test === 'receipt') name = 'TEST-20261107-v3/' + name;
    if (!placement) counted = true;
    var url = 'https://frontrowporto.goatcounter.com/count?p=' + encodeURIComponent(name) +
      '&e=' + (placement ? 'true' : 'false') + '&t=' + encodeURIComponent(placement ? 'Airbnb click' : 'Page load');
    // Do not wait, cancel navigation, retry around blockers, or change the Airbnb destination.
    try {
      fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store',
        referrerPolicy: 'no-referrer', keepalive: true }).catch(function () {});
    } catch (_) {}
  }
  function decorateLinks() {
    if (!permitted() || !page) return;
    var info = details();
    document.querySelectorAll('a[href]').forEach(function (a) {
      try {
        var u = new URL(a.href, location.href);
        if (u.origin !== location.origin || !pages[u.pathname.replace(/index\.html$/, '')]) return;
        if (info.source !== 'unknown') u.searchParams.set('utm_source', info.source);
        if (info.test === '1' || info.test === 'receipt') u.searchParams.set('frp_test', info.test);
        a.href = u.href;
      } catch (_) {}
    });
  }
  function controls() {
    if (!privacy) return;
    var container = document.getElementById('statistics-controls');
    if (!container) return;
    var status = container.querySelector('[data-choice-status]');
    if (status) status.textContent = choice === 'accept' ? 'Allowed / Permitidas' :
      choice === 'reject' ? 'Not allowed / Não permitidas' : 'Not chosen: off / Sem escolha: desativadas';
    container.querySelectorAll('[data-statistics-choice]').forEach(function (button) {
      button.onclick = function () {
        choice = button.dataset.statisticsChoice; chosenAt = Date.now();
        try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, at: chosenAt })); } catch (_) {}
        controls();
      };
    });
  }
  function ready() { controls(); decorateLinks(); send(null); }
  function outgoing(e) {
    if (e.type === 'auxclick' && e.button !== 1) return;
    var node = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!node) return;
    try {
      var u = new URL(node.href);
      if (u.protocol !== 'https:' || u.hostname !== 'www.airbnb.com' || u.pathname !== '/rooms/1455066495407495959') return;
      var position = node.dataset.booking || node.dataset.placement || 'other';
      var allowed = ['header', 'hero', 'social-proof', 'closing', 'mobile', 'footer', 'guide-winter', 'guide-evergreen', 'guide-index'];
      if (allowed.indexOf(position) === -1) position = 'other';
      send(position);
    } catch (_) {}
  }
  document.addEventListener('click', outgoing);
  document.addEventListener('auxclick', outgoing);
  window.addEventListener('storage', function (e) {
    if (e.key === KEY || e.key === null) { restore(); controls(); }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
