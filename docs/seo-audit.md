# SEO-аудит

## До обновления

- Indexability: `robots.txt` разрешает обход; noindex не найден.
- Canonical: корректный canonical на главной.
- Redirects: `www` перенаправляется на основной домен кодом 301.
- Sitemap: существует, но содержит только `/`.
- Metadata: есть title, description, Open Graph и Twitter Card.
- Headings: один H1, но он перегружен ролью поискового слогана; часть контента скрыта интерактивно.
- Structured data: Person, ProfessionalService и FAQPage; разметка перегружена относительно одной страницы.
- Internal links: почти отсутствуют, так как сайт одностраничный.
- Branded visibility: по публичной выдаче профиль Taplink и социальные страницы заметнее основного домена. Вероятная причина — один URL сайта, слабая внутренняя архитектура и недостаточно сформированная entity-связность, а не блокировка robots.
- Search Console: состояние нельзя подтвердить из репозитория; требуется проверка владельцем после запуска.

## После обновления

- У каждой страницы собственные title, description, canonical, H1 и Open Graph-поля.
- Sitemap включает семь содержательных URL и privacy.
- Добавлены внутренняя навигация, breadcrumbs и контекстные ссылки между услугами.
- JSON-LD разделён по назначению: Person/WebSite/WebPage на главной, ProfilePage на `/about/`, BreadcrumbList на внутренних страницах, CollectionPage на `/articles/`.
- Все локальные смысловые изображения получают конкретные alt; декоративные — пустой alt.
- GA4 сохраняется; CTA получают события `booking_cta`, `service_to_booking`, `article_to_service`.

## После публикации

Проверить фактический deployment, Search Console, Bing Webmaster Tools, canonical в rendered HTML, sitemap processing, Core Web Vitals и branded query. Отправить обновлённый sitemap на повторный обход.

