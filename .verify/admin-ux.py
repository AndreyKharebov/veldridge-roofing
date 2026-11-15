import base64, json, os, re, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('BASE_URL', 'http://127.0.0.1:4173')
BROWSER = os.environ.get('QA_BROWSER', 'chromium')
OUT = Path(os.environ.get('QA_OUTPUT', 'ux-qa')); OUT.mkdir(parents=True, exist_ok=True)
PNG = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ2kAAAAASUVORK5CYII=')
REPORT = {'browser': BROWSER, 'checks': [], 'pageErrors': []}

def goto(p, path):
    p.goto(BASE + path, wait_until='domcontentloaded')
    expect(p.locator('h1')).to_be_visible()

def login(p, path='/admin/services/damage-repairs'):
    p.goto(BASE + path)
    p.get_by_label('Username', exact=True).fill('admin')
    p.get_by_label('Password', exact=True).fill('demo-admin')
    p.get_by_role('button', name='Sign in', exact=True).click()
    expect(p.locator('.admin-content')).to_be_visible()

def content(p):
    return p.evaluate('''() => new Promise((resolve,reject) => {
      const r=indexedDB.open('veldridge-workspace-v1',1);
      r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result;
      const tx=db.transaction('content','readonly');const q=tx.objectStore('content').get('workspace');
      tx.oncomplete=()=>{db.close();resolve(q.result)};tx.onabort=()=>{db.close();reject(tx.error)};};
    })''')

def set_services(p, rows):
    p.evaluate('''rows => new Promise((resolve,reject) => {
      const r=indexedDB.open('veldridge-workspace-v1',1);
      r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result;
      const tx=db.transaction('content','readwrite');const store=tx.objectStore('content');const q=store.get('workspace');
      q.onsuccess=()=>store.put({...q.result,services:rows},'workspace');
      tx.oncomplete=()=>{db.close();resolve()};tx.onabort=()=>{db.close();reject(tx.error)};};
    })''',rows)

def sequence(p, expected_count):
    goto(p,'/services')
    nav=p.locator('.service-finder__number').all_text_contents()
    expected=[str(i+1).zfill(2) for i in range(expected_count)]
    assert nav==expected, (nav, expected)
    rendered=p.locator('.service-detail,.service-care__card').evaluate_all('''nodes=>nodes.map(n=>({
      id:n.id,number:n.querySelector('.services-page__eyebrow').textContent.split('/')[0].trim()
    }))''')
    links=p.locator('.service-finder__link').evaluate_all('nodes=>nodes.map(n=>n.hash.slice(1))')
    assert [n['number'] for n in rendered]==expected, rendered
    assert [n['id'] for n in rendered]==links, (rendered,links)
    assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    return links

def numbering(p):
    login(p)
    original=content(p)['services'];orders={s['id']:s['order'] for s in original}
    sequence(p,len(original))
    goto(p,'/admin/services/damage-repairs')
    p.get_by_role('button',name='Archive service',exact=True).click()
    p.get_by_role('dialog').get_by_role('button',name='Archive service',exact=True).click()
    expect(p.get_by_role('dialog')).to_have_count(0)
    expect(p.get_by_label('Visibility',exact=True)).to_have_value('archived')
    links=sequence(p,len(original)-1);assert 'damage-repairs' not in links
    assert {s['id']:s['order'] for s in content(p)['services']}==orders
    p.reload();expect(p.locator('.service-finder__number').first).to_have_text('01')
    goto(p,'/admin/services/damage-repairs')
    p.get_by_label('Visibility',exact=True).select_option('active')
    p.get_by_role('button',name='Save changes',exact=True).click()
    expect(p.get_by_text('Saved locally. Your changes are stored in this browser.',exact=True)).to_be_visible()
    links=sequence(p,len(original));assert 'damage-repairs' in links
    p.locator('.service-finder__link').filter(has_text='Damage Repairs').click()
    expect(p.locator('#damage-repairs')).to_be_focused()
    assert {s['id']:s['order'] for s in content(p)['services']}==orders
    # Sparse and duplicate sort keys, interleaved groups, and several archives.
    rows=[dict(s,order=(i%3)*10,status='archived' if i in [0,2,5,8] else 'active') for i,s in enumerate(original)]
    set_services(p,rows);sequence(p,sum(s['status']=='active' for s in rows))
    assert [s['order'] for s in content(p)['services']]==[s['order'] for s in rows]
    rows=[dict(s,status='active' if s['group']=='supporting' else 'archived') for s in original]
    set_services(p,rows);sequence(p,sum(s['status']=='active' for s in rows))
    rows=[dict(s,status='active' if s['group']=='main' else 'archived') for s in original]
    set_services(p,rows);sequence(p,sum(s['status']=='active' for s in rows))
    set_services(p,[dict(s,status='archived') for s in original]);sequence(p,0)
    rows=original+[dict(original[0],id=f'qa-service-{i}',title=f'QA Service {i}',order=100+i) for i in range(3)]
    set_services(p,rows);sequence(p,len(rows))
    p.screenshot(path=str(OUT/f'{BROWSER}-services-sequence.png'))

