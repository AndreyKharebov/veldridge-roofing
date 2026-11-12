from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image, ImageOps
import json
import subprocess
import xml.etree.ElementTree as ET

root = Path('src/pages/GalleryPage/assets')
photos = root / 'projects'
icons = root / 'icons'
photos.mkdir(parents=True, exist_ok=True)
icons.mkdir(parents=True, exist_ok=True)
Path('gallery-verification').mkdir(exist_ok=True)
urls = [
    'https://www.figma.com/api/mcp/asset/5a82c163-d899-448d-a299-bd7c4cb46978.png',
    'https://www.figma.com/api/mcp/asset/0f345f51-ed92-45f1-9e18-5a77eaddb7b4.png',
    'https://www.figma.com/api/mcp/asset/62b9157d-91aa-4ca8-8656-e722f9f2dc6a.png',
    'https://www.figma.com/api/mcp/asset/f16b411e-962a-48a6-84fe-935813ae142a.png',
    'https://www.figma.com/api/mcp/asset/979f6257-d54d-49cb-90c5-de5fff6429d0.png',
    'https://www.figma.com/api/mcp/asset/5ad867bc-2287-40cd-ab20-f7376becbdfb.png',
    'https://www.figma.com/api/mcp/asset/3c83283f-911f-4629-8be8-c07350f857aa.png',
    'https://www.figma.com/api/mcp/asset/b589ed91-d4a6-477b-b2c5-df3ba1b4edfb.png',
    'https://www.figma.com/api/mcp/asset/1ee9744c-5ad4-4178-844f-ab4c9846674a.png',
    'https://www.figma.com/api/mcp/asset/e46a61f9-f8e3-4145-8714-1bb24ef02b67.png',
    'https://www.figma.com/api/mcp/asset/127ebde8-5b93-4224-979d-b1c528f77b09.png',
    'https://www.figma.com/api/mcp/asset/04c3d8b6-c7f5-405e-a234-f8994b192ca0.png',
]
def download(url, target):
    subprocess.run(['curl', '-f', '-L', '--retry', '3', '--silent', '--show-error', '-o', str(target), url], check=True)

def optimize(source, dest):
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert('RGB')
        original_size = image.size
        image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        image.save(dest, 'WEBP', quality=88, method=6)
    return {'path': str(dest), 'original': original_size, 'width': image.width, 'height': image.height, 'bytes': dest.stat().st_size}

def fetch_photo(item):
    index, url = item
    dest = photos / f'project-{index:02d}.webp'
    temp = Path('/tmp') / f'gallery-source-{index}.png'
    download(url, temp)
    return optimize(temp, dest)

report = list(ThreadPoolExecutor(max_workers=6).map(fetch_photo, enumerate(urls, 1)))
for index, name in enumerate(['replacement', 'commercial', 'repairs', 'renovation', 'solar', 'inspection'], 13):
    source = Path('src/pages/HomePage/components/Services/assets') / f'{name}.webp'
    report.append(optimize(source, photos / f'project-{index:02d}.webp'))

# Asset mapping checked visually against the Figma previous/next controls.
for name, url in [
    ('close', 'https://www.figma.com/api/mcp/asset/61ad14cc-7f25-4051-b5aa-16f51ee49040.svg'),
    ('arrow-left', 'https://www.figma.com/api/mcp/asset/144af6b1-aef2-4d8c-9502-ce0b2fb046ab.svg'),
    ('arrow-right', 'https://www.figma.com/api/mcp/asset/349ba403-61a6-48df-83a7-b6fe5508e0ee.svg'),
]:
    target = icons / f'{name}.svg'
    download(url, target)
    svg = ET.parse(target).getroot()
    report.append({'path': str(target), 'width': svg.get('width'), 'height': svg.get('height'), 'bytes': target.stat().st_size})
Path('gallery-verification/assets.json').write_text(json.dumps(report, indent=2))
print(json.dumps({'photos': 18, 'icons': 3, 'total_bytes': sum(item['bytes'] for item in report)}))
