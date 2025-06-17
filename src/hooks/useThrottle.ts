import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook that throttles a value to reduce the frequency of updates
 * @param value The value to throttle
 * @param delay The minimum time in milliseconds between updates
 * @returns The throttled value
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());
  
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;
    
    if (timeSinceLastUpdate >= delay) {
      // If enough time has passed, update immediately
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      // Otherwise, schedule an update for later
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, delay - timeSinceLastUpdate);
      
      return () => clearTimeout(timeoutId);
    }
  }, [value, delay]);
  
  return throttledValue;
}

/**
 * Custom hook that returns a throttled function
 * @param callback The function to throttle
 * @param delay The minimum time in milliseconds between function calls
 * @returns The throttled function
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastCalledTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  
  // Clean up any pending timeouts when the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCalledTime.current;
    
    // Store the latest arguments
    lastArgsRef.current = args;
    
    // If we haven't called the function recently, call it immediately
    if (timeSinceLastCall >= delay) {
      lastCalledTime.current = now;
      callback(...args);
    } else {
      // Otherwise, clear any existing timeout and set a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Schedule a call with the latest arguments
      timeoutRef.current = setTimeout(() => {
        lastCalledTime.current = Date.now();
        if (lastArgsRef.current) {
          callback(...lastArgsRef.current);
        }
        timeoutRef.current = null;
      }, delay - timeSinceLastCall);
    }
  };
}
