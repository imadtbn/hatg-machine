#!/usr/bin/env python3
import json
import time
from pathlib import Path
from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / 'data/errors.json'
FIELDS = ['title', 'category', 'severity', 'symptoms', 'causes', 'affectedParts', 'diagnosisSteps', 'repairSteps', 'commonMistakes', 'preventionTips', 'toolsRequired', 'repairDuration', 'safetyNotes', 'faq']
ITEM = {
    'type': 'object',
    'properties': {
        'id': {'type': 'string'}, 'title': {'type': 'string'}, 'category': {'type': 'string'}, 'severity': {'type': 'string'},
        'symptoms': {'type': 'array', 'items': {'type': 'string'}}, 'causes': {'type': 'array', 'items': {'type': 'string'}},
        'affectedParts': {'type': 'array', 'items': {'type': 'string'}}, 'diagnosisSteps': {'type': 'array', 'items': {'type': 'string'}},
        'repairSteps': {'type': 'array', 'items': {'type': 'string'}}, 'commonMistakes': {'type': 'array', 'items': {'type': 'string'}},
        'preventionTips': {'type': 'array', 'items': {'type': 'string'}}, 'toolsRequired': {'type': 'array', 'items': {'type': 'string'}},
        'repairDuration': {'type': 'string'}, 'safetyNotes': {'type': 'array', 'items': {'type': 'string'}},
        'faq': {'type': 'array', 'items': {'type': 'object', 'properties': {'q': {'type': 'string'}, 'a': {'type': 'string'}}, 'required': ['q', 'a'], 'additionalProperties': False}},
    },
    'required': ['id'] + FIELDS,
    'additionalProperties': False
}
SCHEMA = {'type': 'object', 'properties': {'items': {'type': 'array', 'items': ITEM}}, 'required': ['items'], 'additionalProperties': False}
SYSTEM = '''You translate Arabic appliance error records into concise, natural technical English. Return every record with the same id. Preserve the factual meaning, severity, safety limits, model references, code names and numbers. Do not add diagnosis claims. Translate visible descriptions, categories, steps, tools, duration, safety notes and FAQ question/answer pairs. Output JSON only.'''

def main():
    data = json.loads(FILE.read_text(encoding='utf-8'))
    client = OpenAI()
    for start in range(0, len(data), 8):
        batch = data[start:start+8]
        payload = [{key: article.get(key, []) if isinstance(article.get(key, []), list) else article.get(key, '') for key in ['id'] + FIELDS} for article in batch]
        print(f'Translating errors {start + 1}-{start + len(batch)}/{len(data)}', flush=True)
        response = client.chat.completions.create(
            model='gpt-5-mini',
            messages=[
                {'role': 'system', 'content': SYSTEM},
                {'role': 'user', 'content': 'Translate this batch:\n' + json.dumps(payload, ensure_ascii=False)}
            ],
            response_format={'type': 'json_schema', 'json_schema': {'name': 'translated_errors', 'strict': True, 'schema': SCHEMA}},
            max_completion_tokens=18000
        )
        translated = {item['id']: item for item in json.loads(response.choices[0].message.content)['items']}
        if set(translated) != {article['id'] for article in batch}:
            raise RuntimeError('Batch IDs do not match')
        for article in batch:
            article['en'] = {key: translated[article['id']][key] for key in FIELDS}
        FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        time.sleep(0.2)
    print(f'Translated {len(data)} error records')

if __name__ == '__main__':
    main()
