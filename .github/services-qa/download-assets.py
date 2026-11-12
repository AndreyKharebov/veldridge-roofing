import concurrent.futures
import hashlib
import json
import os
import pathlib
import subprocess
from PIL import Image

assets = json.loads(pathlib.Path('.github/services-qa/assets.json').read_text())
output = pathlib.Path('services-verification')
output.mkdir(exist_ok=True)
originals = pathlib.Path(os.environ['RUNNER_TEMP']) / 'services-original-images'
originals.mkdir(exist_ok=True)


def download(asset):
    original = originals / pathlib.Path(asset['path']).name
    destination = pathlib.Path(asset['path']).with_suffix('.webp')
    destination.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        'curl', '-f', '-L', '--silent', '--show-error', '--retry', '2',
        '--connect-timeout', '20', '--max-time', '120', '-o', str(original), asset['url'],
    ], check=True)
    with Image.open(original) as image:
        source_size = image.size
        image.load()
        image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        image.save(destination, 'WEBP', quality=90, method=6)
        dimensions = image.size
    if destination.stat().st_size < 100:
        raise RuntimeError(f'Empty asset: {destination}')
    return {'path': str(destination), 'bytes': destination.stat().st_size,
            'originalBytes': original.stat().st_size, 'sourceSize': source_size,
            'dimensions': dimensions,
            'sha256': hashlib.sha256(destination.read_bytes()).hexdigest()}


with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    manifest = list(pool.map(download, assets))
(output / 'asset-manifest.json').write_text(json.dumps(manifest, indent=2))

# Keep exactly the approved image compositions while shipping web-sized assets.
for relative in [
    'src/pages/ServicesPage/servicesData.js',
    'src/pages/ServicesPage/components/ServicesHero/ServicesHero.jsx',
    'src/pages/ServicesPage/components/ServicesCTA/ServicesCTA.jsx',
    'src/pages/ServicesPage/README.md',
]:
    file = pathlib.Path(relative)
    file.write_text(file.read_text().replace('.png', '.webp'))
readme = pathlib.Path('src/pages/ServicesPage/README.md')
readme.write_text(readme.read_text().replace(
    'Assets are local exports from the approved Figma design, stored next to the',
    'Assets are local WebP copies of the approved Figma imagery (up to 1600px,\nquality 90, with the original composition retained), stored next to the',
))
subprocess.run([
    'curl', '-f', '-L', '--silent', '--show-error', '--retry', '2',
    '-o', str(output / 'figma-services-1440.png'),
    'https://www.figma.com/api/mcp/asset/80d9d202-bc84-446a-b851-95a9e02188da.png',
], check=True)
print(json.dumps(manifest, indent=2))
