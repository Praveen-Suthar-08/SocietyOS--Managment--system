'use client';

import * as React from 'react';

// BroadcastChannel for instant cross-tab sync
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('societyos_sync_bus');
  } catch {}
}

// Dispatch a real-time sync event across all components & tabs
export function broadcastSync(key: string, data: any) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('societyos-sync', { detail: { key, data } }));
      if (syncChannel) {
        syncChannel.postMessage({ key, data });
      }
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }
}

// React Hook to subscribe to a synchronized local storage key in real-time
export function useSyncStore<T>(key: string, defaultData: T): [T, (val: T | ((prev: T) => T)) => void] {
  // Always initialize with defaultData so server HTML and client initial DOM match identically (prevents error #418)
  const [data, setData] = React.useState<T>(defaultData);

  React.useEffect(() => {
    // 1. Initial client hydration from localStorage after mount
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null && saved !== 'undefined') {
        setData(JSON.parse(saved));
      } else {
        localStorage.setItem(key, JSON.stringify(defaultData));
      }
    } catch {}

    // 2. Sync if storage changes in another tab
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setData(JSON.parse(e.newValue));
        } catch {}
      }
    };

    // 3. Sync if updated in current window / tab
    const handleCustomSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.key === key) {
        setData(detail.data);
      }
    };

    // 4. Sync from BroadcastChannel across tabs
    const handleChannelMessage = (ev: MessageEvent) => {
      if (ev.data && ev.data.key === key) {
        setData(ev.data.data);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('societyos-sync', handleCustomSync);
    if (syncChannel) {
      syncChannel.addEventListener('message', handleChannelMessage);
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('societyos-sync', handleCustomSync);
      if (syncChannel) {
        syncChannel.removeEventListener('message', handleChannelMessage);
      }
    };
  }, [key]);

  const update = React.useCallback(
    (val: T | ((prev: T) => T)) => {
      setData((prev) => {
        const nextVal = typeof val === 'function' ? (val as (prev: T) => T)(prev) : val;
        broadcastSync(key, nextVal);
        return nextVal;
      });
    },
    [key]
  );

  return [data, update];
}
