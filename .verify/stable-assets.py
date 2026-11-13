import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

OUT=Path('admin-qa');OUT.mkdir(exist_ok=True)
checks=[]
with sync_playwright() as pw:
 for name in ['chromium','webkit']:
  browser=getattr(pw,name).launch()
  context=browser.new_context(reduced_motion='reduce',viewport={'width':1440,'height':1000})
  page=context.new_page()
  try:
   page.goto('http://127.0.0.1:5173/gallery',wait_until='networkidle')
   expect(page.locator('.project-card')).to_have_count(12)
   data=page.evaluate("""async()=>{const {readStore}=await import('/src/api/database.js');return {content:await readStore('content','workspace'),media:await readStore('media')}}""")
   assert all(m.get('assetKey') and not m.get('blob') for m in data['media'])
   page.goto('http://127.0.0.1:4173/gallery',wait_until='networkidle')
   expect(page.locator('.project-card')).to_have_count(12)
   page.evaluate("""(data)=>new Promise((resolve,reject)=>{const r=indexedDB.open('veldridge-workspace-v1',1);r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result;const tx=db.transaction(['content','media'],'readwrite');tx.objectStore('content').put(data.content,'workspace');const media=tx.objectStore('media');media.clear();data.media.forEach(m=>media.put(m));tx.oncomplete=()=>{db.close();resolve(true)};tx.onabort=()=>{db.close();reject(tx.error)}}})""",data)
   for route in ['/','/services','/gallery','/blog']:
    page.goto('http://127.0.0.1:4173'+route,wait_until='networkidle')
    expect(page.locator('h1')).to_be_visible()
    page.locator('img').evaluate_all("imgs=>imgs.forEach(img=>img.loading='eager')")
    page.wait_for_function("[...document.images].every(img=>img.complete)",timeout=15000)
    broken=page.locator('img').evaluate_all("imgs=>imgs.filter(img=>img.getAttribute('src')&&!img.naturalWidth).map(img=>img.src)")
    assert not broken,(name,route,broken)
   checks.append({'browser':name,'pass':True,'name':'Persisted development asset keys resolve correctly after switching to production build'})
  except Exception as error:
   checks.append({'browser':name,'pass':False,'error':str(error)})
  finally:
   context.close();browser.close()
(OUT/'stable-assets.json').write_text(json.dumps(checks,indent=2))
print(json.dumps(checks))
raise SystemExit(0 if all(c['pass'] for c in checks) else 1)
