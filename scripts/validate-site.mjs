import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>https:\/\/petruseva\.com([^<]*)<\/loc>/g)].map((match) => match[1] || '/');
const errors = [];
const titles = new Map();
const canonicals = new Map();

function pagePath(urlPath) {
  if (urlPath === '/') return join(root, 'index.html');
  if (urlPath.endsWith('/')) return join(root, urlPath.slice(1), 'index.html');
  return join(root, urlPath.slice(1));
}

function textMatch(html, pattern) {
  return html.match(pattern)?.[1]?.replace(/\s+/g, ' ').trim() || '';
}

for (const urlPath of urls) {
  const file = pagePath(urlPath);
  if (!existsSync(file)) {
    errors.push(`${urlPath}: отсутствует файл ${file}`);
    continue;
  }

  const html = readFileSync(file, 'utf8');
  const title = textMatch(html, /<title>([\s\S]*?)<\/title>/i);
  const description = textMatch(html, /<meta\s+name="description"\s+content="([^"]+)"/i);
  const canonical = textMatch(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const h1s = [...html.matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/gi)];

  if (!title) errors.push(`${urlPath}: нет title`);
  if (title.length < 25 || title.length > 70) errors.push(`${urlPath}: длина title ${title.length}`);
  if (!description) errors.push(`${urlPath}: нет description`);
  if (description.length < 70 || description.length > 180) errors.push(`${urlPath}: длина description ${description.length}`);
  if (canonical !== `https://petruseva.com${urlPath}`) errors.push(`${urlPath}: canonical ${canonical || 'отсутствует'}`);
  if (h1s.length !== 1) errors.push(`${urlPath}: H1 — ${h1s.length}`);
  if (/name="robots"\s+content="[^"]*noindex/i.test(html)) errors.push(`${urlPath}: sitemap URL содержит noindex`);
  if (!html.includes('/assets/site.js')) errors.push(`${urlPath}: не подключён site.js`);
  if (html.includes('googletagmanager.com/gtag/js')) errors.push(`${urlPath}: GA4 загружается до согласия`);

  if (titles.has(title)) errors.push(`${urlPath}: повтор title со страницей ${titles.get(title)}`);
  titles.set(title, urlPath);
  if (canonicals.has(canonical)) errors.push(`${urlPath}: повтор canonical со страницей ${canonicals.get(canonical)}`);
  canonicals.set(canonical, urlPath);

  for (const block of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(block[1]);
    } catch (error) {
      errors.push(`${urlPath}: некорректный JSON-LD — ${error.message}`);
    }
  }

  for (const link of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = link[1].split('#')[0].split('?')[0];
    if (!href || /\.(?:css|js|jpg|jpeg|png|webp|svg|ico|xml|txt)$/i.test(href)) continue;
    const target = pagePath(href);
    if (!existsSync(target)) errors.push(`${urlPath}: битая внутренняя ссылка ${href}`);
  }
}

const onlineOnly = ['belgrade', 'tbilisi', 'limassol', 'barcelona', 'lisbon'];
for (const slug of onlineOnly) {
  const html = readFileSync(join(root, slug, 'index.html'), 'utf8');
  if (!html.toLowerCase().includes('только онлайн')) errors.push(`/${slug}/: нет явной маркировки «только онлайн»`);
  if (html.includes('LocalBusiness')) errors.push(`/${slug}/: запрещён LocalBusiness`);
  if (!html.toLowerCase().includes('очн')) errors.push(`/${slug}/: нет пояснения об отсутствии очного приёма`);
}

for (const slug of ['bar', 'montenegro']) {
  const html = readFileSync(join(root, slug, 'index.html'), 'utf8');
  if (html.includes('LocalBusiness') || /streetAddress|postalCode/.test(html)) errors.push(`/${slug}/: найден фиктивный локальный адрес`);
}

if (urls.length !== 16) errors.push(`sitemap: ожидалось 16 URL, найдено ${urls.length}`);
if (!readFileSync(join(root, '404.html'), 'utf8').includes('noindex,follow')) errors.push('/404.html: нет noindex,follow');
if (readFileSync(join(root, 'assets/site.js'), 'utf8').includes('googletagmanager.com') === false) errors.push('site.js: отсутствует согласованная загрузка GA4');

if (errors.length) {
  console.error(`Проверка не пройдена (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Проверка пройдена: ${urls.length} индексируемых URL, уникальные metadata/canonical/H1, JSON-LD и внутренние ссылки корректны.`);
