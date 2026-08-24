#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'google-search-console.html', 'google4e08a8803a39e9f9.html'}
PAGES = sorted(path for path in ROOT.rglob('*.html') if '.git' not in path.parts and path.name not in SKIP)
errors = []
for path in PAGES:
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    relative = path.relative_to(ROOT)
    if not soup.find('script', src=lambda value: value and 'google-services.js' in value):
        errors.append(f'{relative}: missing google-services.js')
    if not soup.find('meta', attrs={'name': 'google-site-verification'}):
        errors.append(f'{relative}: missing Google verification meta')
    if not soup.find('meta', attrs={'name': 'google-adsense-account'}):
        errors.append(f'{relative}: missing AdSense account meta')
    if not soup.find('ins', class_='adsbygoogle'):
        errors.append(f'{relative}: missing AdSense unit')

ads_txt = ROOT / 'ads.txt'
if ads_txt.read_text(encoding='utf-8').strip() != 'google.com, pub-5656416032906373, DIRECT, f08c47fec0942fa0':
    errors.append('ads.txt: publisher line is missing or unexpected')

if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print(f'Google integration validation passed: {len(PAGES)} operational HTML pages, all with Analytics loader, verification meta, AdSense meta, and ad unit.')
