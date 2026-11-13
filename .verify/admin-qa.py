import os, json, traceback, re, base64, time
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE=os.environ.get('BASE_URL','http://127.0.0.1:5173')
OUT=Path(os.environ.get('QA_OUTPUT','admin-qa'));OUT.mkdir(parents=True,exist_ok=True)
PNG=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJ2kAAAAASUVORK5CYII=')
(OUT/'qa-front.png').write_bytes(PNG);(OUT/'qa-detail.png').write_bytes(PNG)
(OUT/'broken.png').write_bytes(b'not an image')
report={'checks':[],'pageErrors':[],'screenshots':[]}

def goto(page,path):
 page.goto(BASE+path,wait_until='networkidle');page.wait_for_timeout(150)
def login(page):
 goto(page,'/admin')
 if '/login' in page.url:
  page.get_by_label('Username',exact=True).fill('admin');page.get_by_label('Password',exact=True).fill('demo-admin')
  page.get_by_role('button',name='Sign in',exact=True).click()
 expect(page.locator('.admin-content')).to_be_visible(timeout=15000)
def saved(page):
 expect(page.get_by_text('Saved locally. Your changes are stored in this browser.',exact=True)).to_be_visible(timeout=10000)
def snap(page,name):
 page.screenshot(path=str(OUT/f'{name}.png'),full_page=True);report['screenshots'].append(f'{name}.png')
def choose_image(page):
 page.get_by_role('button',name=re.compile('^(Choose image|Replace image)$')).click()
 modal=page.locator('.admin-dialog--media');expect(modal).to_be_visible()
 modal.locator('.admin-media-choice').first.click();modal.get_by_role('button',name='Use image',exact=True).click()
 expect(modal).to_have_count(0)
def api(page,code):
 return page.evaluate("async () => {const {workspaceApi} = await import('/src/api/workspace.js');"+code+"}")
def read_bucket(page,name):
 return page.evaluate("async (store) => {const {readStore}=await import('/src/api/database.js');return readStore(store,store==='content'?'workspace':undefined)}",name)

