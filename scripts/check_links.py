#!/usr/bin/env python3
"""Check local links, fragments, images and duplicate IDs across the published pages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
import sys
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.images=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='a' and 'href' in a:self.links.append(a['href'])
  if tag in ['img','script','link','source']:
   if tag in ['img','script'] and a.get('src'):self.images.append(a['src'])
   if tag=='link' and a.get('href','').startswith('/') and a.get('rel') in ['stylesheet','icon','apple-touch-icon','preload']:self.images.append(a['href'])
   if a.get('srcset'):self.images.extend(x.strip().split()[0] for x in a['srcset'].split(','))
def resolve(path):
 if not path or path=='/':return ROOT/'index.html'
 f=ROOT/path.lstrip('/')
 if path.endswith('/') or f.is_dir():return f/'index.html'
 if not f.suffix:return f.with_suffix('.html')
 return f
pages={}
for f in ROOT.rglob('*.html'):
 if any(p in f.parts for p in ['.git','dist']):continue
 p=Page();p.feed(f.read_text());pages[f]=p
errors=[]
for f,p in pages.items():
 rel=f.relative_to(ROOT)
 if len(set(p.ids))!=len(p.ids):errors.append(f'{rel}: duplicate ID')
 for href in p.links:
  u=urlsplit(href)
  if u.scheme or u.netloc:continue
  target=resolve(u.path) if u.path else f
  if not target.exists():errors.append(f'{rel}: missing link {href}');continue
  if u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:errors.append(f'{rel}: missing fragment {href}')
 for src in p.images:
  u=urlsplit(src)
  if not u.scheme and not u.netloc and not resolve(u.path).is_file():errors.append(f'{rel}: missing asset {src}')
if errors:print('\n'.join(errors),file=sys.stderr);sys.exit(1)
print(f'PASS: links, fragment targets, image variants and unique IDs on {len(pages)} pages.')
