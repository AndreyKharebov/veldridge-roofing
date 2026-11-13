from pathlib import Path
source = Path('.verify/admin-qa.py').read_text()
old = " goto(page,'/admin')\n if '/login' in page.url:"
new = " goto(page,'/admin')\n expect(page.locator('.admin-login, .admin-content')).to_be_visible(timeout=15000)\n if page.locator('.admin-login').count():"
assert old in source
source = source.replace(old, new, 1)
exec(compile(source, '.verify/admin-qa.py', 'exec'))
