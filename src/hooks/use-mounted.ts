"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hydration-safe client-mounted hook.
 * Uses useSyncExternalStore to avoid synchronous setState inside effects,
 * eliminating cascading re-renders and ESLint react-hooks/set-state-in-effect errors.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
