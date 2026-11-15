"""404 regression suite. Run against `npm run preview -- --port 4173`.
Uses isolated Playwright browser contexts; never touches the user's browser data.
Install separately: python -m pip install playwright && python -m playwright install chromium webkit
"""
import json
import os
import re
import time
import traceback
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('BASE_URL', 'http://127.0.0.1:4173')
OUT = Path(os.environ.get('QA_OUTPUT', 'not-found-qa'))
OUT.mkdir(parents=True, exist_ok=True)
report = {'checks': [], 'pageErrors': [], 'screenshots': []}


def go(page, path):
    page.goto(BASE + path, wait_until='domcontentloaded')


def is_404(page, context='site', title='Page not found.'):
    expect(page.locator('.not-found')).to_be_visible()
    expect(page.locator('.not-found h1')).to_have_text('Error 404. ' + title)
    brand = 'Veldridge Admin' if context == 'admin' else 'Veldridge Roofing'
    expect(page).to_have_title('404 — ' + title.rstrip('.') + ' | ' + brand)
    expect(page.locator('meta[data-not-found]')).to_have_count(1)
    expect(page.locator('meta[data-not-found]')).to_have_attribute('content', 'noindex, follow')
    expect(page.locator('h1')).to_have_count(1)
    expect(page.locator('main')).to_have_count(1)
    expect(page.locator('.not-found h1')).to_be_focused()
    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
    assert page.locator('.header').count() == (0 if context == 'admin' else 1)
    assert page.locator('.footer').count() == (0 if context == 'admin' else 1)


def login(page, path='/admin'):
    go(page, path)
    expect(page.get_by_role('button', name='Sign in', exact=True)).to_be_visible()
    page.get_by_label('Username', exact=True).fill('admin')
    page.get_by_label('Password', exact=True).fill('demo-admin')
    page.get_by_role('button', name='Sign in', exact=True).click()
    expect(page.locator('.admin-content')).to_be_visible()


def snap(page, filename):
    page.screenshot(path=str(OUT / filename), full_page=True)
    report['screenshots'].append(filename)


def seed_records(page):
    page.evaluate("""() => new Promise((resolve, reject) => {
      const request = indexedDB.open('veldridge-workspace-v1', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(['content', 'inquiries'], 'readwrite');
        const store = tx.objectStore('content');
        const read = store.get('workspace');
        read.onsuccess = () => {
          const content = read.result;
          content.services = [{id:'qa-service', title:'QA Service', summary:'QA summary', description:'',
            propertyTypes:['Residential'], points:[], imageId:null, homeImageId:null, imageAlt:'',
            status:'archived', group:'main', showOnHome:false, order:1, revision:1, eyebrow:'', cta:'Discuss Your Project', tone:'white'}];
          content.categories = [{id:'qa-category', name:'QA category', description:'', revision:1}];
          content.articles = [{id:'qa-article', title:'QA Article', summary:'', sections:[], imageId:null,
            imageAlt:'', status:'draft', publishedAt:'2026-11-15', categoryId:'qa-category', source:{label:'',url:''}, revision:1}];
          content.projects = [{id:'qa-project', title:'QA Project', summary:'', photos:[], coverPhotoId:'',
            status:'archived', serviceId:'qa-service', propertyType:'Residential', order:1, revision:1,
            duration:'', material:'', finish:'', work:[], property:'', isDemo:false}];
          store.put(content,'workspace');
          tx.objectStore('inquiries').put({id:'qa-inquiry',name:'QA Customer',email:'test@example.com',phone:'',zip:'',
            message:'Test record',service:'qa-service',serviceLabel:'QA Service',status:'closed',source:null,
            photos:[],notes:[],createdAt:'2026-11-15T00:00:00Z',revision:1,isDemo:true});
        };
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onabort = () => { db.close(); reject(tx.error); };
      };
    })""")


