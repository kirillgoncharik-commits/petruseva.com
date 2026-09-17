const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
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

