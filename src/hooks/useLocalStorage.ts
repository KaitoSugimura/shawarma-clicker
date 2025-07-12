import { useState, useEffect } from "react";

// Hook for persisting game state to localStorage
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Auto-save game state every few seconds
export function useAutoSave<T>(
  key: string,
  value: T,
  intervalMs: number = 5000
) {
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Auto-save failed for key "${key}":`, error);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [key, value, intervalMs]);
}