with sync_playwright() as playwright:
    for browser_name in os.environ.get('QA_BROWSERS', 'chromium,webkit').split(','):
        browser = getattr(playwright, browser_name).launch(headless=True)

        def run(name, callback, viewport=None, **context_options):
            context = browser.new_context(viewport=viewport or {'width':1440,'height':1000}, **context_options)
            page = context.new_page()
            page.set_default_timeout(12000)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            started = time.monotonic()
            try:
                callback(page, context)
                assert not errors, errors
                report['checks'].append({'browser':browser_name,'name':name,'pass':True,'seconds':round(time.monotonic()-started,2)})
                print('PASS', browser_name, name, flush=True)
            except Exception as error:
                report['checks'].append({'browser':browser_name,'name':name,'pass':False,'error':str(error),'trace':traceback.format_exc()})
                try:
                    snap(page, browser_name + '-failure-' + re.sub('[^a-z0-9]+','-',name.lower()) + '.png')
                except Exception:
                    pass
                print('FAIL', browser_name, name, str(error), flush=True)
            finally:
                report['pageErrors'].extend(errors)
                context.close()
                (OUT/'report.json').write_text(json.dumps(report,indent=2))

        def public_unknown(page, context):
            for path in ['/missing', '/nested/not/a/page', '/404', '/admin-typo', '/missing?from=qa#section', '/'+'long-'*80, '/%3Cscript%3Ebad%3C%2Fscript%3E']:
                go(page,path); is_404(page)
                assert not page.url.rstrip('/').endswith('/contact')
                assert '/missing' not in page.locator('.not-found').inner_text()
            go(page,'/missing');page.reload();is_404(page)
            snap(page,browser_name+'-public-desktop.png')
        run('Public direct URLs, nested paths, query/hash, escaping and reload', public_unknown)

        def recovery(page, context):
            exits=[('Back to Home','/'),('Contact us','/contact'),('Our services','/services'),('Our projects','/gallery'),('Roofing journal','/blog')]
            for label,path in exits:
                go(page,'/missing');is_404(page)
                page.locator('.not-found').get_by_role('link',name=label,exact=True).click()
                expect(page).to_have_url(BASE+path)
                expect(page.locator('.not-found')).to_have_count(0)
                expect(page.locator('meta[data-not-found]')).to_have_count(0)
                expect(page).not_to_have_title(re.compile('404'))
            go(page,'/missing');is_404(page)
            page.keyboard.press('Tab')
            expect(page.get_by_role('link',name='Back to Home',exact=True)).to_be_focused()
            page.keyboard.press('Enter');expect(page.locator('.home-page')).to_be_visible()
            expect(page).to_have_title('Veldridge Roofing | Professional Roofing Services')
            page.go_back();is_404(page)
            page.go_forward();expect(page.locator('.not-found')).to_have_count(0)
            expect(page.locator('meta[data-not-found]')).to_have_count(0)
        run('Recovery links, keyboard focus, metadata cleanup and browser history', recovery)

        def guard(page,context):
            login(page,'/admin/unknown/deep')
            expect(page).to_have_url(BASE+'/admin/unknown/deep');is_404(page,'admin')
            snap(page,browser_name+'-admin-desktop.png')
            page.get_by_role('link',name='Back to overview',exact=True).click()
            expect(page).to_have_title('Overview | Veldridge Admin')
            expect(page.locator('.not-found')).to_have_count(0)
            expect(page.locator('meta[data-not-found]')).to_have_count(0)
            go(page,'/admin/services-typo');is_404(page,'admin')
            expect(page.locator('.admin-topbar__breadcrumb')).to_contain_text('Page not found')
            page.locator('.not-found').get_by_role('link',name='View website',exact=True).click()
            expect(page).to_have_title('Veldridge Roofing | Professional Roofing Services')
            expect(page.locator('meta[data-not-found]')).to_have_count(0)
        run('Admin guard, login return path, layout separation and safe exits', guard)

        def missing_records(page,context):
            login(page)
            for path,title,label,target in [
                ('services','Service','Back to services','/admin/services'),
                ('news','Article','Back to news','/admin/news'),
                ('projects','Project','Back to projects','/admin/projects'),
                ('news/categories','Category','Back to categories','/admin/news/categories'),
                ('inquiries','Inquiry','Back to inquiries','/admin/inquiries'),
            ]:
                go(page,'/admin/'+path+'/missing-record')
                is_404(page,'admin',title+' not found.')
                page.locator('.not-found').get_by_role('link',name=label,exact=True).click()
                expect(page).to_have_url(BASE+target)
                expect(page.locator('.not-found')).to_have_count(0)
                expect(page.locator('meta[data-not-found]')).to_have_count(0)
            for path in ['/admin/login/unknown','/admin/services/new/unknown','/admin/news/categories/new/unknown']:
                go(page,path);is_404(page,'admin')
        run('Missing records in all five editors and nested admin catch-all', missing_records)

        def valid_routes(page,context):
            for path in ['/','/about','/services','/gallery','/blog','/contact','/services?qa=1#missing-anchor']:
                go(page,path);expect(page.locator('h1')).to_be_visible()
                expect(page.locator('.not-found')).to_have_count(0)
            login(page)
            for path in ['/admin','/admin/services','/admin/news','/admin/projects','/admin/inquiries','/admin/settings',
                         '/admin/services/new','/admin/news/new','/admin/projects/new','/admin/news/categories','/admin/news/categories/new']:
                go(page,path);expect(page.locator('h1')).to_be_visible()
                expect(page.locator('.not-found')).to_have_count(0)
            seed_records(page)
            for path,title in [('services/qa-service','Edit service'),('news/qa-article','Edit article'),
                               ('projects/qa-project','Edit project'),('news/categories/qa-category','News categories'),
                               ('inquiries/qa-inquiry','Inquiry #qa-inquiry')]:
                go(page,'/admin/'+path)
                expect(page.get_by_role('heading',name=title,exact=True)).to_be_visible()
                expect(page.locator('.not-found')).to_have_count(0)
                expect(page.locator('meta[data-not-found]')).to_have_count(0)
        run('Six public pages, empty/new admin routes, valid drafts and archived records', valid_routes)

        for width,height in [(320,740),(390,844),(834,1112),(1440,1000),(1920,1080),(844,390)]:
            def responsive(page,context,width=width):
                go(page,'/missing');is_404(page)
                for anchor in page.locator('.not-found a').all():
                    anchor.scroll_into_view_if_needed()
                    box=anchor.bounding_box()
                    assert box and box['x']>=0 and box['x']+box['width']<=width+1
                if width==390: snap(page,browser_name+'-public-mobile.png')
                login(page,'/admin/missing');is_404(page,'admin')
                if width<=1100:
                    page.get_by_role('button',name='Open admin navigation').click()
                    expect(page.get_by_role('dialog')).to_be_visible()
                    page.keyboard.press('Escape');expect(page.get_by_role('dialog')).to_have_count(0)
                if width==390: snap(page,browser_name+'-admin-mobile.png')
            run(f'Responsive 404, reachable links and admin menu at {width}x{height}',responsive,{'width':width,'height':height})

        def reduced_motion(page,context):
            go(page,'/missing');is_404(page)
            assert page.locator('.not-found__button').first.evaluate('(el)=>getComputedStyle(el).transitionDuration')=='0s'
            assert page.locator('.not-found').evaluate('(el)=>getComputedStyle(el).animationName')=='none'
        run('Reduced Motion and immediately accessible error content', reduced_motion,reduced_motion='reduce')

        def storage_error(page,context):
            context.add_init_script("Object.defineProperty(window,'indexedDB',{value:undefined,configurable:true})")
            go(page,'/services')
            expect(page.get_by_role('heading',name='Local content is unavailable.')).to_be_visible()
            expect(page.get_by_role('button',name='Try again',exact=True)).to_be_visible()
            expect(page.locator('.not-found')).to_have_count(0)
            expect(page.locator('meta[data-not-found]')).to_have_count(0)
        run('Storage errors remain retryable errors rather than false 404s', storage_error)

        browser.close()

report['passed']=sum(check['pass'] for check in report['checks'])
report['failed']=len(report['checks'])-report['passed']
(OUT/'report.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'passed':report['passed'],'failed':report['failed']}))
raise SystemExit(bool(report['failed']))
