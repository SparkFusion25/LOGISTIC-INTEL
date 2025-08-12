'use client';
import { useEffect } from 'react';

export default function ClientErrorHooks() {
  useEffect(() => {
    const onErr = (e: ErrorEvent) => console.error('[GlobalWindowError]', e.error || e.message);
    const onRej = (e: PromiseRejectionEvent) => console.error('[GlobalPromiseRejection]', e.reason);
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);
  return null;
}
