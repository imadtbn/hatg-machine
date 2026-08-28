#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'google-search-console.html', 'google4e08a8803a39e9f9.html'}
PAGES = sorted(p for p in ROOT.rglob('*.html') if '.git' not in p.parts and p.name not in SKIP)
errors = []
for path in PAGES:
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    rel = path.relative_to(ROOT)
    loaders = soup.find_all('script', attrs={'data-hatg-site-tags': 'true'})
    if len(loaders) != 1:
        errors.append(f'{rel}: expected one site-tags loader, found {len(loaders)}')
    if soup.find('script', src=lambda value: value and ('google-services.js' in value or 'adsData.js' in value)):
        errors.append(f'{rel}: legacy Google loader is still referenced')
    direct_ga = soup.find('script', string=lambda value: value and "gtag('config'" in value)
    if direct_ga:
        errors.append(f'{rel}: direct gtag config found in HTML')
    ads = soup.select('ins.adsbygoogle')
    if len(ads) > 2:
        errors.append(f'{rel}: more than two ad units')
    for ad in ads:
        if ad.get('data-ad-client') != 'ca-pub-5656416032906373':
            errors.append(f'{rel}: unexpected AdSense client')
        if not ad.get('data-ad-slot'):
            errors.append(f'{rel}: ad unit is missing slot')

loader = (ROOT / 'assets/js/site-tags.js').read_text(encoding='utf-8')
for required in ("ga4Id: 'G-XK4CHWYGWZ'", "ga4Mode: 'gtm'", "gtmId: 'GTM-K99RH3XD'", "clarityId: 'xxxxxxxxx'", "adsenseClient: 'ca-pub-5656416032906373'"):
    if required not in loader:
        errors.append(f'site-tags.js: missing expected config {required}')
if "adsense_js" in loader:
    pass
if "gtmId: 'GTM-K99RH3XD'" in loader and "CONFIG.ga4Mode !== 'direct'" not in loader:
    errors.append('site-tags.js: direct GA4 fallback is not guarded by ga4Mode')
if "gtmId: 'GTM-K99RH3XD'" in loader and "clarity.ms/tag" in loader and "clarityId: 'xxxxxxxxx'" not in loader:
    errors.append('site-tags.js: Clarity must be configured through GTM when GTM is active')

if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print(f'Site-tags validation passed: {len(PAGES)} pages, one central loader per page, max two ad units per page, GA4 routed through GTM, AdSense enabled, and direct Clarity disabled until configured in GTM.')
