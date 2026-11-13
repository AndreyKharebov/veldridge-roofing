from pathlib import Path
import re
OUT=Path.cwd()
def put(path,text):
 p=OUT/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding='utf-8')
def edit(path,old,new):
 p=OUT/path;s=p.read_text();assert old in s,(path,old[:80]);p.write_text(s.replace(old,new))
def cut(s,a,b):
 start=s.index(a);end=s.index(b,start);return s[:start]+s[end:]
# Idempotent on the generated verification commit.
if not (OUT/'src/hooks/useScrollReveal.js').exists():
 print('Shared motion migration already applied');raise SystemExit(0)
for page in ['About','Services','Gallery','Blog','Contact']:
 name=page[0].lower()+page[1:]
 folder=f'src/pages/{page}Page/motion'
 old=(OUT/f'{folder}/use{page}Reveal.js').read_text()
 if page=='Gallery':
  groups=old[old.index('const STATIC_GROUPS = ['):old.index('\n\nexport const')]
  groups=groups.replace('const STATIC_GROUPS','export const galleryMotion')
  groups=groups.replace('\n];',"\n  { selector: '.project-card[data-gallery-project]', direction: 'up', stagger: true, columns: 3, tabletColumns: 2, idAttribute: 'data-gallery-project' },\n];")
  options="\nexport const galleryMotionOptions = { dynamic: true };\n"
 else:
  groups=old[old.index('const REVEAL_GROUPS = ['):old.index('\n\nexport const')]
  groups=groups.replace('const REVEAL_GROUPS',f'export const {name}Motion')
  options="\nexport const servicesMotionOptions = { anchorSelector: '[data-service-anchor]' };\n" if page=='Services' else ''
 for f in (OUT/folder).glob('*'):f.unlink()
 put(f'{folder}/{name}Motion.js','// Page choreography only. Timing lives in styles/motion/_settings.sass.\n'+groups+'\n'+options)
 p=f'src/pages/{page}Page/{page}Page.jsx'
 extra=f', {name}MotionOptions' if options else ''
 edit(p,f"import {{ use{page}Reveal }} from './motion/use{page}Reveal.js';",f"import {{ useMotionReveal }} from '../../hooks/useMotionReveal.js';\nimport {{ {name}Motion{extra} }} from './motion/{name}Motion.js';")
 edit(p,f"import './motion/{page}Motion.sass';\n",'')
 edit(p,f'use{page}Reveal()',f'useMotionReveal({name}Motion{extra})')
 edit(p,f"className='{name}-page'",f"className='{name}-page motion-root'")
put('src/pages/HomePage/motion/homeMotion.js',"""// Existing Home choreography; durations/delays remain distinct from inner pages.
export const homeMotion = [
  { selector: '.hero__left-card', direction: 'left' },
  { selector: '.hero__right-card', direction: 'right' },
  { selector: '.hero__bottom-card', direction: 'up' },
  { selector: '.hero__insurance', direction: 'right' },
  { selector: '.about__photo--main', direction: 'up' },
  { selector: '.about__photo--secondary', direction: 'up' },
  { selector: '.service-card', direction: 'up' },
  { selector: '.why-choose-us__benefit', direction: 'right' },
];
""")
p='src/pages/HomePage/HomePage.jsx'
s=(OUT/p).read_text();s="import { useMotionReveal } from '../../hooks/useMotionReveal.js';\nimport { homeMotion } from './motion/homeMotion.js';\n\n"+s
s=s.replace('const HomePage = () => {','const HomePage = () => {\n  const pageRef = useMotionReveal(homeMotion);')
s=s.replace('    <>',"    <div className='home-page motion-root' ref={pageRef}>").replace('    </>','    </div>');put(p,s)
for name,file in [('Hero','HeroSlide.jsx'),('About','About.jsx'),('Services','ServiceCard.jsx'),('WhyChooseUs','BenefitCard.jsx')]:
 p=f'src/pages/HomePage/components/{name}/{file}';s=(OUT/p).read_text()
 s=s.replace("import { useScrollReveal } from '../../../../hooks/useScrollReveal.js';\n",'')
 s=re.sub(r'^  const \[\w+Ref, \w+Visible\] = useScrollReveal\(\);\n','',s,flags=re.M)
 s=re.sub(r'^\s*ref=\{(?:left|right|bottom|insurance|main|secondary|card)Ref\}\n','\n',s,flags=re.M)
 if name=='Hero':
  for key in ['left','right','bottom','insurance']:
   cls=f'hero__{key}'+('' if key=='insurance' else '-card')
   s=s.replace("className={`"+cls+" ${"+key+"Visible ? 'is-revealed' : ''}`}",f"className='{cls}'")
 elif name=='About':
  for key in ['main','secondary']:
   s=re.sub(r'className=\{`about__photo about__photo--'+key+r' \$\{\s*'+key+r"Visible \? 'is-revealed' : ''\s*\}`\}",f"className='about__photo about__photo--{key}'",s)
 elif name=='Services':
  s=re.sub(r"\$\{\s*cardVisible \? ' is-revealed' : ''\s*\}",'',s)
 else:s=s.replace("${cardVisible ? ' is-revealed' : ''}",'')
 assert 'Visible' not in s and 'useScrollReveal' not in s,p
 put(p,s)