ROUTES=[('services','/admin/services/roof-replacement','Replace image',False),
        ('news','/admin/news/getting-your-roof-ready-for-winter','Replace image',False),
        ('projects','/admin/projects/new','Upload photos',True)]

def bounds(d):
    return d.evaluate('''d=>{
      const rect=n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
      const body=d.querySelector('.admin-media-body');
      return {dialog:rect(d),heading:rect(d.querySelector('.admin-dialog__heading')),
        footer:rect(d.querySelector('.admin-media-footer')),body:rect(body),
        buttons:[...d.querySelectorAll('.admin-media-footer button')].map(rect),
        height:innerHeight,width:innerWidth,scroll:body.scrollTop,dialogScroll:d.scrollTop,
        horizontal:body.scrollWidth>body.clientWidth+1,scrollable:body.scrollHeight>body.clientHeight+1};
    }''')

def geometry(d):
    r=bounds(d)
    assert r['heading']['y']>=0 and r['footer']['bottom']<=r['height']+1,r
    assert r['body']['height']>0 and r['body']['y']>=r['heading']['bottom']-1,r
    assert r['body']['bottom']<=r['footer']['y']+1,r
    assert not r['horizontal'] and r['dialogScroll']==0,r
    for b in r['buttons']:
        assert b['y']>=0 and b['bottom']<=r['height'] and b['x']>=0 and b['right']<=r['width'],r
    return r

def media_layout(p, route, viewport):
    name,path,label,multiple=route
    login(p,path);opener=p.get_by_role('button',name=label,exact=True);opener.click()
    d=p.locator('.admin-dialog--media');expect(d).to_be_visible()
    action=d.get_by_role('button',name='Use images' if multiple else 'Use image',exact=True)
    expect(action).to_be_disabled()
    initial=geometry(d);assert initial['scrollable'],initial
    choices=d.locator('.admin-media-choice');assert choices.count()>3
    choices.first.click();choices.last.click()
    expect(d.locator('.admin-media-footer [role=status]')).to_have_text('2 selected' if multiple else '1 selected')
    expect(action).to_be_enabled()
    scrolled=geometry(d);assert scrolled['scroll']>0,scrolled
    assert abs(initial['footer']['y']-scrolled['footer']['y'])<1,(initial,scrolled)
    assert abs(initial['heading']['y']-scrolled['heading']['y'])<1
    assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    # Keyboard navigation must reach confirmation without moving the footer.
    choices.last.focus();p.keyboard.press('Tab')
    expect(d.get_by_role('button',name='Cancel',exact=True)).to_be_focused()
    p.keyboard.press('Tab');expect(action).to_be_focused();geometry(d)
    if name=='news' and viewport['width'] in [390,1440]:
        p.screenshot(path=str(OUT/f'{BROWSER}-media-{viewport["width"]}.png'))
    p.keyboard.press('Enter');expect(d).to_have_count(0)
    if multiple:expect(p.locator('.admin-photo-card')).to_have_count(2)
    # Escape and Cancel keep the existing selection and restore opener focus.
    opener.click();expect(d).to_be_visible();geometry(d)
    p.keyboard.press('Escape');expect(d).to_have_count(0);expect(opener).to_be_focused()
    opener.click();d.get_by_role('button',name='Cancel',exact=True).click();expect(d).to_have_count(0)

