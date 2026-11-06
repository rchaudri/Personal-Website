#!/usr/bin/env python3
"""Dependency-free checks for the static portfolio. Run from any directory."""
from html.parser import HTMLParser
from html import unescape
from pathlib import Path
from urllib.parse import urlparse, unquote
import json
import hashlib
import struct
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
class Document(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.refs, self.h1s = path, set(), [], 0
        self.errors, self.canonical, self.description, self.title = [], None, None, False
        self.in_json, self.json_text = False, ''
        self.feed(path.read_text())
    def handle_starttag(self, tag, attributes):
        a = dict(attributes)
        if 'id' in a:
            if a['id'] in self.ids: self.errors.append(f"Duplicate id: {a['id']}")
            self.ids.add(a['id'])
        if tag == 'h1': self.h1s += 1
        if tag == 'title': self.title = True
        if tag == 'img' and 'alt' not in a: self.errors.append('Image missing alt text')
        if tag == 'img' and not a.get('src') and not a.get('srcset'): self.errors.append('Image missing source')
        if tag == 'meta' and a.get('name') == 'description': self.description = a.get('content')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical = a.get('href')
        if tag == 'a' and a.get('target') == '_blank' and 'noopener' not in a.get('rel', ''):
            self.errors.append('External new-tab link missing noopener')
        for attr in ['href', 'src', 'data-evidence']:
            if a.get(attr): self.refs.append((tag, a[attr]))
        if a.get('srcset'):
            self.refs += [(tag, s.strip().split()[0]) for s in a['srcset'].split(',')]
        if tag == 'script' and a.get('type') == 'application/ld+json': self.in_json = True
    def handle_data(self, data):
        if self.in_json: self.json_text += data
    def handle_endtag(self, tag):
        if tag == 'script' and self.in_json:
            try: json.loads(self.json_text)
            except ValueError as e: self.errors.append(f'Invalid structured data: {e}')
            self.in_json, self.json_text = False, ''

pages = {p: Document(p) for p in ROOT.glob('*.html') if not p.name.startswith('google')}
errors = []
for path, doc in pages.items():
    if doc.h1s != 1: doc.errors.append(f'Expected one H1, found {doc.h1s}')
    if not (doc.title and doc.description and doc.canonical): doc.errors.append('Missing page metadata')
    for tag, ref in doc.refs:
        url = urlparse(ref)
        if url.scheme or url.netloc: continue
        target = (path.parent / unquote(url.path)).resolve() if url.path else path
        if target.is_dir(): target /= 'index.html'
        if not target.exists(): doc.errors.append(f'Missing {tag} destination: {ref}')
        elif url.fragment and target in pages and url.fragment not in pages[target].ids:
            doc.errors.append(f'Missing anchor: {ref}')
    errors += [f'{path.name}: {e}' for e in doc.errors]
for path in (ROOT/'assets').rglob('*.css'):
    for ref in re.findall(r'url\([\'\"]?([^\)\'\"]+)', path.read_text()):
        if not urlparse(ref).scheme and not (path.parent/ref).exists(): errors.append(f'{path}: missing {ref}')
manifest = json.loads((ROOT/'site.webmanifest').read_text())
for icon in manifest['icons']:
    if not (ROOT/icon['src']).exists(): errors.append(f'Missing manifest icon: {icon["src"]}')
urls = ET.parse(ROOT/'sitemap.xml').getroot()
canonicals = [p.canonical for p in pages.values() if p.path.name != '404.html']
for node in urls:
    url = node.find('{*}loc').text
    if url not in canonicals: errors.append(f'Sitemap URL has no canonical page: {url}')
    if url.endswith('/index.html'): errors.append('Sitemap contains duplicate homepage alias')
for path in pages:
    text = path.read_text()
    for obsolete in ['GPT-5.1', 'Gemini 3 Pro', 'Stealth Startup', 'Master of Science in Computational Data Science']:
        if obsolete in text: errors.append(f'{path.name}: stale career wording: {obsolete}')
# Keep employer attribution and exact role titles inspectable on every case study.
case_records = {
    'soma.html': ('SOMA', 'AI/ML Engineer & Product Manager', '2024–2026'),
    'trivium.html': ('Trivium', 'Software Engineer & Product Management Intern', '2023–2024'),
    'cfo-agent.html': ('Trivium', 'Software Engineer & Product Management Intern', '2023–2024'),
    'wildfire-agent.html': ('Trivium', 'Software Engineer & Product Management Intern', '2023–2024'),
    'code-intelligence.html': ('Texas Instruments', 'AI Engineer', 'September 2026–present'),
    'marsh.html': ('Marsh', 'Finance Innovation Technology Intern', 'June–July 2026'),
}
for name, record in case_records.items():
    html = (ROOT/name).read_text()
    meta = re.search(r'<dl class="page-meta">(.*?)</dl>', html, re.S)
    if not meta or any(value not in unescape(meta.group(1)) for value in record):
        errors.append(f'{name}: employer, role, or dates missing from project record')
# Supplied originals must remain byte-identical to the current handoff.
for asset in json.loads((ROOT/'assets/asset-map.json').read_text())['assets']:
    path = ROOT/asset['package_path']
    if not path.exists() or hashlib.sha256(path.read_bytes()).hexdigest() != asset['sha256']:
        errors.append(f'Source photograph changed: {asset["package_path"]}')
# The selected portrait must be the only active favicon source.
for path in pages:
    if 'assets/identity/favicon.svg' in path.read_text(): errors.append(f'{path.name}: superseded monogram favicon')
ico = (ROOT/'favicon.ico').read_bytes()
if struct.unpack('<HHH', ico[:6]) != (0, 1, 3) or sorted(ico[6+i*16] for i in range(3)) != [16, 32, 48]:
    errors.append('Favicon ICO must contain 16, 32, and 48 pixel exports')
# Display headings use no decorative periods; creative work stays in the footer.
for path in pages:
    html = path.read_text()
    for content in re.findall(r'<h[1-6]\b[^>]*>(.*?)</h[1-6]>', html, re.S):
        text = re.sub(r'<[^>]+>', '', content).strip()
        if text.endswith('.'):
            errors.append(f'{path.name}: display heading ends with a period: {text}')
    main = re.search(r'<main\b[^>]*>(.*?)</main>', html, re.S)
    if main and re.search(r'King of Fremont|kingoffremont', main.group(1), re.I):
        errors.append(f'{path.name}: creative work appears in main professional content')
    if html.count('class="creative-footnote"') != 1:
        errors.append(f'{path.name}: expected one minimal creative footer link')
home = (ROOT/'index.html').read_text()
if not re.search(r'<section[^>]+id="recognition"', home) or 'data-evidence="senate.jpeg"' not in home:
    errors.append('Homepage must feature the Senate certificate with a direct original-image viewer')
for path in pages:
    if re.search(r'class="(?:graph-visual|finance-visual)"', path.read_text()):
        errors.append(f'{path.name}: superseded placeholder graphic remains')
# The independent hand is the first visual project; rejected slogans stay out.
lead = re.search(r'<section[^>]+id="bionic-hand"(.*?)</section>', home, re.S)
if not lead or 'id="hand-hero-image"' not in lead.group(1):
    errors.append('The bionic hand must remain the lead homepage feature')
if home.find('id="bionic-hand"') > home.find('id="recognition"'):
    errors.append('The hand feature must precede recognition')
for path in pages:
    if re.search(r'curiosity,?\s*made useful', path.read_text(), re.I):
        errors.append(f'{path.name}: rejected slogan remains')
if errors:
    print('\n'.join(errors)); sys.exit(1)
print(f'PASS: {len(pages)} pages; local links, fragments, assets, metadata, JSON-LD, sitemap, icons, career consistency, source-photo hashes, portrait icons, and employer attribution.')
