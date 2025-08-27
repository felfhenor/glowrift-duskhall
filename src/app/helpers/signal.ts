import type { WritableSignal } from '@angular/core';
import { signal } from '@angular/core';
import { error } from '@helpers/logging';

export function localStorageSignal<T>(
  localStorageKey: string,
  initialValue: T,
  onLoad?: (value: T) => void,
): WritableSignal<T> {
  const storedValueRaw = localStorage.getItem(localStorageKey);
  if (storedValueRaw) {
    try {
      initialValue = JSON.parse(storedValueRaw);
      onLoad?.(initialValue);
    } catch (e) {
      error(
        'LocalStorageSignal',
        'Failed to parse stored value for key:',
        localStorageKey,
      );
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

/**
 * Creates a signal that persists its value to IndexedDB
 * @param indexedDbKey The key to use for storing the value in IndexedDB
 * @param initialValue The initial value to use if no stored value exists
 * @param onLoad Optional callback called when a value is loaded from IndexedDB
 * @returns A writable signal that automatically persists changes to IndexedDB
 */
export function indexedDbSignal<T>(
  indexedDbKey: string,
  initialValue: T,
  onLoad?: (value: T) => void,
): WritableSignal<T> {
  const DB_NAME = 'gamestorage';
  const STORE_NAME = 'gamestate';
  const DB_VERSION = 1;

  let db: IDBDatabase | null = null;
  let isInitialized = false;

  const writableSignal = signal(initialValue);

  // Initialize IndexedDB
  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (db) {
        resolve(db);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        error('IndexedDbSignal', 'Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };
    });
  };

  // Load value from IndexedDB
  const loadFromDB = async (): Promise<void> => {
    try {
      const database = await initDB();
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(indexedDbKey);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          if (request.result !== undefined) {
            try {
              const loadedValue = request.result;
              writableSignal.set(loadedValue);
              onLoad?.(loadedValue);
            } catch (e) {
              error(
                'IndexedDbSignal',
                'Failed to parse stored value for key:',
                indexedDbKey,
              );
            }
          } else {
            // No stored value, save the initial value
            saveToDBSync(initialValue);
          }

          onLoad?.(initialValue);
          isInitialized = true;
          resolve();
        };

        request.onerror = () => {
          error(
            'IndexedDbSignal',
            'Failed to load value for key:',
            indexedDbKey,
            request.error,
          );
          isInitialized = true;
          resolve();
        };
      });
    } catch (e) {
      error('IndexedDbSignal', 'Failed to initialize database:', e);
      isInitialized = true;
    }
  };

  // Save value to IndexedDB (synchronous call)
  const saveToDBSync = (value: T): void => {
    if (!isInitialized) return;

    saveToDB(value).catch((e) => {
      error('IndexedDbSignal', 'Failed to save value:', e);
    });
  };

  // Save value to IndexedDB (async)
  const saveToDB = async (value: T): Promise<void> => {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, indexedDbKey);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // Monkey-patch the set method to update IndexedDB
  const originalSet = writableSignal.set;
  writableSignal.set = (value: T) => {
    originalSet(value);
    saveToDBSync(value);
  };

  // Monkey-patch the update method to update IndexedDB
  writableSignal.update = (updateFn: (value: T) => T) => {
    const value = updateFn(writableSignal());
    originalSet(value);
    saveToDBSync(value);
  };

  // Load initial value from IndexedDB
  loadFromDB();

  return writableSignal;
}
