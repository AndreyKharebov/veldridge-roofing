from pathlib import Path
import base64, zlib, hashlib, subprocess
patch = zlib.decompress(base64.b64decode(Path('.verify/recovery-patch.txt').read_text()))
assert hashlib.sha256(patch).hexdigest() == '0205033c8eb85c8fcc2528ee749488d5209a22ef115e3a0d2501bfb1dc09e146'
if 'function encodeImage' not in Path('src/api/database.js').read_text():
    subprocess.run(['git', 'apply', '--check', '-'], input=patch, check=True)
    subprocess.run(['git', 'apply', '-'], input=patch, check=True)