def uploads(p,route):
    name,path,label,multiple=route
    login(p,path);p.get_by_role('button',name=label,exact=True).click()
    d=p.locator('.admin-dialog--media');expect(d).to_be_visible()
    action=d.get_by_role('button',name='Use images' if multiple else 'Use image',exact=True)
    field=d.get_by_label('Upload public images',exact=True)
    field.set_input_files({'name':'broken.png','mimeType':'image/png','buffer':b'not an image'})
    expect(d.get_by_role('alert')).to_be_visible();expect(action).to_be_disabled();geometry(d)
    files=[{'name':f'qa-roof-{i}.png','mimeType':'image/png','buffer':PNG} for i in range(2 if multiple else 1)]
    field.set_input_files(files)
    expect(action).to_be_enabled(timeout=20000);geometry(d)
    expect(d.locator('.admin-media-footer [role=status]')).to_have_text('2 selected' if multiple else '1 selected')
    # Confirmation is already on screen; no scroll-to-bottom is necessary.
    action.click();expect(d).to_have_count(0)
    if multiple:expect(p.locator('.admin-photo-card')).to_have_count(2)
    else:
        p.get_by_role('button',name='Save changes',exact=True).click()
        expect(p.get_by_text('Saved locally. Your changes are stored in this browser.',exact=True)).to_be_visible()
        p.reload();expect(p.locator('.admin-content')).to_be_visible()
        assert p.locator('.admin-content img').evaluate_all('(imgs)=>imgs.some(i=>i.src.startsWith("blob:"))')

with sync_playwright() as pw:
    browser=getattr(pw,BROWSER).launch()
    def run(name,fn,viewport=None):
        ctx=browser.new_context(viewport=viewport or {'width':1440,'height':900},reduced_motion='reduce')
        p=ctx.new_page();p.set_default_timeout(15000);errors=[]
        p.on('pageerror',lambda error:errors.append(str(error)))
        try:
            fn(p);assert not errors,errors
            REPORT['checks'].append({'name':name,'pass':True});print('PASS',name,flush=True)
        except Exception as e:
            REPORT['checks'].append({'name':name,'pass':False,'error':str(e),'trace':traceback.format_exc()})
            try:p.screenshot(path=str(OUT/('FAIL-'+re.sub('[^a-z0-9]+','-',name.lower())+'.png')))
            except Exception:pass
            print('FAIL',name,str(e),flush=True)
        finally:
            REPORT['pageErrors']+=errors;ctx.close()
            (OUT/'report.json').write_text(json.dumps(REPORT,indent=2))
    run('Service numbering: archive, restore, sparse orders, groups, empty and 10+ items',numbering)
    for width,height in [(1440,900),(834,1112),(390,844),(320,568),(844,390)]:
        viewport={'width':width,'height':height}
        for route in ROUTES:
            run(f'Media footer and keyboard: {route[0]} {width}x{height}',lambda p,r=route,v=viewport:media_layout(p,r,v),viewport)
    for route in ROUTES:
        run('Image upload, validation and confirmation: '+route[0],lambda p,r=route:uploads(p,r),{'width':390,'height':844})
    browser.close()
REPORT['passed']=sum(c['pass'] for c in REPORT['checks'])
REPORT['failed']=sum(not c['pass'] for c in REPORT['checks'])
(OUT/'report.json').write_text(json.dumps(REPORT,indent=2))
print(json.dumps({'passed':REPORT['passed'],'failed':REPORT['failed']}),flush=True)
raise SystemExit(1 if REPORT['failed'] else 0)
