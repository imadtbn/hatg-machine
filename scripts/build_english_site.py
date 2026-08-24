#!/usr/bin/env python3
import json
import shutil
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup, Comment

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = 'https://imadtbn.github.io/hatg-machine/'
EN_ROOT = ROOT / 'en'

SKIP_FILES = {'google4e08a8803a39e9f9.html', 'google-search-console.html'}
SKIP_TAGS = {'script', 'style', 'noscript', 'code'}
SKIP_ANCESTOR_CLASSES = {'article-body', 'article-content'}
ATTRIBUTE_FALLBACKS = {
    'العودة إلى الرئيسية': 'Return to home',
    'التنقل الرئيسي': 'Main navigation',
    'إعلان': 'Advertisement',
    'مسار الصفحة': 'Breadcrumb',
    'إعلان داخل المقال': 'In-article advertisement',
    'إعلان جانبي': 'Sidebar advertisement',
    'معلومات المقال': 'Article information',
    'معلومات المقالة': 'Article information'
}


def clean_text(value):
    return ' '.join((value or '').split())


def translate_static(soup, translations):
    for node in soup.find_all(string=True):
        if isinstance(node, Comment) or not node.parent or node.parent.name in SKIP_TAGS:
            continue
        if any(node.find_parent(class_=cls) for cls in SKIP_ANCESTOR_CLASSES):
            continue
        raw = clean_text(str(node))
        if raw in translations:
            node.replace_with(str(node).replace(raw, translations[raw]))
    for element in soup.find_all(True):
        for attr in ('content', 'placeholder', 'title', 'aria-label'):
            if not element.has_attr(attr):
                continue
            raw = clean_text(element.get(attr))
            if raw in translations:
                element[attr] = translations[raw]
            elif raw in ATTRIBUTE_FALLBACKS:
                element[attr] = ATTRIBUTE_FALLBACKS[raw]


def add_hreflang(soup, relative_path):
    ar_url = BASE_URL + relative_path
    en_url = BASE_URL + 'en/' + relative_path
    if relative_path == 'index.html':
        ar_url = BASE_URL
        en_url = BASE_URL + 'en/'
    head = soup.head
    if not head:
        return
    for link in head.find_all('link', attrs={'rel': 'alternate'}):
        if link.get('hreflang') in {'ar', 'en', 'x-default'}:
            link.decompose()
    for lang, href in [('ar', ar_url), ('en', en_url), ('x-default', ar_url)]:
        tag = soup.new_tag('link', rel='alternate', hreflang=lang, href=href)
        head.append(tag)


def set_meta(soup, selector, attr, value):
    element = soup.select_one(selector)
    if element:
        element[attr] = value


def set_single_link(soup, rel, href):
    for link in soup.find_all('link', rel=rel):
        link.decompose()
    if soup.head:
        soup.head.append(soup.new_tag('link', rel=rel, href=href))


def rewrite_root_assets(soup):
    for element in soup.find_all(True):
        for attribute in ('href', 'src', 'content'):
            value = element.get(attribute)
            if isinstance(value, str) and value.startswith('assets/'):
                element[attribute] = '../' + value
            elif isinstance(value, str) and value == 'manifest.webmanifest':
                element[attribute] = '../manifest.webmanifest'


def translate_jsonld_scripts(soup):
    def translate_value(value):
        if isinstance(value, dict):
            return {key: translate_value(item) for key, item in value.items()}
        if isinstance(value, list):
            return [translate_value(item) for item in value]
        if isinstance(value, str):
            return translations.get(value, value)
        return value
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(script.string or script.get_text())
        except (TypeError, json.JSONDecodeError):
            continue
        script.string = json.dumps(translate_value(data), ensure_ascii=False, separators=(',', ':'))


