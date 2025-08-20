'use client';
import { useSyncExternalStore } from 'react';
import { featureFlags } from '@/lib/feature-flags';
import type { FeatureKey } from '@/lib/feature-flags';

export function useFeature(key: FeatureKey) {
  const subscribe = (cb: () => void) => featureFlags.subscribe(cb);
  const getSnapshot = () => featureFlags.get()[key] ?? false;
  const getServerSnapshot = () => featureFlags.get()[key] ?? false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setRuntimeFlags(
  flags: Partial<ReturnType<typeof featureFlags.get>>
) {
  featureFlags.setRuntime(flags);
}
