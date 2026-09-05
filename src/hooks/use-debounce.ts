import { useState, useEffect } from "react";

/**
 * Custom React hook that delays updating the returned value until after the specified delay
 * has elapsed since the last change. Ideal for search inputs, filtering, and auto-saving.
 *
 * @param value The value to debounce
 * @param delay Milliseconds to wait before updating (default: 400ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
