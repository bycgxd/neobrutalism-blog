import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/src/lib/tracker';

export default function PageTracker() {
  const location = useLocation();
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    if (location.pathname === prevPathname.current) return;
    prevPathname.current = location.pathname;
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}
