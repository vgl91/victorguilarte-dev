"""Verify the translation layer is consistent between HTML, JS, en.json and es.json.

Checks:
  1. Every key referenced by the HTML (data-text / data-aria-label) exists in both JSON files.
  2. Every key referenced by the JS (t('key')) exists in both JSON files.
  3. EN and ES expose exactly the same key set.
  4. The English fallback text baked into the HTML still matches en.json (no drift).
  5. Informational: keys that are defined but never referenced.
"""
import html as html_module
import json
import re
import sys
from pathlib import Path

try:  # Windows consoles default to cp1252 and choke on the symbols below
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except AttributeError:  # pragma: no cover - very old Python
    pass

ROOT = Path(__file__).parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
script = (ROOT / "js" / "script.js").read_text(encoding="utf-8")
en = json.loads((ROOT / "languages" / "en.json").read_text(encoding="utf-8"))
es = json.loads((ROOT / "languages" / "es.json").read_text(encoding="utf-8"))

html_text_keys = set(re.findall(r'data-text="([^"]+)"', html))
html_aria_keys = set(re.findall(r'data-aria-label="([^"]+)"', html))
js_keys = set(re.findall(r"\bt\('([^']+)'", script))
html_keys = html_text_keys | html_aria_keys
referenced = html_keys | js_keys
en_keys = set(en.keys())
es_keys = set(es.keys())

print("=== Translation key report ===")
print(f"  HTML data-text keys:      {len(html_text_keys)}")
print(f"  HTML data-aria-label:     {len(html_aria_keys)}")
print(f"  JS t('key') lookups:      {len(js_keys)}")
print(f"  Referenced in total:      {len(referenced)}")
print(f"  EN keys:                  {len(en_keys)}")
print(f"  ES keys:                  {len(es_keys)}")

failures = 0

missing_en = referenced - en_keys
missing_es = referenced - es_keys

if missing_en:
    failures += 1
    print(f"\n[FAIL] Referenced but missing in EN.json ({len(missing_en)}):")
    for k in sorted(missing_en):
        print(f"   - {k}")
else:
    print("\n[OK] Every referenced key exists in EN.json")

if missing_es:
    failures += 1
    print(f"\n[FAIL] Referenced but missing in ES.json ({len(missing_es)}):")
    for k in sorted(missing_es):
        print(f"   - {k}")
else:
    print("[OK] Every referenced key exists in ES.json")

if en_keys != es_keys:
    failures += 1
    print("\n[FAIL] EN/ES key mismatch:")
    print(f"   Only EN: {sorted(en_keys - es_keys)}")
    print(f"   Only ES: {sorted(es_keys - en_keys)}")
else:
    print("[OK] EN and ES have identical key sets")

# Drift check: the English fallback baked into the HTML must match en.json.
pattern = re.compile(
    r'<([a-zA-Z][\w-]*)((?:\s+[^<>]*?)?)\sdata-text="([^"]+)"((?:\s+[^<>]*?)?)>([\s\S]*?)</\1>'
)
drift = []
for match in pattern.finditer(html):
    key, rendered = match.group(3), html_module.unescape(match.group(5))
    expected = en.get(key)
    if expected is None:
        continue
    if rendered.strip() != expected.strip():
        drift.append((key, rendered.strip(), expected.strip()))

if drift:
    failures += 1
    print(f"\n[FAIL] HTML fallback text drifted from en.json ({len(drift)}):")
    for key, rendered, expected in drift:
        print(f"   - {key}")
        print(f"       html: {rendered[:90]}")
        print(f"       json: {expected[:90]}")
else:
    print("[OK] HTML fallback text matches en.json")

unused = en_keys - referenced
if unused:
    print(f"\n[INFO] Keys in EN.json never referenced ({len(unused)}):")
    for k in sorted(unused):
        print(f"   - {k}")

print()
if failures:
    print(f"Result: {failures} problem(s) found.")
    sys.exit(1)
print("Result: all checks passed.")
