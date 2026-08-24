#!/usr/bin/env python3
import json
import os
import sys
import time
from pathlib import Path
from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data' / 'articles.json'
OUTPUT = ROOT / 'data' / 'articles.json'

SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "excerpt": {"type": "string"},
        "category": {"type": "string"},
        "keywords": {"type": "array", "items": {"type": "string"}},
        "content": {"type": "string"},
        "faq": {"type": "array", "items": {"type": "object", "properties": {"q": {"type": "string"}, "a": {"type": "string"}}, "required": ["q", "a"], "additionalProperties": False}},
        "sources": {"type": "array", "items": {"type": "object", "properties": {"label": {"type": "string"}, "url": {"type": "string"}}, "required": ["label", "url"], "additionalProperties": False}}
    },
    "required": ["title", "excerpt", "category", "keywords", "content", "faq", "sources"],
    "additionalProperties": False
}

SYSTEM = """You are a careful Arabic-to-English technical editor for a home-appliance troubleshooting website. Translate the supplied article completely into natural, plain international English. Preserve the exact HTML structure in content, including every tag, href URL, target and rel attribute; translate only visible Arabic text and leave URLs, code names, product standards and existing English proper names intact. Keep safety advice conservative and do not add claims. Translate FAQ questions and answers and source labels, but keep source URLs byte-for-byte unchanged. Return JSON only matching the schema."""

def translate(client, article):
    payload = {
        "id": article.get("id"),
        "title": article.get("title", ""),
        "excerpt": article.get("excerpt", ""),
        "category": article.get("category", ""),
        "keywords": article.get("keywords", []),
        "content": article.get("content", ""),
        "faq": article.get("faq", []),
        "sources": article.get("sources", [])
    }
    response = client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": "Translate this article record to English. Keep HTML tags and all URLs unchanged:\n" + json.dumps(payload, ensure_ascii=False)}
        ],
        response_format={"type": "json_schema", "json_schema": {"name": "translated_article", "strict": True, "schema": SCHEMA}},
        max_completion_tokens=12000
    )
    content = response.choices[0].message.content
    if not content:
        raise RuntimeError(f"Empty translation for {article.get('id')}")
    return json.loads(content)

def main():
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    client = OpenAI()
    translated = []
    for index, article in enumerate(data, 1):
        print(f"Translating {index}/{len(data)}: {article.get('id')}", flush=True)
        if isinstance(article.get("en"), dict) and article["en"].get("content"):
            translated.append(article)
            continue
        en = translate(client, article)
        article["en"] = en
        translated.append(article)
        OUTPUT.write_text(json.dumps(translated + data[index:], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        time.sleep(0.2)
    OUTPUT.write_text(json.dumps(translated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Translated {len(translated)} articles")

if __name__ == "__main__":
    main()
