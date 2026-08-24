#!/usr/bin/env python3
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup, Comment
from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'data' / 'i18n.json'

SKIP_TAGS = {'script', 'style', 'noscript', 'svg', 'code'}
SKIP_CLASSES = {'article-body', 'article-content', 'error-description', 'error-card', 'search-results'}

def collect_strings():
    strings = set()
    html_paths = list(ROOT.glob('*.html')) + list((ROOT / 'articles').glob('*.html'))
    for html_path in html_paths:
        soup = BeautifulSoup(html_path.read_text(encoding='utf-8'), 'html.parser')
        for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
            comment.extract()
        for node in soup.find_all(string=True):
            parent = node.parent
            if not parent or parent.name in SKIP_TAGS:
                continue
            if any(parent.find_parent(class_=class_name) for class_name in SKIP_CLASSES):
                continue
            value = ' '.join(node.strip().split())
            if value and any('\u0600' <= char <= '\u06ff' for char in value):
                strings.add(value)
        for tag in soup.find_all(['title', 'meta', 'input', 'button']):
            for attr in ('placeholder', 'aria-label', 'title', 'content'):
                value = tag.get(attr)
                if value and any('\u0600' <= char <= '\u06ff' for char in value):
                    strings.add(' '.join(value.strip().split()))
    return sorted(strings, key=lambda item: (len(item), item))

SCHEMA = {
    'type': 'object',
    'properties': {
        'translations': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {'ar': {'type': 'string'}, 'en': {'type': 'string'}},
                'required': ['ar', 'en'],
                'additionalProperties': False
            }
        }
    },
    'required': ['translations'],
    'additionalProperties': False
}

def main():
    strings = collect_strings()
    print(f'Collected {len(strings)} UI strings')
    client = OpenAI()
    prompt = '''Translate each Arabic user-interface string into concise, natural English for a bilingual home-appliance troubleshooting website. Return every item exactly once, preserve numbers, punctuation, HTML entities, and placeholders such as ... or {{value}}. Do not translate brand names, URLs, CSS classes, or code identifiers. JSON only.\n\nStrings:\n''' + json.dumps(strings, ensure_ascii=False)
    response = client.chat.completions.create(
        model='gpt-5-mini',
        messages=[
            {'role': 'system', 'content': 'You are a precise UI localization editor. Output only the requested JSON.'},
            {'role': 'user', 'content': prompt}
        ],
        response_format={'type': 'json_schema', 'json_schema': {'name': 'ui_translations', 'strict': True, 'schema': SCHEMA}},
        max_completion_tokens=12000
    )
    result = json.loads(response.choices[0].message.content)
    mapping = {item['ar']: item['en'] for item in result['translations']}
    fallback = {
        'إخلاء المسؤولية - دليل أعطال غسالات الملابس والأواني | معلومات تعليمية': 'Disclaimer - Washing Machine and Dishwasher Error Guide | Educational Information',
        'أعطال ماركة - دليل أعطال الأجهزة الكهرومنزلية': 'Brand Errors - Home Appliance Error Guide',
        'إخلاء المسؤولية - دليل أعطال الأجهزة الكهرومنزلية': 'Disclaimer - Home Appliance Error Guide',
        'سياسة الخصوصية للموقع، تشمل جمع البيانات وملفات الارتباط.': 'The site privacy policy, including data collection and cookies.'
    }
    mapping.update({item: fallback[item] for item in strings if item in fallback})
    missing = [item for item in strings if item not in mapping]
    if missing:
        mapping.update({item: item for item in missing})
        print(f'Used identity fallback for {len(missing)} strings: {missing[:5]}')
    OUTPUT.write_text(json.dumps({'version': 1, 'defaultLanguage': 'ar', 'languages': ['ar', 'en'], 'translations': mapping}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Wrote {len(mapping)} translations to {OUTPUT}')

if __name__ == '__main__':
    main()
