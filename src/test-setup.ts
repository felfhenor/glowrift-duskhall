// Mock Angular core to prevent JIT compilation issues in tests
import { vi } from 'vitest';

// Mock @angular/core before any imports that might use it
vi.mock('@angular/core', () => {
  const mockSignal = (value: unknown) => {
    const signal = () => value;
    signal.set = vi.fn((newValue: unknown) => {
      value = newValue;
      return value;
    });
    signal.update = vi.fn((updater: (prev: unknown) => unknown) => {
      value = updater(value);
      return value;
    });
    signal.asReadonly = vi.fn(() => signal);
    return signal;
  };

  const mockComputed = (fn: () => unknown) => {
    const computed = () => fn();
    computed.asReadonly = vi.fn(() => computed);
    return computed;
  };

  const mockEffect = vi.fn();
  const mockInject = vi.fn();

  return {
    signal: mockSignal,
    computed: mockComputed,
    effect: mockEffect,
    inject: mockInject,
    Injectable: () => vi.fn(),
    Component: () => vi.fn(),
    Directive: () => vi.fn(),
    Pipe: () => vi.fn(),
    input: {
      required: vi.fn(() => () => ({})),
    },
    output: vi.fn(() => () => ({})),
    WritableSignal: vi.fn(),
    Signal: vi.fn(),
    ENVIRONMENT_INITIALIZER: 'ENVIRONMENT_INITIALIZER',
    ErrorHandler: vi.fn(),
  };
});

// Mock Angular common to prevent PlatformLocation issues
vi.mock('@angular/common', () => ({
  PlatformLocation: vi.fn(() => ({})),
  Location: vi.fn(() => ({})),
  NgIf: vi.fn(),
  NgFor: vi.fn(),
  NgSwitch: vi.fn(),
  DecimalPipe: vi.fn(),
  TitleCasePipe: vi.fn(),
  formatDate: vi.fn(),
}));

// Mock Angular platform-browser to prevent DOM issues
vi.mock('@angular/platform-browser', () => ({
  BrowserModule: vi.fn(),
  Title: vi.fn(() => ({})),
}));

// Mock rxjs to prevent observable issues
vi.mock('rxjs', () => ({
  interval: vi.fn(() => ({
    subscribe: vi.fn(),
  })),
  Observable: vi.fn(),
  Subject: vi.fn(() => ({
    next: vi.fn(),
    error: vi.fn(),
    complete: vi.fn(),
    subscribe: vi.fn(),
    asObservable: vi.fn(() => ({
      subscribe: vi.fn(),
    })),
  })),
  BehaviorSubject: vi.fn(() => ({
    next: vi.fn(),
    error: vi.fn(),
    complete: vi.fn(),
    subscribe: vi.fn(),
    asObservable: vi.fn(() => ({
      subscribe: vi.fn(),
    })),
    getValue: vi.fn(),
  })),
}));

// Mock localStorage for tests
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock indexedDB for tests
Object.defineProperty(window, 'indexedDB', {
  value: {
    open: vi.fn(() => ({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: {
        transaction: vi.fn(() => ({
          objectStore: vi.fn(() => ({
            get: vi.fn(() => ({
              onsuccess: null,
              onerror: null,
              result: undefined,
            })),
            put: vi.fn(() => ({
              onsuccess: null,
              onerror: null,
            })),
          })),
        })),
        objectStoreNames: {
          contains: vi.fn(() => false),
        },
        createObjectStore: vi.fn(),
      },
    })),
  },
  writable: true,
});

// Mock signal helpers
vi.mock('@helpers/signal', () => {
  const mockSignal = (value: unknown) => {
    const signal = () => value;
    signal.set = vi.fn((newValue: unknown) => {
      value = newValue;
      return value;
    });
    signal.update = vi.fn((updater: (prev: unknown) => unknown) => {
      value = updater(value);
      return value;
    });
    signal.asReadonly = vi.fn(() => signal);
    return signal;
  };

  return {
    localStorageSignal: vi.fn((key: string, initialValue: unknown) =>
      mockSignal(initialValue),
    ),
    indexedDbSignal: vi.fn((key: string, initialValue: unknown) =>
      mockSignal(initialValue),
    ),
  };
});
