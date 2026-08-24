#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://imadtbn.github.io/hatg-machine/'


def add_hreflang(path: Path, relative: str):
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    if not soup.head:
        return
    for link in soup.head.find_all('link', rel='alternate'):
        if link.get('hreflang') in {'ar', 'en', 'x-default'}:
            link.decompose()
    ar = BASE + relative if relative != 'index.html' else BASE
    en = BASE + 'en/' + relative if relative != 'index.html' else BASE + 'en/'
    for lang, href in (('ar', ar), ('en', en), ('x-default', ar)):
        soup.head.append(soup.new_tag('link', rel='alternate', hreflang=lang, href=href))
    path.write_text(str(soup), encoding='utf-8')


for path in sorted(ROOT.glob('*.html')):
    if path.name not in {'google4e08a8803a39e9f9.html', 'google-search-console.html'}:
        add_hreflang(path, path.name)
for path in sorted((ROOT / 'articles').glob('*.html')):
    add_hreflang(path, 'articles/' + path.name)
print('Added reciprocal hreflang links to Arabic pages.')
