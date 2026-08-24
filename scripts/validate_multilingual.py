#!/usr/bin/env python3
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://imadtbn.github.io/hatg-machine/'
errors = []

for name in ('articles.json', 'errors.json', 'taxonomy.json', 'brands.json', 'i18n.json'):
    try:
        json.loads((ROOT / 'data' / name).read_text(encoding='utf-8'))
    except Exception as exc:
        errors.append(f'Invalid JSON {name}: {exc}')

articles = json.loads((ROOT / 'data/articles.json').read_text(encoding='utf-8'))
for article in articles:
    if not article.get('en', {}).get('content'):
        errors.append(f'Missing English article content: {article.get("slug")}')
    image = article.get('image')
    if not image or not (ROOT / image).exists():
        errors.append(f'Missing article image: {image}')

for path in list(ROOT.glob('*.html')) + list((ROOT / 'articles').glob('*.html')):
    if path.name.startswith('google'):
        continue
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    langs = {link.get('hreflang') for link in soup.find_all('link', rel='alternate')}
    if not {'ar', 'en', 'x-default'} <= langs:
        errors.append(f'Missing hreflang on {path.relative_to(ROOT)}')

for path in list((ROOT / 'en').glob('*.html')) + list((ROOT / 'en/articles').glob('*.html')):
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    if soup.html and (soup.html.get('lang') != 'en' or soup.html.get('dir') != 'ltr'):
        errors.append(f'Wrong language direction: {path.relative_to(ROOT)}')
    expected_asset_prefix = '../../assets/' if path.parent.name == 'articles' else '../assets/'
    expected_manifest = '../../manifest.webmanifest' if path.parent.name == 'articles' else '../manifest.webmanifest'
    for element in soup.find_all(['link', 'script', 'img']):
        value = element.get('href') or element.get('src')
        if value and ('assets/' in value or 'manifest.webmanifest' in value) and value.startswith(('../', 'assets/', 'manifest.webmanifest')):
            if ('assets/' in value and not value.startswith(expected_asset_prefix)) or ('manifest.webmanifest' in value and value != expected_manifest):
                errors.append(f'Wrong asset path in English page: {path.relative_to(ROOT)} -> {value}')

try:
    ET.parse(ROOT / 'sitemap.xml')
except Exception as exc:
    errors.append(f'Invalid sitemap XML: {exc}')

sitemap = (ROOT / 'sitemap.xml').read_text(encoding='utf-8')
for token in ('xmlns:xhtml=', 'xmlns:image=', '/en/', 'hreflang="x-default"'):
    if token not in sitemap:
        errors.append(f'Missing sitemap feature: {token}')

if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print(f'Validation passed: {len(articles)} articles, {len(list((ROOT / "en").glob("*.html")))} English root pages, valid XML sitemap.')
