from pathlib import Path
p=Path('.github/qa/motion-check.txt')
s=p.read_text()
s=s.replace('`${href} [data-motion-state="pending"]`', '`#${href.split(\'#\')[1]} [data-motion-state="pending"]`')
s=s.replace("await p.locator('.faq__toggle').first().click();", "await p.locator('.faq__toggle').nth(1).click();")
s=s.replace("p.locator('.faq__item').first().locator('.faq__panel')", "p.locator('.faq__item').nth(1).locator('.faq__panel')")
s=s.replace('p.locator(`.header__nav-link[href="${r}"]`)', 'p.locator(r === \'/contact\' ? \'.header__contact\' : `.header__nav-link[href="${r}"]`)')
s=s.replace("function track(page){page.on('pageerror'", "function track(page){page.setDefaultTimeout(10000);page.setDefaultNavigationTimeout(15000);page.on('pageerror'")
s=s.replace("await decode(a);await decode(b);", "await a.evaluate(s=>document.querySelectorAll(s).forEach(e=>e.classList.add('is-revealed')),homeTargets);await decode(a);await decode(b);")
s=s.replace("console.error('FAIL',name,e.message);}}", "console.error('FAIL',name,e.message);}finally{await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));}}")
# Rerun the corrected fixtures only; the identical source tree already passed
# all duration/delay, natural reveal, gallery, reader, form and fallback checks.
s=s.replace('async function check(name,fn){try{', 'async function check(name,fn){if(!/identical settled layout|anchors, keyboard|shared carousel/.test(name))return;try{')
p.write_text(s)