def build_article_page(source_html, destination, article):
    soup = BeautifulSoup(source_html, 'html.parser')
    en = article.get('en', {})
    image = article.get('image', '')
    translated_title = en.get('title', article.get('title', ''))
    translated_excerpt = en.get('excerpt', article.get('excerpt', ''))
    soup.html['lang'] = 'en'
    soup.html['dir'] = 'ltr'
    soup.html['data-language'] = 'en'
    soup.body['data-language'] = 'en'
    soup.body['data-article-path'] = 'en/articles/' + article['slug'] + '.html'
    translate_static(soup, translations)
    if soup.title:
        soup.title.string = f"{translated_title} | Home Appliance Error Guide"
    title_node = soup.select_one('#article-detail-title')
    if title_node:
        title_node.string = translated_title
    category = en.get('category', article.get('category', ''))
    for selector in ('#article-category', '#article-breadcrumb-category'):
        node = soup.select_one(selector)
        if node:
            node.string = category
    kicker = soup.select_one('.article-kicker')
    if kicker:
        kicker.clear()
        kicker.append(soup.new_tag('i', attrs={'class': 'fas fa-book-open'}))
        kicker.append(' Trusted practical guide')
    read_time = soup.select_one('#article-read-time')
    if read_time:
        read_time.string = f"{article.get('readTime', '')} min read"
    date_node = soup.select_one('#article-date')
    if date_node:
        date_node.string = datetime.strptime(article['date'], '%Y-%m-%d').strftime('%B %-d, %Y')
    set_meta(soup, 'meta[name="description"]', 'content', translated_excerpt)
    set_meta(soup, 'meta[name="keywords"]', 'content', ', '.join(en.get('keywords', [])))
    en_url = BASE_URL + 'en/articles/' + article['slug'] + '.html'
    set_meta(soup, 'link[rel="canonical"]', 'href', en_url)
    set_meta(soup, 'meta[property="og:title"]', 'content', translated_title)
    set_meta(soup, 'meta[property="og:description"]', 'content', translated_excerpt)
    set_meta(soup, 'meta[property="og:url"]', 'content', en_url)
    set_meta(soup, 'meta[property="og:locale"]', 'content', 'en_US')
    set_meta(soup, 'meta[name="twitter:title"]', 'content', translated_title)
    set_meta(soup, 'meta[name="twitter:description"]', 'content', translated_excerpt)
    if image:
        image_url = BASE_URL + image
        set_meta(soup, 'meta[property="og:image"]', 'content', image_url)
        set_meta(soup, 'meta[name="twitter:image"]', 'content', image_url)
    cover = soup.select_one('#article-cover-image')
    if cover:
        cover['src'] = '../../' + image
        cover['alt'] = en.get('imageAlt', article.get('imageAlt', translated_title))
        caption = cover.find_next('figcaption')
        if caption:
            caption.string = en.get('imageAlt', article.get('imageAlt', translated_title))
    body = soup.select_one('#article-body')
    if body:
        body.clear()
        body.append(BeautifulSoup(en.get('content', article.get('content', '')), 'html.parser'))
        for anchor in body.find_all('a', href=True):
            href = anchor['href']
            if href.startswith(BASE_URL) and '/en/' not in href:
                anchor['href'] = href.replace(BASE_URL, BASE_URL + 'en/', 1)
    updated = soup.select_one('#article-updated')
    if updated:
        updated.parent.contents = [updated.parent.contents[0], updated]
    faq = soup.select_one('#article-faq')
    if faq and en.get('faq'):
        faq.clear()
        for item in en['faq']:
            wrapper = soup.new_tag('div', attrs={'class': 'faq-item'})
            button = soup.new_tag('button', attrs={'class': 'faq-question', 'type': 'button'})
            span = soup.new_tag('span'); span.string = item['q']
            icon = soup.new_tag('i', attrs={'class': 'fas fa-plus'})
            button.extend([span, icon])
            answer = soup.new_tag('div', attrs={'class': 'faq-answer'})
            p = soup.new_tag('p'); p.string = item['a']; answer.append(p)
            wrapper.extend([button, answer]); faq.append(wrapper)
    related_container = soup.select_one('#related-articles')
    if related_container:
        all_articles = list(articles.values())
        related = [item for item in all_articles if item.get('id') != article.get('id') and item.get('category') == article.get('category')][:3]
        if not related:
            related = [item for item in all_articles if item.get('id') != article.get('id')][:3]
        related_container.clear()
        for item in related:
            item_en = item.get('en', {})
            anchor = soup.new_tag('a', href=item['slug'] + '.html', attrs={'class': 'related-article'})
            image_tag = soup.new_tag('img', src='../../' + item.get('image', ''), alt=item_en.get('imageAlt', item_en.get('title', item['slug'])), loading='lazy')
            anchor.append(image_tag)
            span = soup.new_tag('span')
            strong = soup.new_tag('strong'); strong.string = item_en.get('title', item.get('title', item['slug']))
            small = soup.new_tag('small'); small.string = f"{item.get('readTime', '')} min read"
            span.extend([strong, small]); anchor.append(span)
            anchor.append(soup.new_tag('i', attrs={'class': 'fas fa-arrow-left'}))
            related_container.append(anchor)
    sources = soup.select_one('#article-sources')
    if sources and en.get('sources'):
        sources.clear()
        for source in en['sources']:
            li = soup.new_tag('li')
            a = soup.new_tag('a', href=source['url'], target='_blank', rel='noopener noreferrer')
            a.string = source['label']; li.append(a); sources.append(li)
    faq_jsonld = soup.select_one('#faq-jsonld')
    if faq_jsonld and en.get('faq'):
        faq_data = {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
            {'@type': 'Question', 'name': item['q'], 'acceptedAnswer': {'@type': 'Answer', 'text': item['a']}}
            for item in en['faq']
        ]}
        faq_jsonld.string = json.dumps(faq_data, ensure_ascii=False, separators=(',', ':'))
    jsonld = soup.select_one('#article-jsonld')
    if jsonld:
        data = {
            '@context': 'https://schema.org', '@type': 'Article', 'headline': translated_title,
            'description': translated_excerpt, 'datePublished': article.get('date'), 'dateModified': article.get('updated'),
            'inLanguage': 'en', 'mainEntityOfPage': {'@type': 'WebPage', '@id': en_url},
            'author': {'@type': 'Organization', 'name': 'Home Appliance Error Guide'},
            'publisher': {'@type': 'Organization', 'name': 'Home Appliance Error Guide', 'url': BASE_URL},
            'image': BASE_URL + image, 'keywords': ', '.join(en.get('keywords', [])), 'isAccessibleForFree': True
        }
        jsonld.string = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    add_hreflang(soup, 'articles/' + article['slug'] + '.html')
    html = str(soup).replace('href="../assets/', 'href="../../assets/').replace('src="../assets/', 'src="../../assets/').replace('href="../manifest.webmanifest"', 'href="../../manifest.webmanifest"')
    destination.write_text(html, encoding='utf-8')


