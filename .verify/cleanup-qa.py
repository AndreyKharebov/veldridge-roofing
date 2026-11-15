import os,json,base64,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
BASE=os.getenv('BASE_URL','http://127.0.0.1:4173'); OUT=Path(os.getenv('QA_OUTPUT','cleanup-qa'));OUT.mkdir(parents=True,exist_ok=True)
PNG=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ2kAAAAASUVORK5CYII=')
for name in ['roof.png','detail.png','private.png']:(OUT/name).write_bytes(PNG)
report={'checks':[],'pageErrors':[]}
def go(p,path):
 p.goto(BASE+path,wait_until='networkidle');expect(p.locator('h1')).to_be_visible(timeout=15000)
def login(p):
 go(p,'/admin');expect(p.get_by_label('Username',exact=True)).to_be_visible(timeout=15000)
 p.get_by_label('Username',exact=True).fill('admin');p.get_by_label('Password',exact=True).fill('demo-admin');p.get_by_role('button',name='Sign in',exact=True).click();expect(p.locator('.admin-content')).to_be_visible()
def bucket(p,name):
 return p.evaluate('''(store)=>new Promise((resolve,reject)=>{const o=indexedDB.open('veldridge-workspace-v1',1);o.onerror=()=>reject(o.error);o.onsuccess=()=>{const db=o.result;const tx=db.transaction(store,'readonly');const req=store==='content'?tx.objectStore(store).get('workspace'):tx.objectStore(store).getAll();tx.oncomplete=()=>{db.close();resolve(req.result)};tx.onabort=()=>reject(tx.error)}})''',name)
def saved(p): expect(p.get_by_text('Saved locally. Your changes are stored in this browser.',exact=True)).to_be_visible(timeout=15000)
def upload(p,files,multiple=False):
 modal=p.locator('.admin-dialog--media');expect(modal).to_be_visible()
 modal.get_by_label('Upload public images').set_input_files([str(OUT/f) for f in files])
 b=modal.get_by_role('button',name='Use images' if multiple else 'Use image',exact=True)
 expect(b).to_be_enabled(timeout=15000);b.click();expect(modal).to_have_count(0)
def image_from_library(p):
 p.get_by_role('button',name='Choose image',exact=True).click();m=p.locator('.admin-dialog--media');m.locator('.admin-media-choice').first.click();m.get_by_role('button',name='Use image',exact=True).click()
def check(name,fn,p):
 try:
  fn();report['checks'].append({'browser':engine,'name':name,'pass':True});print('PASS',engine,name,flush=True)
 except Exception as e:
  report['checks'].append({'browser':engine,'name':name,'pass':False,'error':str(e),'trace':traceback.format_exc()});print('FAIL',engine,name,str(e),flush=True)
  p.screenshot(path=str(OUT/f'{engine}-failure.png'),full_page=True)
  (OUT/'report.json').write_text(json.dumps(report,indent=2));raise
 (OUT/'report.json').write_text(json.dumps(report,indent=2))
