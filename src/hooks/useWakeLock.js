'use client';
import { useEffect, useRef, useCallback } from 'react';

export function useWakeLock(enabled) {
  const wakeLockRef = useRef(null);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }, []);

  const acquire = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {}
  }, []);

  useEffect(() => {
    if (enabled) {
      acquire();
    } else {
      release();
    }
    return () => { release(); };
  }, [enabled, acquire, release]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) acquire();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [enabled, acquire]);
}
