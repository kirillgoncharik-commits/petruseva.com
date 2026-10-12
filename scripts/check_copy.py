#!/usr/bin/env python3
"""Check approved hero text, public professional credentials, and JSON-LD."""
from pathlib import Path
import html
import json
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
  "index.html": [
    "Анастасия Петрусёва · психолог · гештальт-терапевт",
    "Индивидуальная и семейная терапия на русском языке. Онлайн по всему миру."
  ],
  "individual-therapy/index.html": [
    "Индивидуальная терапия онлайн на русском языке",
    "Индивидуальные консультации для взрослых 18+. Работа с тревогой, самооценкой, отношениями, личными границами и жизненными переменами. Встреча длится 60 минут."
  ],
  "couples-therapy/index.html": [
    "Терапия для пар онлайн на русском языке",
    "Консультации для пар, которые сталкиваются с конфликтами, сложностями в общении, вопросами доверия и переменами в отношениях. Совместная встреча длится 90 минут."
  ],
  "emigration-adaptation/index.html": [
    "Психологическая поддержка при переезде и эмиграции",
    "Индивидуальная и парная терапия для русскоязычных взрослых, которым сложно адаптироваться после переезда, справляться с неопределённостью или переменами в семье. Онлайн по всему миру."
  ],
  "montenegro/index.html": [
    "Психолог в Черногории — онлайн и очно в Баре.",
    "Я работаю на русском языке со взрослыми и парами, которые живут в Черногории. Можно встречаться онлайн из любого города страны; очные встречи доступны в Баре по предварительной договорённости."
  ],
  "where-i-work/index.html": [
    "Психолог онлайн для русскоязычных людей в разных странах.",
    "Индивидуальная и семейная терапия на русском языке для людей, живущих в разных странах. Онлайн по всему миру. Очные консультации доступны только в Баре, Черногория."
  ],
  "bar/index.html": [
    "Психолог в Баре — очные и онлайн-встречи на русском языке.",
    "В Баре можно выбрать личную встречу или онлайн-формат. Я работаю со взрослыми индивидуально и с парами; место, время и подходящий формат мы согласуем до первой консультации."
  ],
  "belgrade/index.html": [
    "Русскоязычный психолог в Белграде — онлайн.",
    "Индивидуальные консультации и терапия для пар на русском языке для жителей Белграда и других городов Сербии. Только онлайн, без очного приёма в Сербии."
  ],
  "tbilisi/index.html": [
    "Психолог онлайн в Тбилиси на русском языке.",
    "Индивидуальные консультации и терапия для пар на русском языке для жителей Тбилиси и других городов Грузии. Встречи проходят онлайн."
  ],
  "limassol/index.html": [
    "Психолог онлайн для русскоязычных в Лимассоле.",
    "Индивидуальная и парная терапия на русском языке для жителей Лимассола и других городов Кипра. Консультации проходят только онлайн."
  ],
  "barcelona/index.html": [
    "Психолог онлайн на русском языке в Барселоне.",
    "Индивидуальная и парная терапия на русском языке для жителей Барселоны и других городов Испании. Консультации проходят только онлайн."
  ],
  "lisbon/index.html": [
    "Психолог онлайн на русском для живущих в Лиссабоне.",
    "Индивидуальная и парная терапия на русском языке для жителей Лиссабона и других городов Португалии. Консультации проходят только онлайн."
  ],
  "anxiety-stress/index.html": [
    "Психологическая поддержка при тревоге и стрессе",
    "Индивидуальная терапия для взрослых, которые сталкиваются с постоянным беспокойством, эмоциональным истощением или стрессом. Консультации на русском языке, онлайн."
  ],
  "boundaries-self-esteem/index.html": [
    "Самооценка, личные границы и чувство вины",
    "Индивидуальная терапия для взрослых, которым трудно говорить «нет», отстаивать границы, принимать решения или справляться с чувством вины. На русском языке, онлайн."
  ],
  "about/index.html": [
    "Анастасия Петрусёва - психолог и гештальт-терапевт",
    "Частная практика с 2019 года. Индивидуальная и семейная терапия на русском языке, онлайн по всему миру и очно в Баре, Черногория."
  ],
  "contact/index.html": [
    "Запись на консультацию психолога",
    "Расскажите, что вас сейчас волнует, и укажите, какой формат вам ближе. Я отвечу лично и предложу возможное время первой встречи."
  ],
  "articles/index.html": [
    "Статьи о психотерапии, отношениях и переезде",
    "Здесь будут опубликованы авторские материалы Анастасии Петрусёвой о терапии, отношениях, эмиграции и адаптации. Без типовых SEO-статей и выдуманных историй."
  ]
}
errors = []

def plain(fragment):
    return html.unescape(re.sub(r"<[^>]*>", "", fragment)).strip()

def hero_copy(document):
    match = re.search(r'<section\s+class="(?:hero|page-hero)"[^>]*>([\s\S]*?)</section>', document)
    if not match:
        return None
    fragment = match.group(1)
    h1 = re.search(r'<h1[^>]*>([\s\S]*?)</h1>', fragment)
    lead = re.search(r'<p class="lead">([\s\S]*?)</p>', fragment)
    return [plain(h1.group(1)) if h1 else None,
            plain(lead.group(1)) if lead else None,
            fragment]

for file in ROOT.rglob("*.html"):
    relative = file.relative_to(ROOT).as_posix()
    document = file.read_text(encoding="utf-8")
    if re.search(r"\bEAGT\b", document, re.I):
        errors.append(f"{relative}: EAGT in published HTML or metadata")
    for data in re.findall(r'<script type="application/ld\+json">([\s\S]*?)</script>', document):
        try:
            json.loads(data)
        except json.JSONDecodeError as ex:
            errors.append(f"{relative}: invalid JSON-LD: {ex}")
    if relative not in EXPECTED:
        continue
    current = hero_copy(document)
    if current is None:
        errors.append(f"{relative}: missing hero")
        continue
    if current[:2] != EXPECTED[relative]:
        errors.append(f"{relative}: approved hero H1 or lead changed")
    if re.search(r"выдохнуть|глубин|\bопору\b|пространств", plain(current[2]), re.I):
        errors.append(f"{relative}: vague phrasing in hero")

for path in EXPECTED:
    if not (ROOT / path).is_file():
        errors.append(f"{path}: missing HTML file")

ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
for item in ET.parse(ROOT / "sitemap.xml").findall(".//s:loc", ns):
    slug = (item.text or "").removeprefix("https://petruseva.com/")
    path = (slug + "index.html") if slug else "index.html"
    if path not in EXPECTED:
        errors.append(f"{path}: sitemap route without copy baseline")

if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)
print(f"PASS: {len(EXPECTED)} hero blocks, EAGT removed, JSON-LD valid")
