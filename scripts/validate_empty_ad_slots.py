#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'google-search-console.html', 'google4e08a8803a39e9f9.html'}
pages = sorted(path for path in ROOT.rglob('*.html') if '.git' not in path.parts and path.name not in SKIP)
errors = []
containers = 0
for path in pages:
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    rel = path.relative_to(ROOT)
    if not soup.find('script', src=lambda value: value and 'google-services.js' in value):
        errors.append(f'{rel}: missing Google Analytics loader')
    if not soup.find('meta', attrs={'name': 'google-site-verification'}):
        errors.append(f'{rel}: missing verification meta')
    for container in soup.select('.ad-container'):
        containers += 1
        if container.find(['ins', 'iframe', 'script']):
            errors.append(f'{rel}: ad container is not empty')
        if container.get('aria-hidden') != 'true':
            errors.append(f'{rel}: empty ad container must be aria-hidden')

if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print(f'Empty ad-slot validation passed: {len(pages)} pages, {containers} preserved empty containers; Analytics and verification remain enabled.')