(OUT/'src/hooks/useScrollReveal.js').unlink()
p='src/pages/HomePage/components/Hero/Hero.sass';s=(OUT/p).read_text()
s=cut(s,'  // ======================================\n  // Scroll reveal - Desktop defaults','// ========================================\n// Tablet:')
s=cut(s,'    // Scroll reveal\n','// ========================================\n// Mobile:')
s=s[:s.index('    // Scroll reveal\n')]+"@media (prefers-reduced-motion: reduce)\n  .hero\n    &__button,\n    &__image\n      transition: none\n";put(p,s)
p='src/pages/HomePage/components/About/About.sass';s=(OUT/p).read_text();s=cut(s,'  // Scroll reveal\n','  &__image\n');s=cut(s,'    // Tablet scroll reveal\n','@media (max-width: 700px)');s=s[:s.index('// Revealed state')];put(p,s)
p='src/pages/HomePage/components/Services/Services.sass';s=(OUT/p).read_text();s=s[:s.index('// ========================================\n// Scroll Reveal')];put(p,s)
p='src/pages/HomePage/components/WhyChooseUs/WhyChooseUs.sass';s=(OUT/p).read_text();s=s[:s.index('// ========================================\n// Scroll Reveal')]+"@media (prefers-reduced-motion: reduce)\n  .why-choose-us\n    &__button,\n    &__benefit-panel\n      transition: none\n";put(p,s)
p='src/pages/HomePage/components/Testimonials/Testimonials.sass';s=(OUT/p).read_text();s=cut(s,'@keyframes testimonial-appear','// Tablet:');put(p,s)
legacy=OUT/'src/styles/utilities/_animations.sass';assert not legacy.read_text().strip();legacy.unlink()
for p in (OUT/'src').rglob('*.sass'):
 s=p.read_text()
 if '/motion/' in str(p):continue
 lines=[]
 for line in s.splitlines():
  if re.search(r'(?:transition|animation)(?:-[\w-]+)?:',line):
   if 'testimonial-appear' in line:line=line.replace('0.3s','var(--motion-testimonial-duration)')
   elif 'Header' in str(p):line=line.replace('0.3s','var(--motion-menu-duration)')
   elif 'FAQ' in str(p):line=line.replace('0.3s','var(--motion-accordion-icon-duration)')
   if 'LatestNews' in str(p):line=line.replace('0.25s','var(--motion-news-hover-duration)')
   if 'ProjectCard' in str(p) and 'transform' in line:line=line.replace('0.2s','var(--motion-project-hover-duration)')
   if 'Footer' in str(p) and 'transform' in line:line=line.replace('transform 0.2s','transform var(--motion-social-hover-duration)')
   line=line.replace('1.1s','var(--motion-hero-crossfade-duration)').replace('0.4s','var(--motion-image-zoom-duration)').replace('0.35s','var(--motion-accordion-duration)').replace('0.2s','var(--motion-color-duration)')
   line=re.sub(r'\bease-out\b','var(--motion-enter-easing)',line)
   line=re.sub(r'(?<![-\w])ease(?![-\w])','var(--motion-interaction-easing)',line)
  line=line.replace('scale(1.05)','scale(var(--motion-image-zoom-scale))').replace('translateY(-6px)','translateY(calc(-1 * var(--motion-card-hover-distance)))').replace('translateY(-4px)','translateY(calc(-1 * var(--motion-project-hover-distance)))').replace('translateY(-3px)','translateY(calc(-1 * var(--motion-social-hover-distance)))')
  if 'Header' in str(p):line=line.replace('translateY(-20px)','translateY(calc(-1 * var(--motion-menu-distance)))')
  lines.append(line)
 p.write_text('\n'.join(lines)+'\n')
edit('src/styles/main.sass',"@use 'base/global'","@use 'base/global'\n\n@use 'motion/settings'\n@use 'motion/animations'")
for name in ['Hero','Testimonials']:
 p=f'src/pages/HomePage/components/{name}/{name}.jsx';s=(OUT/p).read_text();s="import { motionConfig } from '../../../../config/motion.js';\n"+s
 s=s.replace('}, 5000);','}, motionConfig.carousel.intervalMs);').replace('}, 3300);','}, motionConfig.carousel.heroInitialDelayMs);').replace("window.matchMedia('(prefers-reduced-motion: reduce)')",'window.matchMedia(motionConfig.reducedMotionQuery)');put(p,s)
for name in ['Services','Gallery','Blog']:
 p=f'src/pages/{name}Page/{name}Page.jsx';s=(OUT/p).read_text();s="import { motionConfig } from '../../config/motion.js';\n"+s
 s=s.replace("window.matchMedia('(prefers-reduced-motion: reduce)')",'window.matchMedia(motionConfig.reducedMotionQuery)');put(p,s)
for name in ['About','Services','Gallery','Blog','Contact']:
 p=OUT/f'src/pages/{name}Page/README.md'
 if p.exists():
  s=p.read_text();s+='\n## Animation settings\n\nAll timing and motion distances: `src/styles/motion/_settings.sass`.\nTrigger/carousel configuration: `src/config/motion.js`.\nShared behavior: `src/hooks/useMotionReveal.js`. Page-specific target selectors\nare in `motion/'+name[0].lower()+name[1:]+'Motion.js`. See `src/styles/motion/README.md`.\n';p.write_text(s)
for p in (OUT/'src').rglob('*.jsx'):
 s=p.read_text();s=re.sub(r'(<(?:div|article)\n)\s*\n',r'\1',s);s=s.replace("const About = () => {\n\n", "const About = () => {\n");p.write_text(s)
print('Shared motion migration complete')
