"""Final HTML & asset validation."""
import re
import sys
from pathlib import Path

try:  # Windows consoles default to cp1252
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except AttributeError:  # pragma: no cover
    pass

ROOT = Path(__file__).parent.parent

# File sizes
files = ['index.html', 'css/style.css', 'js/script.js', 'languages/en.json', 'languages/es.json']
print('=== File sizes ===')
for f in files:
    p = ROOT / f
    print(f'  {f:30s} {p.stat().st_size:>8} bytes')

html = (ROOT / 'index.html').read_text(encoding='utf-8')
print()
print('=== HTML structure checks ===')

failures = 0


def check(label, ok, detail=''):
    global failures
    if not ok:
        failures += 1
    print(f'  {"OK" if ok else "FAIL":4s} {label}{": " + detail if detail else ""}')


# h1 should appear exactly once
h1_count = len(re.findall(r'<h1\b', html))
check('h1 count', h1_count == 1, f'{h1_count} (should be 1)')

# All <img> should have alt
imgs_no_alt = re.findall(r'<img(?![^>]*\salt=)[^>]*>', html, re.IGNORECASE)
check('img without alt', len(imgs_no_alt) == 0, str(len(imgs_no_alt)))

# Sections
sections = len(re.findall(r'<section', html))
check('section count', sections >= 6, str(sections))

# Required bits
required = [
    ('lang="en"',            r'<html\s+lang="en"'),
    ('data-theme on html',   r'<html[^>]*data-theme'),
    ('OG title',             r'og:title'),
    ('Twitter card',         r'twitter:card'),
    ('JSON-LD',              r'application/ld\+json'),
    ('manifest link',        r'manifest\.json'),
    ('skip link',            r'class="skip-link"'),
    ('main tag',             r'<main\b'),
    ('lazy/eager loading',   r'loading="(?:lazy|eager)"'),
    ('aria-label flags',     r'aria-label="(?:English|Español)"'),
    ('prefers-reduced-motion in CSS', None),
]
for label, pattern in required:
    if pattern is None:
        css = (ROOT / 'css/style.css').read_text(encoding='utf-8')
        check(label, 'prefers-reduced-motion' in css)
    else:
        matches = re.findall(pattern, html, re.IGNORECASE)
        check(label, len(matches) > 0, str(len(matches)))

# Presence checks (the opposite sense of the loop above)
check('no inline styles', len(re.findall(r'\sstyle="', html, re.IGNORECASE)) == 0,
      str(len(re.findall(r'\sstyle="', html, re.IGNORECASE))))
check('no icon font CDN', 'boxicons' not in html and 'devicon.min.css' not in html)
check('inline SVG sprite', 'class="icon-sprite"' in html)
check('theme-color meta', 'name="theme-color"' in html)
check('no duplicate ids', len(re.findall(r'\sid="', html)) == len(set(re.findall(r'\sid="([^"]+)"', html))))

# Broken local references
print()
print('=== Asset references ===')
refs = set(re.findall(r'(?:href|src)="([^"]+)"', html))
broken = []
for ref in refs:
    if ref.startswith(('http', 'mailto:', 'tel:', '#', 'data:')):
        continue
    if ref.startswith('/'):
        continue
    full = ROOT / ref
    if not full.exists():
        broken.append(ref)
if broken:
    failures += 1
    print(f'  FAIL broken local refs: {broken}')
else:
    print(f'  OK All {len([r for r in refs if not r.startswith(("http", "mailto:", "tel:", "#", "data:"))])} local refs resolve')

print()
if failures:
    print(f'Result: {failures} problem(s) found.')
    sys.exit(1)
print('Result: all checks passed.')
