import type { WritableSignal } from '@angular/core';
import { signal } from '@angular/core';

export function localStorageSignal<T>(
  localStorageKey: string,
  initialValue: T,
): WritableSignal<T> {
  const storedValueRaw = localStorage.getItem(localStorageKey);
  if (storedValueRaw) {
    try {
      initialValue = JSON.parse(storedValueRaw);
    } catch (e) {
      console.error('Failed to parse stored value for key:', localStorageKey);
    }
  } else {
    localStorage.setItem(localStorageKey, JSON.stringify(initialValue));
  }

  const writableSignal = signal(initialValue);

  // monkey-patch the set method to update the localStorage value
  const originalSet = writableSignal.set;
  writableSignal.set = (value: T) => {
    localStorage.setItem(localStorageKey, JSON.stringify(value));
    originalSet(value);
  };

  writableSignal.update = (updateFn: (value: T) => T) => {
    const value = updateFn(writableSignal());
    localStorage.setItem(localStorageKey, JSON.stringify(value));
    originalSet(value);
  };

  return writableSignal;
}
