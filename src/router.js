import { useEffect, useState } from 'react';

// Lightweight hash router: '#/path' supports browser back/forward
export function navigate(path) {
  window.location.hash = `#${path}`;
}

export function useRoute() {
  const [hash, setHash] = useState(window.location.hash.slice(1) || '/');
  useEffect(() => {
    const onChange = () => setHash(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const clean = hash.split('?')[0];
  const [path, param] = clean.split('/').filter(Boolean);
  return { hash, path: path || '', param: param ? decodeURIComponent(param) : null };
}
