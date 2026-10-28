/* Santa Catarina Front-Row Suite - consent-gated Google Analytics (GA4 G-2F5K8P6WWC)
   No analytics loads until the visitor explicitly accepts. Choice is stored locally. */
(function () {
  'use strict';
  return; // Collection paused pending informed privacy notice and withdrawal controls.
  var MEASUREMENT_ID = 'G-2F5K8P6WWC';
  var STORAGE_KEY = 'frp-analytics-consent';
  var TEXT = {
    en: { msg: 'We use Google Analytics cookies to count visits and see which links are clicked, only if you agree.', accept: 'Accept', decline: 'No thanks' },
    pt: { msg: 'Usamos cookies do Google Analytics para contar visitas e ver que ligações são clicadas, apenas se concordar.', accept: 'Aceitar', decline: 'Não, obrigado' },
    es: { msg: 'Usamos cookies de Google Analytics para contar visitas y ver qué enlaces se pulsan, solo si estás de acuerdo.', accept: 'Aceptar', decline: 'No, gracias' },
    fr: { msg: 'Nous utilisons des cookies Google Analytics pour compter les visites et voir quels liens sont cliqués, uniquement avec votre accord.', accept: 'Accepter', decline: 'Non merci' },
    ja: { msg: '訪問数の集計とリンクのクリック確認のため、同意いただいた場合のみ Google Analytics の Cookie を使用します。', accept: '同意する', decline: '拒否する' },
    ko: { msg: '방문 수 집계와 링크 클릭 확인을 위해 동의하신 경우에만 Google Analytics 쿠키를 사용합니다.', accept: '동의', decline: '거부' },
    'zh-cn': { msg: '仅在您同意后，我们才会使用 Google Analytics Cookie 来统计访问量并查看链接点击情况。', accept: '同意', decline: '拒绝' }
  };
  function lang() {
    var l = (document.documentElement.lang || 'en').toLowerCase();
    return TEXT[l] ? l : 'en';
  }
  function loadGA() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, { anonymize_ip: true });
  }
  function decide(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
    var b = document.getElementById('frp-consent');
    if (b) b.remove();
    if (v === 'accept') loadGA();
  }
  function show() {
    var t = TEXT[lang()];
    var bar = document.createElement('div');
    bar.id = 'frp-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#1c1a17;color:#f5f1ea;font-family:inherit;font-size:14px;line-height:1.5;padding:12px 16px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;box-shadow:0 -2px 12px rgba(0,0,0,.35)';
    var span = document.createElement('span');
    span.textContent = t.msg;
    span.style.cssText = 'max-width:640px';
    var ok = document.createElement('button');
    ok.textContent = t.accept;
    ok.style.cssText = 'background:#b98a2f;border:none;color:#fff;padding:8px 18px;border-radius:4px;cursor:pointer;font-size:14px';
    ok.addEventListener('click', function () { decide('accept'); });
    var no = document.createElement('button');
    no.textContent = t.decline;
    no.style.cssText = 'background:transparent;border:1px solid #f5f1ea;color:#f5f1ea;padding:8px 18px;border-radius:4px;cursor:pointer;font-size:14px';
    no.addEventListener('click', function () { decide('decline'); });
    bar.appendChild(span); bar.appendChild(ok); bar.appendChild(no);
    document.body.appendChild(bar);
  }
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (stored === 'accept') { loadGA(); return; }
  if (stored === 'decline') { return; }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show);
  } else { show(); }
})();
