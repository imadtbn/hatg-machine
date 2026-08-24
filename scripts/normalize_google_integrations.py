#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
ADSENSE_CLIENT = 'ca-pub-5656416032906373'
VERIFICATION = 'f5Xi4oFx0v5dN6iPZd9qCw-7vnc3vIbAeYF9jr4vwVM'
MEASUREMENT_ID = 'G-XK4CHWYGWZ'
SKIP = {'google-search-console.html', 'google4e08a8803a39e9f9.html'}


def add_or_update_meta(soup, name, content):
    tag = soup.find('meta', attrs={'name': name})
    if tag is None:
        tag = soup.new_tag('meta', attrs={'name': name, 'content': content})
        soup.head.append(tag)
    else:
        tag['content'] = content


def ensure_script(soup, src):
    if soup.find('script', src=src):
        return
    tag = soup.new_tag('script', src=src, defer=True)
    tag['data-hatg-google-services'] = 'true'
    soup.head.append(tag)


def add_ad(soup, placement, slot, fmt='fluid', layout_key=None):
    wrapper = soup.new_tag('div', attrs={
        'class': f'ad-container page-ad {placement}',
        'data-ad-placement': placement,
        'aria-label': 'إعلان'
    })
    attrs = {
        'class': 'adsbygoogle',
        'style': 'display:block',
        'data-ad-client': ADSENSE_CLIENT,
        'data-ad-slot': slot,
        'data-ad-format': fmt,
        'data-full-width-responsive': 'true'
    }
    if layout_key:
        attrs['data-ad-layout-key'] = layout_key
    ad = soup.new_tag('ins', attrs=attrs)
    wrapper.append(ad)
    return wrapper


def process(path):
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    if soup.head is None:
        return
    for script in soup.find_all('script'):
        if script.string and 'gtag(' in script.string:
            script.decompose()
    add_or_update_meta(soup, 'google-adsense-account', ADSENSE_CLIENT)
    add_or_update_meta(soup, 'google-site-verification', VERIFICATION)
    if path.parent.name == 'articles':
        asset_base = '../../assets/'
    else:
        asset_base = 'assets/'
    ensure_script(soup, f'{asset_base}js/google-services.js')

    if path.name == 'troubleshooting.html' and path.parent == ROOT:
        main = soup.find('main')
        if main and not main.find('ins', class_='adsbygoogle'):
            children = [child for child in main.children if getattr(child, 'name', None)]
            if children:
                children[0].insert_after(add_ad(soup, 'page-ad-after-hero', '7867079394', 'fluid', '-fr+56+4k-d4+74'))
            main.append(add_ad(soup, 'page-ad-before-footer', '3143411927', 'auto'))

    path.write_text(str(soup), encoding='utf-8')


for path in sorted(ROOT.rglob('*.html')):
    if '.git' in path.parts or path.name in SKIP or path.is_relative_to(ROOT / 'en'):
        continue
    process(path)

ads_txt = ROOT / 'ads.txt'
ads_txt.write_text('google.com, pub-5656416032906373, DIRECT, f08c47fec0942fa0\n', encoding='utf-8')
print('Normalized Google integrations and added ads.txt for Arabic source pages.')
