// One shared lock for nested native dialogs (e.g. preview + unsaved-change warning).
// Only the final owner restores the original body styles and scroll position.
let owners = 0;
let restore = null;
export function lockBodyScroll() {
  if (owners === 0) {
    const body = document.body;
    const properties = ['position','top','left','right','width','padding-right','overflow'];
    const original = properties.map((property) => [property,body.style.getPropertyValue(property),body.style.getPropertyPriority(property)]);
    const x = window.scrollX;
    const y = window.scrollY;
    const pathname = window.location.pathname;
    const scrollbar = window.innerWidth-document.documentElement.clientWidth;
    const padding = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${padding+scrollbar}px`;
    restore = () => {
      original.forEach(([property,value,priority]) => {
        if (value) body.style.setProperty(property,value,priority);
        else body.style.removeProperty(property);
      });
      const samePage = window.location.pathname === pathname;
      window.scrollTo({left:samePage ? x : 0,top:samePage ? y : 0,behavior:'instant'});
    };
  }
  owners += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    owners -= 1;
    if (owners === 0) { restore?.();restore = null; }
  };
}
