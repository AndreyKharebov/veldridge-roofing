from pathlib import Path
p = Path('.github/qa/contact-check.txt')
s = p.read_text()
# Use the real existing Gallery button class.
s = s.replace(".project-card__open", ".project-card__button")
# Buffer-based automation synthesizes a fresh lastModified timestamp each time.
# A genuine duplicate has stable file metadata; reproduce that explicitly.
old = """    await picker.setInputFiles(fileData());
    assert.equal(await page.locator('.photo-picker__file').count(), 1);
    await picker.setInputFiles(fileData());
    assert.equal(await page.locator('.photo-picker__file').count(), 1);"""
new = """    for (let attempt = 0; attempt < 2; attempt++) {
      await page.locator('.photo-picker__dropzone').evaluate((element) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File(['same image'], 'roof.png', { type: 'image/png', lastModified: 1700000000000 }));
        element.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
      });
      await page.waitForFunction(() => document.querySelectorAll('.photo-picker__file').length > 0);
      assert.equal(await page.locator('.photo-picker__file').count(), 1);
    }"""
assert s.count(old) == 1
p.write_text(s.replace(old, new))
