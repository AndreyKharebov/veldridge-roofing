import concurrent.futures
import hashlib
import json
import pathlib
import subprocess

assets = json.loads(pathlib.Path('.github/services-qa/assets.json').read_text())
output = pathlib.Path('services-verification')
output.mkdir(exist_ok=True)


def download(asset):
    path = pathlib.Path(asset['path'])
    path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        'curl', '-f', '-L', '--silent', '--show-error', '--retry', '2',
        '--connect-timeout', '20', '--max-time', '120', '-o', str(path), asset['url'],
    ], check=True)
    if path.stat().st_size < 100:
        raise RuntimeError(f'Empty asset: {path}')
    return {'path': str(path), 'bytes': path.stat().st_size,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    manifest = list(pool.map(download, assets))
(output / 'asset-manifest.json').write_text(json.dumps(manifest, indent=2))
subprocess.run([
    'curl', '-f', '-L', '--silent', '--show-error', '--retry', '2',
    '-o', str(output / 'figma-services-1440.png'),
    'https://www.figma.com/api/mcp/asset/80d9d202-bc84-446a-b851-95a9e02188da.png',
], check=True)
print(json.dumps(manifest, indent=2))
