# Client-needs iteration — October 2026

## Copy and conversion

- Restored the approved homepage H1 from `docs/copy-deck.md`: “Место, где можно выдохнуть и снова опереться на себя.”
- Kept the SEO-supporting language in the surrounding copy and metadata.
- Made the booking path consistent: online from any country; in-person meetings in Bar by prior arrangement.
- Repeated the 60-minute individual and 90-minute couples formats on the contact route.
- Kept WhatsApp and Telegram as the direct first-contact channels.
- Added a relevant link from individual therapy to the emigration/adaptation route.
- Added a branded, useful `404.html` with links back to the homepage and contact page.

## Image audit

The original JPEG files remain untouched and continue to serve as fallbacks.

| Image family | Source resolution | Previous WebP | New responsive WebP files | Use |
| --- | ---: | ---: | --- | --- |
| `hero` | 1080×1620 | already acceptable | existing 360, 720 and 1080 widths retained | homepage hero |
| `approach` | 733×1100 | 35 KB | 380w + 733w at higher quality | homepage, individual therapy |
| `education` | 733×1100 | 35 KB | 380w + 733w at higher quality | about page hero |
| `love` | 733×1100 | 33 KB | 380w + 733w at higher quality | couples page hero |
| `history` | 1400×933 | 36 KB | 480w, 960w and 1400w at higher quality | about, emigration, Montenegro |
| `contact-cta` | 1400×933 | 35 KB | 480w, 960w and 1400w at higher quality | contact hero |

Every updated route now uses `<picture>`, WebP `srcset`, explicit `sizes`, dimensions and a JPEG fallback.

## SEO and technical checks

- The Montenegro canonical, sitemap entry, breadcrumb data, FAQ data and local `Service` schema were already correctly configured and remain intact.
- The new 404 page is marked `noindex,follow`.

## Open content item

The repository deliberately removed public prices in earlier revisions. No current approved prices were available, so this iteration does not invent or restore them. Confirm current prices before adding them to the site.
