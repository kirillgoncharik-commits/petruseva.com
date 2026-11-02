#!/usr/bin/env python3
"""Compare deployed pages with their checked-in HTML, including metadata and copy."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request,urlopen
import hashlib,json,os,re,sys,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('SITE_BASE_URL','https://petruseva.com').rstrip('/')
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[x.text.replace('https://petruseva.com','') for x in ET.parse(ROOT/'sitemap.xml').findall('.//s:loc',ns)]+['/articles/','/privacy','/robots.txt','/sitemap.xml']
def check(route):
 file=ROOT/(route.lstrip('/')+'index.html' if route.endswith('/') else route.lstrip('/')+('.html' if route=='/privacy' else ''))
 try:
  with urlopen(Request(BASE+route,headers={'User-Agent':'PetrusevaSiteQA/2.0','Cache-Control':'no-cache'}),timeout=20) as response:
   raw=response.read();status=response.status;final=response.url
  expected=file.read_bytes()
  # The custom domain can inject Cloudflare's existing Web Analytics beacon.
  # Ignore only that known external, empty script; compare all authored HTML.
  def normalized(b):
   text=b.decode()
   text=re.sub(r'<script[^>]+src="https://static\.cloudflareinsights\.com/beacon\.min\.js[^"]*"[^>]*>\s*</script>', '', text)
   return re.sub(r'\s+',' ',text).strip()
  same=normalized(raw)==normalized(expected)
  return {'route':route,'status':status,'matches_source':same,'url':final}
 except Exception as ex:return {'route':route,'error':str(ex)}
with ThreadPoolExecutor(max_workers=6) as pool: results=list(pool.map(check,urls))
print(json.dumps(results,ensure_ascii=False,indent=2))
if any(r.get('status')!=200 or not r.get('matches_source') for r in results):sys.exit(1)
print(f'PASS: all {len(results)} published resources match the checked source.')
