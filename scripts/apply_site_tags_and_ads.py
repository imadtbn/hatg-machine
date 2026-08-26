#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'google-search-console.html', 'google4e08a8803a39e9f9.html'}
ADSENSE_CLIENT = 'ca-pub-5656416032906373'


def asset_path(path: Path):
    rel = path.relative_to(ROOT)
    if 'en' in rel.parts and 'articles' in rel.parts:
        return '../../assets/js/site-tags.js'
    if 'en' in rel.parts:
        return '../assets/js/site-tags.js'
    if 'articles' in rel.parts:
        return '../assets/js/site-tags.js'
    return 'assets/js/site-tags.js'


def add_loader(soup, src):
    for script in soup.find_all('script'):
        if script.get('src', '').endswith(('google-services.js', 'site-tags.js')):
            script.decompose()
        elif script.string and ('gtag(' in script.string or 'googletagmanager.com/gtag/js' in script.string):
            script.decompose()
    tag = soup.new_tag('script', src=src, defer=True)
    tag['data-hatg-site-tags'] = 'true'
    soup.head.append(tag)


def add_unit(container, kind, language, soup):
    if container.find('ins'):
        return
    classes = set(container.get('class', []))
    attrs = {
        'class': 'adsbygoogle',
        'style': 'display:block',
        'data-ad-client': ADSENSE_CLIENT
    }
    if 'article-ad-inline' in classes:
        attrs.update({'data-ad-layout': 'in-article', 'data-ad-format': 'fluid', 'data-ad-slot': '6118497380'})
    elif 'article-ad-top' in classes or 'ad-in-feed' in classes or 'page-ad-after-hero' in classes:
        attrs.update({'data-ad-format': 'fluid', 'data-ad-layout-key': '-fr+56+4k-d4+74', 'data-ad-slot': '7867079394'})
    elif 'ad-recommendations' in classes:
        attrs.update({'data-ad-format': 'autorelaxed', 'data-ad-slot': '6528123169'})
    elif 'page-ad-before-footer' in classes:
        attrs.update({'data-ad-format': 'auto', 'data-full-width-responsive': 'true', 'data-ad-slot': '3143411927'})
    else:
        attrs.update({'data-ad-format': 'auto', 'data-full-width-responsive': 'true', 'data-ad-slot': '1760836049'})
    ad = soup.new_tag('ins', attrs=attrs)
    container.append(ad)
    container.attrs.pop('aria-hidden', None)
    container['aria-label'] = 'Advertisement' if language == 'en' else 'إعلان'
    container['data-ad-state'] = 'waiting'


def choose_containers(soup, is_article):
    containers = soup.select('.ad-container')
    for container in containers:
        container.attrs.pop('aria-label', None)
        container['aria-hidden'] = 'true'
        container['data-ad-state'] = 'empty'
        for child in list(container.find_all(['ins', 'iframe', 'script'])):
            child.decompose()
    if is_article:
        selected = []
        for selector in ('.article-ad-top', '.article-ad-inline', '.ad-recommendations'):
            item = soup.select_one(selector)
            if item and item not in selected:
                selected.append(item)
            if len(selected) == 2:
                break
    else:
        selected = []
        for selector in ('.page-ad-after-hero', '.ad-in-feed', '.ad-recommendations', '.page-ad-before-footer'):
            item = soup.select_one(selector)
            if item:
                selected.append(item)
                break
        if not selected and containers:
            selected = [containers[0]]
    return selected


for path in sorted(ROOT.rglob('*.html')):
    if '.git' in path.parts or path.name in SKIP:
        continue
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    if soup.head is None:
        continue
    add_loader(soup, asset_path(path))
    is_article = 'articles' in path.relative_to(ROOT).parts
    language = 'en' if 'en' in path.relative_to(ROOT).parts else 'ar'
    for container in choose_containers(soup, is_article):
        add_unit(container, 'selected', language, soup)
    path.write_text(str(soup), encoding='utf-8')

print('Added one central site-tags loader to each operational page and populated limited AdSense placements.')