def build_root_page(source, destination, relative_path):
    soup = BeautifulSoup(source.read_text(encoding='utf-8'), 'html.parser')
    soup.html['lang'] = 'en'; soup.html['dir'] = 'ltr'; soup.html['data-language'] = 'en'
    translate_static(soup, translations)
    if soup.body:
        soup.body['data-language'] = 'en'
    english_url = BASE_URL + ('en/' if relative_path == 'index.html' else 'en/' + relative_path)
    set_single_link(soup, 'canonical', english_url)
    set_meta(soup, 'meta[property="og:url"]', 'content', english_url)
    set_meta(soup, 'meta[property="og:locale"]', 'content', 'en_US')
    translate_jsonld_scripts(soup)
    if relative_path == 'errors.html':
        structured = soup.select_one('#errorsStructuredData')
        if structured:
            try:
                data = json.loads(structured.string or structured.get_text())
                data.update({
                    'name': 'All washing machine and dishwasher faults — comprehensive guide',
                    'description': 'Browse verified error codes and troubleshooting guidance for washing machines and dishwashers.',
                    'url': english_url
                })
                structured.string = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
            except (TypeError, json.JSONDecodeError):
                pass
    rewrite_root_assets(soup)
    add_hreflang(soup, relative_path)
    html = str(soup)
    destination.write_text(html, encoding='utf-8')


if __name__ == '__main__':
    translations = json.loads((ROOT / 'data/i18n.json').read_text(encoding='utf-8')).get('translations', {})
    articles = {item['slug']: item for item in json.loads((ROOT / 'data/articles.json').read_text(encoding='utf-8'))}
    if EN_ROOT.exists():
        shutil.rmtree(EN_ROOT)
    (EN_ROOT / 'articles').mkdir(parents=True)
    for source in sorted(ROOT.glob('*.html')):
        if source.name in SKIP_FILES:
            continue
        destination = EN_ROOT / source.name
        if source.name in {'article.html'}:
            build_root_page(source, destination, source.name)
        else:
            build_root_page(source, destination, source.name)
    for source in sorted((ROOT / 'articles').glob('*.html')):
        slug = source.stem
        if slug in articles:
            build_article_page(source.read_text(encoding='utf-8'), EN_ROOT / 'articles' / source.name, articles[slug])
    print(f'Built English site: {len(list(EN_ROOT.glob("*.html")))} root pages and {len(list((EN_ROOT / "articles").glob("*.html")))} article pages.')
