import { useMemo } from 'react';

export function useDevicePerformanceTier() {
  return useMemo(() => {
    if (typeof window === 'undefined') return 'mid';
    const mem = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const mobile = window.innerWidth < 768;
    if (mobile || mem <= 4 || cores <= 4) return 'low';
    if (mem >= 8 && cores >= 8) return 'high';
    return 'mid';
  }, []);
}
