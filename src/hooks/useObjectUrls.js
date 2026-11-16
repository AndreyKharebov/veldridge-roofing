import { useEffect, useRef } from 'react';

// URLs belong only to the mounted form/dialog and are released on removal/unmount.
export function useObjectUrls() {
  const active = useRef(new Set());
  useEffect(() => {
    const urls = active.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const create = (file) => {
    const url = URL.createObjectURL(file);
    active.current.add(url);
    return url;
  };
  const release = (url) => {
    if (active.current.delete(url)) URL.revokeObjectURL(url);
  };
  return { create, release };
}