with sync_playwright() as pw:
 for engine in os.getenv('QA_BROWSERS','chromium').split(','):
  browser=getattr(pw,engine).launch(headless=True)
  ctx=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce',accept_downloads=True)
  p=ctx.new_page();p.set_default_timeout(15000);p.on('pageerror',lambda err:report['pageErrors'].append(str(err)))
  def empty_public():
   for w in [320,834,1440]:
    p.set_viewport_size({'width':w,'height':1000})
    for path in ['/','/about','/services','/gallery','/blog','/contact']:
     go(p,path);assert p.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),(w,path)
     assert p.locator('.service-card,.service-detail,.project-card,.article-row,.latest-news__card').count()==0,path
     assert p.locator('img').evaluate_all('(xs)=>xs.filter(x=>x.complete&&!x.naturalWidth&&x.getAttribute("src")).length')==0,path
     assert not p.get_by_text('123 Example Street',exact=False).count()
   go(p,'/services');expect(p.get_by_text('No services have been added yet.')).to_be_visible()
   go(p,'/contact');expect(p.locator('select[name=service] option')).to_have_count(1);assert not p.locator('.contact-map__pin').count()
   p.screenshot(path=str(OUT/f'{engine}-empty-contact.png'),full_page=True)
   data=bucket(p,'content');assert all(data[k]==[] for k in ['services','articles','projects','categories']);assert bucket(p,'media')==[];assert bucket(p,'inquiries')==[]
  check('Fresh empty public pages at 320, 834, 1440 and no fake contact/map',empty_public,p)
  def empty_admin():
   login(p)
   for w in [390,834,1440]:
    p.set_viewport_size({'width':w,'height':1000})
    for route in ['/admin','/admin/services','/admin/news','/admin/news/categories','/admin/projects','/admin/inquiries','/admin/settings','/admin/projects/new']:
     go(p,route);assert p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(w,route)
   expect(p.get_by_role('heading',name='Create a service first.')).to_be_visible()
   go(p,'/admin');p.screenshot(path=str(OUT/f'{engine}-empty-admin.png'),full_page=True)
   go(p,'/admin/services/new');p.get_by_role('button',name='Choose image',exact=True).click();m=p.locator('.admin-dialog--media');expect(m.get_by_text('No images yet. Upload your first image to continue.')).to_be_visible();assert m.locator('.admin-media-choice').count()==0
   expect(m.get_by_role('button',name='Use image',exact=True)).to_be_disabled();p.keyboard.press('Escape')
  check('Empty admin routes and service prerequisite; empty media picker',empty_admin,p)
  def empty_backup():
   go(p,'/admin/settings')
   with p.expect_download() as d:p.get_by_role('button',name='Export content backup',exact=True).click()
   path=OUT/f'{engine}-empty-backup.json';d.value.save_as(str(path));data=json.loads(path.read_text());assert data['media']==[];assert data['content']['services']==[];assert data['content']['settings']['phone']==''
   p.get_by_label('Import content backup',exact=True).set_input_files(str(path));dlg=p.get_by_role('dialog');expect(dlg).to_be_visible();dlg.get_by_role('button',name='Import content',exact=True).click();expect(dlg).to_have_count(0);expect(p.get_by_label('Phone *',exact=True)).to_have_value('')
   p.get_by_role('button',name='Save changes',exact=True).click();expect(p.get_by_role('alert')).to_be_visible()
  check('Empty backup export/import round-trip and strict settings save',empty_backup,p)
  def service_create():
   go(p,'/admin/services/new');p.get_by_label('Service name *',exact=True).fill('QA New Service');p.get_by_label('Short description *',exact=True).fill('Created from an empty workspace');p.get_by_label('Residential',exact=True).check();p.get_by_label('Commercial',exact=True).check();p.get_by_label('Show on Home',exact=True).check();p.get_by_label('Display order',exact=True).fill('3')
   p.get_by_role('button',name='Choose image',exact=True).click();upload(p,['roof.png']);p.get_by_label('Image description *',exact=True).fill('QA roof image');p.get_by_role('button',name='Save changes',exact=True).click();saved(p)
   p.reload(wait_until='networkidle');expect(p.get_by_label('Service name *',exact=True)).to_have_value('QA New Service')
   go(p,'/services');expect(p.locator('.service-detail')).to_have_count(1);expect(p.locator('.service-finder__number')).to_have_text('01')
   go(p,'/');expect(p.locator('.service-card')).to_have_count(1)
   go(p,'/contact');expect(p.locator('select[name=service] option')).to_have_count(2)
  check('First image and service creation, persistence and shared public integration',service_create,p)
  def news_create():
   go(p,'/admin/news/categories/new');p.get_by_label('Category name *',exact=True).fill('QA Category');p.get_by_role('button',name='Save category',exact=True).click();saved(p)
   go(p,'/admin/news/new');p.get_by_label('Title *',exact=True).fill('QA New Article');p.get_by_role('button',name='Save draft',exact=True).click();saved(p)
   go(p,'/blog');expect(p.locator('.article-row')).to_have_count(0)
   go(p,'/admin/news');p.get_by_role('link',name='Edit article →',exact=True).click();p.get_by_label('Introduction / card excerpt *',exact=True).fill('QA article summary');p.get_by_label('Category',exact=True).select_option(label='QA Category');p.get_by_label('Section heading *',exact=True).fill('QA Section');p.get_by_label('Paragraph *',exact=True).fill('QA article body');image_from_library(p);p.get_by_label('Image description *',exact=True).fill('QA article cover');p.get_by_role('button',name='Publish article',exact=True).click();saved(p)
   go(p,'/blog');expect(p.locator('.article-row')).to_have_count(1);go(p,'/');expect(p.locator('.latest-news__card')).to_have_count(1)
  check('News category, private draft and published article from empty state',news_create,p)
  def project_create():
   go(p,'/admin/projects/new');p.get_by_role('button',name='Upload photos',exact=True).click();upload(p,['roof.png','detail.png'],True)
   for i in [0,1]:
    p.get_by_role('button',name=f'Edit photo {i+1}',exact=True).click();p.get_by_label('Image description *',exact=True).fill(f'QA project photo {i+1}')
   p.locator('.admin-photo-card').nth(1).get_by_role('button',name='Set as cover',exact=True).click()
   p.get_by_label('Project title *',exact=True).fill('QA New Project');p.get_by_label('Service category *',exact=True).select_option(label='QA New Service');p.get_by_label('Property type *',exact=True).select_option('Residential');p.get_by_label('Short project summary *',exact=True).fill('QA project summary');p.get_by_label('Status',exact=True).select_option('published');p.get_by_role('button',name='Save changes',exact=True).click();saved(p)
   p.reload(wait_until='networkidle');expect(p.locator('.admin-photo-card.is-cover')).to_contain_text('detail.png');go(p,'/gallery');expect(p.locator('.project-card')).to_have_count(1)
  check('Multi-photo project and cover after creating first service',project_create,p)
  def inquiry():
   before=len(bucket(p,'media'));go(p,'/contact');p.get_by_label('Name *',exact=True).fill('QA Contact');p.get_by_label('Email',exact=True).fill('qa@example.com');p.locator('input[type=file]').set_input_files(str(OUT/'private.png'));p.get_by_role('button',name='Send Message',exact=True).click();expect(p.get_by_role('heading',name='Demo complete.')).to_be_visible()
   assert len(bucket(p,'media'))==before
   go(p,'/admin/inquiries');expect(p.get_by_text('QA Contact',exact=True)).to_be_visible();records=bucket(p,'inquiries');assert len(records)==1;assert records[0]['service']=='not-sure';assert len(records[0]['photos'])==1
   go(p,'/admin/inquiries/'+records[0]['id']);expect(p.locator('.admin-attachment img')).to_have_count(1)
  check('First Contact inquiry with private photo before backend connection',inquiry,p)
  def settings():
   go(p,'/admin/settings')
   for key,value in [('Phone *','(215) 555-0101'),('Email *','qa@example.com'),('Street address *','QA Street'),('City *','QA City'),('State *','PA'),('ZIP code *','19103')]:p.get_by_label(key,exact=True).fill(value)
   p.get_by_role('button',name='Save changes',exact=True).click();saved(p);go(p,'/contact');expect(p.locator('.contact-details')).to_contain_text('QA Street');expect(p.locator('.contact-map__pin')).to_have_count(1);expect(p.locator('.footer')).to_contain_text('QA Street')
  check('Configure required contacts and enable illustrative location only after address',settings,p)
  def clear():
   go(p,'/admin/settings');p.get_by_role('button',name='Clear workspace',exact=True).click();dlg=p.get_by_role('dialog');dlg.get_by_role('button',name='Cancel',exact=True).click();assert len(bucket(p,'content')['services'])==1
   p.get_by_role('button',name='Clear workspace',exact=True).click();dlg=p.get_by_role('dialog');dlg.get_by_role('button',name='Clear workspace',exact=True).click();expect(dlg).to_have_count(0);expect(p.get_by_label('Phone *',exact=True)).to_have_value('')
   p.reload(wait_until='networkidle');data=bucket(p,'content');assert all(data[k]==[] for k in ['services','categories','articles','projects']);assert bucket(p,'media')==[];assert bucket(p,'inquiries')==[]
   go(p,'/services');expect(p.locator('.service-detail')).to_have_count(0);go(p,'/gallery');expect(p.get_by_text('No projects have been published yet. Please check back soon.')).to_be_visible();go(p,'/contact');assert not p.locator('.contact-map__pin').count()
  check('Cancel is safe; explicit clear removes all local content and no samples return',clear,p)
  def legacy():
   go(p,'/admin/settings');p.get_by_label('Import content backup',exact=True).set_input_files(os.getenv('LEGACY_BACKUP','.verify/legacy-backup.json'))
   dlg=p.get_by_role('dialog');expect(dlg).to_be_visible();dlg.get_by_role('button',name='Import content',exact=True).click();expect(dlg).to_have_count(0)
   data=bucket(p,'content');assert len(data['services'])==1;assert len(data['projects'])==0;assert len(data['articles'])==0
   go(p,'/services');expect(p.locator('.service-detail')).to_have_count(1)
   assert p.locator('img').evaluate_all('(xs)=>xs.filter(x=>x.complete&&!x.naturalWidth&&x.getAttribute("src")).length')==0
   go(p,'/admin/services');expect(p.locator('tbody tr')).to_have_count(1)
   p.reload(wait_until='networkidle');expect(p.locator('tbody tr')).to_have_count(1)
   assert len(bucket(p,'content')['services'])==1
  check('Existing version-1 backup and bundled assets restore and survive reload without reseeding',legacy,p)
  assert not report['pageErrors'],report['pageErrors']
  ctx.close();browser.close()
(OUT/'report.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'passed':len(report['checks']),'failed':0}))
