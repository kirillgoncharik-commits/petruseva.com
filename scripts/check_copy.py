#!/usr/bin/env python3
"""Verify author content, current user overrides and shared generated pages."""
from pathlib import Path
from html import unescape
import json,re,sys
ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'content/site.json').read_text())
errors=[]
def plain(raw): return re.sub(r'\s+',' ',unescape(re.sub('<[^>]+>',' ',raw))).strip()
def normalized(raw): return re.sub(r'\s+',' ',unescape(raw)).strip()
def page(path): return (ROOT/path).read_text()
def check_text(path,strings):
 text=plain(page(path))
 for s in strings:
  if normalized(s) not in text: errors.append(f'{path}: missing author paragraph {s[:85]}')
def check_help(path,indices):
 for i in indices:
  topic=DATA['help'][i];check_text(path,[topic['title'],*topic['items'],*topic['paragraphs']])
check_text('about/index.html',[DATA['intro'],*sum([DATA[k] for k in ['practice','education','certification','migip','mig','development','story']],[])])
check_text('index.html',DATA['practice'])
check_help('index.html',range(7))
for path,indices in {'individual-therapy/index.html':[1,4,5],'couples-therapy/index.html':[2],'emigration-adaptation/index.html':[0],'boundaries-self-esteem/index.html':[3],'anxiety-stress/index.html':[6]}.items():check_help(path,indices)
for path in ['index.html','contact/index.html']:
 check_text(path,[s for q in DATA['faq'] for s in [q['question'],*q['paragraphs']]])
 for x in DATA['conditions']:
  # User's latest request removes public prices, preserving all other conditions.
  check_text(path,x['paragraphs'][2:] if x['id']=='cost' else x['paragraphs'])
for path in ['index.html','contact/index.html','individual-therapy/index.html','couples-therapy/index.html']:
 check_text(path,DATA['conditions'][1]['paragraphs'][2:]+DATA['conditions'][2]['paragraphs'])
for f in ROOT.rglob('*.html'):
 if any(p in f.parts for p in ['dist','.git']):continue
 s=f.read_text(); rel=f.relative_to(ROOT)
 if re.search(r'€|EUR|₽|(?:50|60)\s*(?:евро|руб)',s):errors.append(f'{rel}: public price remains')
 if re.search(r'(?<![а-я])очн[а-я]*|пилот|редакционный план|Петрусева\.pdf',s,re.I):errors.append(f'{rel}: outdated format or service language')
 if 'fonts.googleapis.com' in s:errors.append(f'{rel}: external font loading')
 for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S):
  try: json.loads(block)
  except ValueError:errors.append(f'{rel}: invalid JSON-LD')
for path in ['index.html','about/index.html']:
 check_text(path,['EAGT','Московский институт психоанализа'])
if len(DATA['help'])!=7 or len(DATA['faq'])!=13 or len(DATA['story'])!=12:errors.append('incomplete author source')
if 'noindex, follow' not in page('articles/index.html'):errors.append('articles must stay noindex')
if errors:print('\n'.join(errors),file=sys.stderr);sys.exit(1)
print('PASS: all author paragraphs, 7 topics, 13 FAQ, 12 story paragraphs; online-only; no public prices.')