with sync_playwright() as pw:
 for browser_name in os.environ.get('QA_BROWSERS','chromium,webkit').split(','):
  browser=getattr(pw,browser_name).launch(headless=True)
  def run(name,fn,viewport=None):
   ctx=browser.new_context(viewport=viewport or {'width':1440,'height':1000},reduced_motion='reduce',accept_downloads=True)
   page=ctx.new_page();page.set_default_timeout(10000)
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   start=time.time()
   try:
    fn(page,ctx)
    if errors: raise AssertionError('Page errors: '+repr(errors))
    report['checks'].append({'browser':browser_name,'name':name,'pass':True,'seconds':round(time.time()-start,2)})
    print('PASS',browser_name,name,flush=True)
   except Exception as e:
    report['checks'].append({'browser':browser_name,'name':name,'pass':False,'error':str(e),'trace':traceback.format_exc()})
    try: snap(page,browser_name+'-failure-'+re.sub('[^a-z0-9]+','-',name.lower()))
    except: pass
    print('FAIL',browser_name,name,str(e),flush=True)
   finally:
    report['pageErrors']+=errors;ctx.close()
    (OUT/'report.json').write_text(json.dumps(report,indent=2))

  def authentication(page,ctx):
   goto(page,'/admin/projects');expect(page).to_have_url(re.compile('/admin/login'))
   assert not page.locator('.header,.footer').count()
   page.get_by_label('Username',exact=True).fill('admin');page.get_by_label('Password',exact=True).fill('wrong')
   page.get_by_role('button',name='Sign in',exact=True).click();expect(page.get_by_role('alert')).to_contain_text('Incorrect')
   page.get_by_label('Password',exact=True).fill('demo-admin');page.get_by_role('button',name='Sign in',exact=True).click()
   expect(page).to_have_url(re.compile('/admin/projects$'))
   page.get_by_role('button',name='Sign out',exact=True).click();page.get_by_role('dialog').get_by_role('button',name='Sign out',exact=True).click()
   expect(page).to_have_url(re.compile('/admin/login'))
   goto(page,'/admin/settings');expect(page).to_have_url(re.compile('/admin/login'))
  run('Login validation, protected routes, return destination and logout',authentication)

  def routes(page,ctx):
   login(page)
   data=read_bucket(page,'content');article=data['articles'][0]['id'];project=data['projects'][0]['id']
   paths=['/admin','/admin/services','/admin/services/roof-replacement','/admin/services/new','/admin/news','/admin/news/'+article,'/admin/news/new','/admin/news/categories','/admin/news/categories/new','/admin/projects','/admin/projects/'+project,'/admin/projects/new','/admin/inquiries','/admin/inquiries/INQ-0012','/admin/settings']
   for width in [390,834,1440]:
    page.set_viewport_size({'width':width,'height':1000})
    for path in paths:
     goto(page,path);expect(page.locator('h1')).to_be_visible()
     assert not page.get_by_text('This page could not be opened.').count(),path
     assert not page.locator('.header,.footer').count(),path
     assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),(path,width,'horizontal overflow')
     assert not page.get_by_role('link',name='Hero',exact=True).count()
     if width==1440 and path in ['/admin','/admin/services/roof-replacement','/admin/news/'+article,'/admin/projects/'+project,'/admin/inquiries/INQ-0012','/admin/settings']:
      snap(page,browser_name+'-'+path.strip('/').replace('/','-'))
     if width==390 and path in ['/admin/inquiries','/admin/settings','/admin/projects/'+project]:
      snap(page,browser_name+'-mobile-'+path.strip('/').replace('/','-'))
   page.set_viewport_size({'width':320,'height':800});goto(page,'/admin/services/roof-replacement')
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
   page.get_by_role('button',name='Open admin navigation').click();expect(page.get_by_role('dialog')).to_be_visible();page.keyboard.press('Escape');expect(page.get_by_role('dialog')).to_have_count(0)
  run('15 admin routes at 390/834/1440, 320px editor, navigation, no Hero controls',routes)

  def public(page,ctx):
   for width in [390,834,1440]:
    page.set_viewport_size({'width':width,'height':1000})
    for path in ['/','/about','/services','/gallery','/blog','/contact']:
     goto(page,path);expect(page.locator('h1')).to_be_visible()
     assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),(path,width)
     assert page.locator('.header').count()==1 and page.locator('.footer').count()==1
     assert not page.locator('.admin-shell').count()
     assert page.locator('img').evaluate_all('(imgs)=>imgs.filter(img=>img.complete&&img.naturalWidth===0&&img.getAttribute("src")).length')==0,(path,'broken images')
   goto(page,'/services');assert page.locator('.service-detail').count()==6
   goto(page,'/gallery');assert page.locator('.project-card').count()==12
   page.get_by_role('button',name='Load More',exact=True).click();assert page.locator('.project-card').count()==18
   goto(page,'/blog');assert page.locator('.article-row').count()==10
  run('All six public routes, responsive layout, image loading and seed counts',public)

  def services(page,ctx):
   login(page);goto(page,'/admin/services/roof-replacement')
   page.get_by_label('Service name *',exact=True).fill('Roof Replacement QA')
   page.get_by_label('Short description *',exact=True).fill('QA service description')
   page.get_by_label('Residential',exact=True).uncheck();page.get_by_label('Commercial',exact=True).uncheck()
   page.get_by_role('button',name='Save changes',exact=True).click();expect(page.get_by_text('Select Residential, Commercial, or both.',exact=True)).to_be_visible()
   page.get_by_label('Commercial',exact=True).check();page.get_by_role('button',name='Save changes',exact=True).click();saved(page)
   page.reload(wait_until='networkidle');expect(page.get_by_label('Service name *',exact=True)).to_have_value('Roof Replacement QA');expect(page.get_by_label('Commercial',exact=True)).to_be_checked();expect(page.get_by_label('Residential',exact=True)).not_to_be_checked()
   goto(page,'/services');expect(page.locator('#roof-replacement')).to_contain_text('Roof Replacement QA')
   goto(page,'/contact');expect(page.locator('select[name=service] option[value=roof-replacement]')).to_have_text('Roof Replacement QA')
   goto(page,'/');expect(page.locator('.service-card').filter(has_text='Roof Replacement QA')).to_contain_text('QA service description')
   goto(page,'/admin/services/new');page.get_by_label('Service name *',exact=True).fill('Roof coating QA');page.get_by_label('Short description *',exact=True).fill('Coating sample service')
   page.get_by_label('Residential',exact=True).check();choose_image(page);page.get_by_label('Image description *',exact=True).fill('Sample roof coating');page.get_by_label('Show on Home',exact=True).check()
   page.get_by_role('button',name='Save changes',exact=True).click();saved(page)
   expect(page.get_by_role('heading',name='Edit service',exact=True)).to_be_visible()
   page.get_by_role('button',name='Archive service',exact=True).click();page.get_by_role('dialog').get_by_role('button',name='Archive service',exact=True).click();saved(page)
   goto(page,'/services');assert not page.get_by_role('heading',name='Roof coating QA',exact=True).count()
   goto(page,'/contact');assert not page.locator('option').filter(has_text='Roof coating QA').count()
  run('Service CRUD, property checkboxes, persistence, shared Home/Services/Contact and archive',services)

  def news(page,ctx):
   login(page);goto(page,'/admin/news/categories/new');page.get_by_label('Category name *',exact=True).fill('QA Tips');page.get_by_role('button',name='Save category').click();saved(page)
   goto(page,'/admin/news/new');page.get_by_label('Title *',exact=True).fill('QA roofing journal')
   page.get_by_label('Category',exact=True).select_option(label='QA Tips');page.get_by_role('button',name='Save draft',exact=True).click();saved(page)
   goto(page,'/blog');assert not page.get_by_role('button',name=re.compile('QA roofing journal')).count()
   goto(page,'/admin/news');page.locator('tr').filter(has_text='QA roofing journal').get_by_role('link',name='Edit article →').click()
   page.get_by_role('button',name='Publish article',exact=True).click();expect(page.get_by_role('alert')).to_be_visible()
   page.get_by_label('Introduction / card excerpt *',exact=True).fill('A useful locally edited article.')
   choose_image(page);page.get_by_label('Image description *',exact=True).fill('Roof for the QA article')
   page.get_by_label('Publication date',exact=True).fill('2026-11-13')
   page.get_by_label('Section heading *',exact=True).fill('First QA heading');page.get_by_label('Paragraph *',exact=True).fill('A first paragraph.\nA second line. <script>unsafe()</script>')
   page.get_by_role('button',name='+ Add section',exact=True).click();page.get_by_label('Section heading *',exact=True).nth(1).fill('Second QA heading');page.get_by_label('Paragraph *',exact=True).nth(1).fill('Second QA paragraph.')
   page.get_by_role('button',name='Move section 2 up').click();page.get_by_role('button',name='Preview article',exact=True).click()
   expect(page.locator('.article-dialog__section h3').first).to_have_text('Second QA heading')
   assert not page.locator('.article-dialog__source').count();page.get_by_role('button',name='Close article').click()
   page.get_by_role('button',name='Publish article',exact=True).click();saved(page)
   goto(page,'/blog');expect(page.locator('.article-row').first).to_contain_text('QA roofing journal')
   goto(page,'/');page.locator('.latest-news__card').filter(has_text='QA roofing journal').get_by_role('link',name=re.compile('Read more:')).click();expect(page.locator('.article-dialog')).to_be_visible();expect(page.locator('.article-dialog__title')).to_have_text('QA roofing journal');page.get_by_role('button',name='Close article').click()
   goto(page,'/admin/news/categories');page.locator('tr').filter(has_text='QA Tips').get_by_role('link',name='Edit →').click();page.get_by_role('button',name='Delete category').click();expect(page.get_by_role('dialog')).to_contain_text('This category is in use.');page.get_by_role('dialog').get_by_role('button',name='Keep category').click()
   goto(page,'/admin/news');page.locator('tr').filter(has_text='QA roofing journal').get_by_role('link',name='Edit article →').click();page.get_by_role('button',name='Archive article').click();page.get_by_role('dialog').get_by_role('button',name='Archive article').click();saved(page)
   goto(page,'/blog');assert not page.locator('.article-row').filter(has_text='QA roofing journal').count()
  run('News categories, draft/publish/archive, section editor, reader preview and Home integration',news)

  def projects(page,ctx):
   login(page);goto(page,'/admin/projects/new')
   page.get_by_role('button',name='Upload photos',exact=True).click();modal=page.locator('.admin-dialog--media')
   modal.get_by_label('Upload public images').set_input_files([str(OUT/'qa-front.png'),str(OUT/'qa-detail.png')])
   expect(modal.get_by_role('button',name='Use images',exact=True)).to_be_enabled(timeout=15000);modal.get_by_role('button',name='Use images',exact=True).click()
   assert page.locator('.admin-photo-card').count()==2
   page.get_by_label('Image description *',exact=True).fill('QA roof front');page.get_by_label('Photo caption',exact=True).fill('Front view')
   page.get_by_role('button',name='Edit photo 2',exact=True).click();page.get_by_label('Image description *',exact=True).fill('QA roof detail');page.get_by_label('Photo caption',exact=True).fill('Detail view')
   page.locator('.admin-photo-card').nth(1).get_by_role('button',name='Set as cover',exact=True).click();page.get_by_role('button',name='Move photo 2 left').click()
   page.get_by_label('Project title *',exact=True).fill('QA roof project');page.get_by_label('Service category *',exact=True).select_option('roof-replacement');page.get_by_label('Property type *',exact=True).select_option('Residential')
   page.get_by_label('Short project summary *',exact=True).fill('New roof and carefully finished details.')
   page.get_by_label('On-site duration',exact=True).fill('3 working days');page.get_by_label('Main material',exact=True).fill('Steel');page.get_by_label('Finish / color',exact=True).fill('Charcoal')
   page.get_by_label('Status',exact=True).select_option('published');page.get_by_label('Display order',exact=True).fill('1')
   page.get_by_role('button',name='Save changes',exact=True).click();saved(page)
   goto(page,'/admin/projects');page.locator('.admin-project-card').filter(has_text='QA roof project').get_by_role('link',name='Edit project').click();page.reload(wait_until='networkidle')
   assert page.locator('.admin-photo-card').count()==2
   expect(page.locator('.admin-photo-card.is-cover')).to_contain_text('qa-detail.png')
   page.get_by_role('button',name='Preview project',exact=True).click();expect(page.locator('.project-dialog__title')).to_have_text('QA roof project');page.get_by_role('button',name='Next photo').click();page.get_by_role('button',name='Close project').click()
   snap(page,browser_name+'-uploaded-project')
   goto(page,'/gallery');page.get_by_role('button',name='View project: QA roof project',exact=True).click();expect(page.locator('.project-dialog__facts')).to_contain_text('Steel');page.get_by_role('button',name='Next photo').click();page.keyboard.press('Escape')
   expect(page.locator('.project-dialog')).to_have_count(0)
   assert page.evaluate('document.body.style.position')==''
   goto(page,'/admin/projects');page.locator('.admin-project-card').filter(has_text='QA roof project').get_by_role('link',name='Edit project').click();page.get_by_role('button',name='Choose from library',exact=True).click()
   page.locator('.admin-dialog--media').get_by_label('Upload public images').set_input_files([str(OUT/'qa-front.png'),str(OUT/'broken.png')]);expect(page.get_by_role('dialog').get_by_role('alert')).to_contain_text('content does not match')
   page.keyboard.press('Escape')
  run('Project multi-image upload, validation, captions, cover, order, persistence and viewer',projects)

  def inquiry(page,ctx):
   goto(page,'/contact');page.get_by_role('button',name='Send Message',exact=True).click();expect(page.get_by_role('alert')).to_contain_text('highlighted')
   page.get_by_label('Name *',exact=True).fill('QA Customer');page.get_by_label('Email',exact=True).fill('qa@example.com');page.get_by_label('Service (optional)',exact=True).select_option('roof-replacement');page.get_by_label('Message (optional)',exact=True).fill('Please arrange a sample inspection.')
   page.get_by_label('Choose roof photos',exact=True).set_input_files(str(OUT/'qa-front.png'))
   page.get_by_role('button',name='Send Message',exact=True).click();expect(page.get_by_role('heading',name='Demo complete.')).to_be_visible();expect(page.locator('.inquiry-form__result')).to_contain_text('saved in this browser')
   login(page);goto(page,'/admin/inquiries');page.get_by_label('Search inquiries',exact=True).fill('QA Customer');page.get_by_role('link',name='Open inquiry →',exact=True).click()
   expect(page.get_by_role('heading',name='QA Customer',exact=True)).to_be_visible();expect(page.get_by_role('heading',name='Attachments · 1 photos',exact=True)).to_be_visible()
   page.locator('.admin-attachment').click();expect(page.locator('.admin-dialog--photo img')).to_be_visible();page.keyboard.press('Escape')
   page.get_by_label('Status',exact=True).select_option('in-progress');page.get_by_label('Add a note',exact=True).fill('Called for a sample follow-up.');page.get_by_role('button',name='Save note',exact=True).click();expect(page.get_by_text('Inquiry updated locally. No message was sent.',exact=True)).to_be_visible()
   page.reload(wait_until='networkidle');expect(page.get_by_label('Status',exact=True)).to_have_value('in-progress');expect(page.locator('.admin-notes')).to_contain_text('sample follow-up')
   photos=page.locator('.admin-attachment img');assert photos.count()==1 and photos.first.evaluate('(img)=>img.complete&&img.naturalWidth>0')
   assert len(read_bucket(page,'inquiries'))==9
   goto(page,'/admin/projects/new');page.get_by_role('button',name='Choose from library',exact=True).click();assert not page.locator('.admin-media-choice').filter(has_text='qa-front.png').count()
  run('Contact validation, optional photo, inbox, status, notes and private attachments',inquiry)

  def settings_backup(page,ctx):
   login(page);goto(page,'/admin/settings');page.get_by_label('Phone *',exact=True).fill('(215) 555-0123');page.get_by_label('Email *',exact=True).fill('qa-office@example.com');page.get_by_label('Street address *',exact=True).fill('456 Demo Street');page.get_by_role('button',name='Save changes',exact=True).click();saved(page)
   goto(page,'/contact');expect(page.locator('.contact-details')).to_contain_text('qa-office@example.com');expect(page.locator('.footer')).to_contain_text('456 Demo Street')
   goto(page,'/admin/settings')
   # An adapter-level fixture ensures uploaded bytes round-trip through backups.
   api(page,"const bytes=Uint8Array.from(atob('"+base64.b64encode(PNG).decode()+"'),c=>c.charCodeAt(0));return workspaceApi.uploadMedia([new File([bytes],'backup-photo.png',{type:'image/png'})]);")
   with page.expect_download() as event:page.get_by_role('button',name='Export content backup',exact=True).click()
   backup_file=OUT/(browser_name+'-backup.json');event.value.save_as(str(backup_file));data=json.loads(backup_file.read_text())
   assert 'inquiries' not in data and 'inquiries' not in data['content'];assert any(m.get('dataUrl') for m in data['media'])
   page.get_by_label('Phone *',exact=True).fill('(215) 555-0188');page.get_by_role('button',name='Save changes',exact=True).click();saved(page)
   page.get_by_label('Import content backup',exact=True).set_input_files(str(backup_file));expect(page.get_by_role('dialog')).to_contain_text('Replace local content?');page.get_by_role('dialog').get_by_role('button',name='Import content',exact=True).click()
   expect(page.get_by_role('dialog')).to_have_count(0);expect(page.get_by_label('Phone *',exact=True)).to_have_value('(215) 555-0123')
   assert len(read_bucket(page,'inquiries'))==8
   (OUT/'invalid.json').write_text('{"format":"wrong"}');page.get_by_label('Import content backup',exact=True).set_input_files(str(OUT/'invalid.json'));expect(page.get_by_role('alert')).to_contain_text('Unsupported backup')
   page.get_by_role('button',name='Reset demo data',exact=True).click();page.get_by_role('dialog').get_by_role('button',name='Cancel',exact=True).click();expect(page.get_by_label('Phone *',exact=True)).to_have_value('(215) 555-0123')
   page.get_by_role('button',name='Reset demo data',exact=True).click();page.get_by_role('dialog').get_by_role('button',name='Reset demo data',exact=True).click();expect(page.get_by_role('dialog')).to_have_count(0);expect(page.get_by_label('Phone *',exact=True)).to_have_value('(215) 555-0148')
  run('Shared contact settings, image backup, import validation, inbox preservation and confirmed reset',settings_backup)

  def guards(page,ctx):
   login(page);goto(page,'/admin/services/roof-replacement');page.get_by_label('Service name *',exact=True).fill('Unsaved test')
   page.get_by_role('navigation',name='Admin navigation').get_by_role('link',name='News',exact=True).click();expect(page.get_by_role('dialog')).to_contain_text('Discard unsaved changes?');page.get_by_role('dialog').get_by_role('button',name='Cancel',exact=True).click();expect(page.get_by_label('Service name *',exact=True)).to_have_value('Unsaved test')
   page.get_by_role('navigation',name='Admin navigation').get_by_role('link',name='News',exact=True).click();page.get_by_role('dialog').get_by_role('button',name='Discard changes',exact=True).click();expect(page).to_have_url(re.compile('/admin/news$'))
   page.locator('tr').filter(has_text='Getting Your Roof Ready for Winter').get_by_role('link',name='Edit article →').click();page.get_by_label('Title *',exact=True).fill('Unsaved article preview');page.get_by_role('button',name='Preview article',exact=True).click();page.locator('.article-dialog__cta').click();expect(page.locator('.admin-dialog')).to_contain_text('Discard unsaved changes?');page.locator('.admin-dialog').get_by_role('button',name='Discard changes',exact=True).click();expect(page).to_have_url(re.compile('/contact$'))
   expect(page.locator('dialog[open]')).to_have_count(0);assert page.evaluate('document.body.style.position')=='';assert page.evaluate('document.body.style.overflow')==''
   goto(page,'/admin/settings');page.get_by_text('Demo testing',exact=True).click();page.get_by_role('button',name='Simulate next save error').click();goto(page,'/admin/services/roof-replacement');page.get_by_label('Short description *',exact=True).fill('Retained after failure')
   page.get_by_role('button',name='Save changes',exact=True).click();expect(page.get_by_role('alert')).to_contain_text('Simulated save failure');expect(page.get_by_label('Short description *',exact=True)).to_have_value('Retained after failure');page.get_by_role('button',name='Save changes',exact=True).click();saved(page)
  run('Unsaved-change routing, nested preview dismissal, scroll unlock and recoverable save error',guards)

  def concurrent(page,ctx):
   login(page);goto(page,'/admin/services/roof-replacement')
   other=ctx.new_page();login(other);goto(other,'/admin/services/roof-replacement')
   page.get_by_label('Short description *',exact=True).fill('First tab wins');page.get_by_role('button',name='Save changes',exact=True).click();saved(page)
   other.get_by_label('Short description *',exact=True).fill('Unsaved second tab');other.get_by_role('button',name='Save changes',exact=True).click();expect(other.get_by_role('alert')).to_contain_text('changed in another tab');expect(other.get_by_label('Short description *',exact=True)).to_have_value('Unsaved second tab')
   public_tab=ctx.new_page();goto(public_tab,'/');expect(public_tab.locator('.service-card').filter(has_text='Roof Replacement')).to_contain_text('First tab wins')
  run('Cross-tab cache refresh and optimistic revision conflict protection',concurrent)

  def source_context(page,ctx):
   goto(page,'/gallery');page.locator('.project-card__button').first.click();title=page.locator('.project-dialog__title').inner_text().replace('\n',' ');page.locator('.project-dialog__cta').click()
   expect(page.get_by_label('Message (optional)',exact=True)).to_contain_text('') if False else None
   assert 'interested in a project' in page.get_by_label('Message (optional)',exact=True).input_value()
   page.get_by_label('Name *',exact=True).fill('QA Source');page.get_by_label('Phone',exact=True).fill('2155550104');page.get_by_role('button',name='Send Message',exact=True).click();expect(page.get_by_role('heading',name='Demo complete.')).to_be_visible()
   login(page);goto(page,'/admin/inquiries');page.get_by_label('Search inquiries',exact=True).fill('QA Source');page.get_by_role('link',name='Open inquiry →',exact=True).click();expect(page.locator('.admin-content')).to_contain_text(title);expect(page.get_by_role('link',name='View source project →',exact=True)).to_be_visible()
  run('Gallery to Contact source context and inquiry snapshot',source_context)

  def motion(page,ctx):
   page.emulate_media(reduced_motion='no-preference');page.set_viewport_size({'width':834,'height':1000})
   goto(page,'/about');value=page.locator('.about-page').evaluate('(el)=>getComputedStyle(el).getPropertyValue("--motion-reveal-duration").trim()');assert value=='1s',value
   page.wait_for_timeout(1300);expect(page.locator('.page-hero__content')).to_have_css('opacity','1')
   goto(page,'/services');page.wait_for_timeout(1300);page.locator('.service-finder__link').filter(has_text='Solar Panels').click();expect(page.locator('#solar-panels')).to_be_in_viewport()
   assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
   page.emulate_media(reduced_motion='reduce');goto(page,'/gallery');assert page.locator('[data-motion-state=pending]').count()==0
  run('Preserved user 1s timing, motion completion, service anchors and Reduced Motion',motion)
  browser.close()
report['passed']=sum(r['pass'] for r in report['checks']);report['failed']=len(report['checks'])-report['passed']
(OUT/'report.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'passed':report['passed'],'failed':report['failed']}),flush=True)
raise SystemExit(1 if report['failed'] else 0)
