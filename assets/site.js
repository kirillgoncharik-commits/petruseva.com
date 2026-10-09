const ANALYTICS_ID = 'G-KKE2K4RYRT';
const CONSENT_KEY = 'petruseva_analytics_consent';

function readConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function writeConsent(value) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // A blocked storage API must not prevent the site from working.
  }
}

function enableAnalytics() {
  if (window.gtag || document.querySelector('script[data-google-analytics]')) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', ANALYTICS_ID, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.dataset.googleAnalytics = 'true';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
  document.head.append(script);
}

function mountConsentBanner() {
  if (readConsent() || document.querySelector('.consent-banner')) return;

  const banner = document.createElement('aside');
  banner.className = 'consent-banner';
  banner.setAttribute('aria-label', 'Настройки аналитики');
  banner.innerHTML = `
    <div>
      <strong>Можно собирать анонимную статистику?</strong>
      <p>Она помогает понять, какие страницы полезны. Сайт работает и без аналитики. <a href="/privacy.html">Подробнее</a>.</p>
    </div>
    <div class="consent-actions">
      <button class="button button-secondary" type="button" data-consent="denied">Нет</button>
      <button class="button button-primary" type="button" data-consent="granted">Да</button>
    </div>`;

  banner.addEventListener('click', (event) => {
    const button = event.target.closest('[data-consent]');
    if (!button) return;
    const choice = button.dataset.consent;
    writeConsent(choice);
    if (choice === 'granted') enableAnalytics();
    banner.remove();
  });

  document.body.append(banner);
}

if (readConsent() === 'granted') {
  enableAnalytics();
} else if (!readConsent()) {
  mountConsentBanner();
}

const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('menu-open', isOpen);
  });

  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Открыть меню');
      document.body.classList.remove('menu-open');
    }
  });
}

document.querySelectorAll('[data-analytics]').forEach((link) => {
  link.addEventListener('click', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', link.dataset.analytics, {
        link_url: link.href,
        link_text: link.textContent.trim(),
        page_path: window.location.pathname
      });
    }
  });
});

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});
