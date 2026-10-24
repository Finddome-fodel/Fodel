#!/usr/bin/env python3
"""Create an isolated local checkout without reading OneDrive placeholders.

Uses the existing ~/fodel-dev mirror only when its file size AND modification
 timestamp match the cloud placeholder. Never writes to that running mirror,
 copies credentials, or treats an unavailable file as a deletion.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import tempfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--target', default=str(Path(tempfile.gettempdir()) / 'fodel-local-check'))
parser.add_argument('--mirror', default=str(Path.home() / 'fodel-dev'))
args = parser.parse_args()
source = Path(__file__).resolve().parent.parent
mirror = Path(args.mirror).expanduser().resolve()
target = Path(args.target).expanduser().resolve()
if target == mirror or target == source or source in target.parents or target in source.parents:
    raise SystemExit('Use a separate target outside OneDrive and outside the running fodel-dev mirror.')
excluded = {'.git', 'node_modules', 'dist', '.astro', '.vercel', '.e2e', 'playwright-report', 'test-results', '__pycache__', '.codex', '.aws', '.agents'}
manifest_file = target / '.local-source-manifest.json'
previous = json.loads(manifest_file.read_text()) if manifest_file.exists() else {}
prepared = []
errors = []
for directory, dirs, names in os.walk(source):
    dirs[:] = [d for d in dirs if d not in excluded]
    for name in names:
        if name.startswith('.env') and name not in {'.env.example', '.env.test.example'}:
            continue
        original = Path(directory) / name
        relative = original.relative_to(source)
        selected = original
        info = original.stat()
        # macOS SF_DATALESS: checking flags never attempts to download content.
        cloud_only = bool(getattr(info, 'st_flags', 0) & 0x40000000)
        if cloud_only:
            selected = mirror / relative
            if not selected.is_file():
                errors.append(f'{relative}: no local mirror copy')
                continue
            local = selected.stat()
            if getattr(local, 'st_flags', 0) & 0x40000000 or local.st_size != info.st_size or abs(local.st_mtime - info.st_mtime) > 2:
                errors.append(f'{relative}: mirror version differs from the OneDrive placeholder')
                continue
        try:
            data = selected.read_bytes()
        except OSError as error:
            errors.append(f'{relative}: {error}')
            continue
        digest = hashlib.sha256(data).hexdigest()
        destination = target / relative
        baseline = previous.get(str(relative), {}).get('sha256')
        if destination.is_file() and baseline:
            existing_digest = hashlib.sha256(destination.read_bytes()).hexdigest()
            if existing_digest not in {baseline, digest}:
                errors.append(f'{relative}: target contains local edits; copy them back before preparing again')
                continue
        prepared.append((relative, selected, digest, cloud_only))
if errors:
    raise SystemExit('Nothing copied. Resolve these files first:\n' + '\n'.join(errors))
manifest = {}
for relative, selected, digest, cloud_only in prepared:
    destination = target / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(selected, destination)
    manifest[str(relative)] = {'sha256': digest, 'recoveredFromMirror': cloud_only}
manifest_file.write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Prepared {len(prepared)} source files in {target}')
print(f'Recovered {sum(1 for row in prepared if row[3])} verified OneDrive placeholders from {mirror}')
print('No credentials, Git metadata, dependencies, or build caches were copied. The running mirror was not changed.')
print(f'Next: cd "{target}" && npm ci && npm run check && npm run test:rules && npm run test:listing && npm run test:listing:migration && npm run build')
