const ANALYTICS_ID = 'G-KKE2K4RYRT';
const CONSENT_KEY = 'petruseva_analytics_consent';
let analyticsLoaded = false;
function readConsent() {
  try { return localStorage.getItem(CONSENT_KEY); } catch { return null; }
}
let currentConsent = readConsent();
function writeConsent(value) {
  currentConsent = value;
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* The site also works without browser storage. */ }
}
function cleanURL(value) {
  try { const u = new URL(value); return u.origin + u.pathname; } catch { return ''; }
}
function enableAnalytics() {
  window[`ga-disable-${ANALYTICS_ID}`] = false;
  if (analyticsLoaded) {
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    return;
  }
  analyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  // Do not send help-topic fragments, query strings, messages or contact URLs.
  window.gtag('config', ANALYTICS_ID, {
    page_location: cleanURL(window.location.href),
    page_referrer: cleanURL(document.referrer),
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    anonymize_ip: true
  });
  const script = document.createElement('script');
  script.async = true;
  script.dataset.googleAnalytics = 'true';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
  document.head.append(script);
}
function disableAnalytics() {
  window[`ga-disable-${ANALYTICS_ID}`] = true;
  if (analyticsLoaded) window.gtag('consent', 'update', { analytics_storage: 'denied' });
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.trim().split('=')[0];
    if (!/^_ga(?:_|$)|^_gid$|^_gat/.test(name)) continue;
    for (const domain of ['', location.hostname, `.${location.hostname}`]) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}
const placements = new Set(['header', 'hero', 'pricing', 'final', 'content', 'footer']);
function track(name, values = {}) {
  if (currentConsent !== 'granted' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, values);
}
function mountConsentBanner(settings = false) {
  if (document.querySelector('.consent-banner')) return;
  if (!settings && currentConsent) return;
  const banner = document.createElement('aside');
  banner.className = 'consent-banner';
  banner.setAttribute('aria-label', 'Настройки аналитики');
  banner.innerHTML = `<div><strong>${settings ? 'Настройки аналитики' : 'Можно собирать статистику посещений?'}</strong>${settings ? `<p>Сейчас аналитика ${currentConsent === 'granted' ? 'включена' : 'отключена'}.</p>` : ''}<p>Она помогает понять, какие страницы полезны. Сайт работает и без аналитики. <a href="/privacy.html">Подробнее</a>.</p></div><div class="consent-actions"><button class="button button-secondary" type="button" data-consent="denied">${settings ? 'Отключить' : 'Нет'}</button><button class="button button-primary" type="button" data-consent="granted">${settings ? 'Включить' : 'Да'}</button></div>`;
  const returnFocus = settings ? document.activeElement : null;
  banner.addEventListener('click', event => {
    const button = event.target.closest('[data-consent]');
    if (!button) return;
    writeConsent(button.dataset.consent);
    if (currentConsent === 'granted') enableAnalytics(); else disableAnalytics();
    banner.remove();
    returnFocus?.focus();
  });
  banner.addEventListener('keydown', event => {
    if (event.key === 'Escape' && settings) { banner.remove(); returnFocus?.focus(); }
  });
  document.body.append(banner);
  if (settings) banner.querySelector('button').focus();
}
if (currentConsent === 'granted') enableAnalytics(); else mountConsentBanner();
document.querySelectorAll('[data-consent-settings]').forEach(button => button.addEventListener('click', () => mountConsentBanner(true)));
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
function closeMenu(returnFocus = false) {
  siteNav?.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Открыть меню');
  document.body.classList.remove('menu-open');
  if (returnFocus) navToggle?.focus();
}
if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('menu-open', open);
  });
  siteNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu(siteNav.classList.contains('open'));
    if (event.key !== 'Tab' || !siteNav.classList.contains('open')) return;
    const last = siteNav.querySelector('a:last-child');
    if (event.shiftKey && document.activeElement === navToggle) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); navToggle.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
}
const helpList = document.querySelector('.help-list');
const helpItems = [...document.querySelectorAll('[data-help]')];
function setHelp(item) {
  helpItems.forEach(candidate => {
    const open = candidate === item;
    const button = candidate.querySelector('[data-help-trigger]');
    button.setAttribute('aria-expanded', String(open));
    button.querySelector('.disclosure-symbol').textContent = open ? '−' : '+';
    document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
  });
}
function followHash(scroll = true) {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  const item = target?.closest('[data-help]');
  if (helpList) setHelp(item || helpItems[0]);
  const details = target?.closest('details');
  if (details) details.open = true;
  if (scroll && target) {
    const destination = item ? (matchMedia('(max-width: 760px)').matches ? item.querySelector('button') : helpList) : target;
    requestAnimationFrame(() => destination.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
}
if (helpList) {
  // Progressive enhancement: all author content is visible until this point.
  helpList.classList.add('enhanced');
  helpItems.forEach(item => item.querySelector('button').addEventListener('click', () => {
    const opened = item.querySelector('button').getAttribute('aria-expanded') !== 'true';
    setHelp(opened ? item : null);
    history.pushState(null, '', opened ? `#${item.id}` : '#help');
    if (opened) track('help_open');
  }));
}
followHash(Boolean(location.hash));
window.addEventListener('hashchange', () => followHash());
window.addEventListener('popstate', () => followHash());
document.querySelectorAll('[data-faq]').forEach(details => details.addEventListener('toggle', () => { if (details.open) track('faq_open'); }));
document.addEventListener('click', event => {
  const a = event.target.closest('a[href]');
  if (!a) return;
  const placement = a.dataset.placement || (a.closest('.site-header') ? 'header' : a.closest('.site-footer') ? 'footer' : 'content');
  if (a.dataset.channel === 'whatsapp' || a.dataset.channel === 'telegram') {
    track('contact_click', { channel: a.dataset.channel, placement: placements.has(placement) ? placement : 'content' });
  } else if (a.hasAttribute('data-education')) {
    track('education_open');
  } else if (/^\/contact\/?(?:#.*)?$/.test(a.getAttribute('href'))) {
    track('click_booking', { placement: placements.has(placement) ? placement : 'content' });
  }
  if (a.hash && a.origin === location.origin && a.pathname === location.pathname) {
    // Clicking the same hash must also reopen a previously closed FAQ or topic.
    requestAnimationFrame(() => followHash());
  }
});
const formats = document.getElementById('pricing');
if (formats && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && currentConsent === 'granted') { track('format_view'); observer.disconnect(); }
  }, { threshold: .2 });
  observer.observe(formats);
}
document.querySelectorAll('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
