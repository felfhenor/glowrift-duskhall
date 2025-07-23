import { _logMessage, debug, error, info, log, warn } from '@helpers/logging';
import { color } from 'console-log-colors';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Angular's formatDate
vi.mock('@angular/common', () => ({
  formatDate: () => '2025-07-22 12:00:00',
}));

describe('Logging Functions', () => {
  const originalConsole = { ...console };
  const mockConsole = {
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Replace console methods with mocks
    Object.assign(console, mockConsole);
  });

  afterEach(() => {
    // Restore original console methods
    Object.assign(console, originalConsole);
  });

  describe('_logMessage', () => {
    it('should format message with correct color and timestamp', () => {
      _logMessage('info', 'Test', 'message');

      expect(mockConsole.info).toHaveBeenCalledWith(
        color.blue('[2025-07-22 12:00:00] {Test}'),
        'message',
      );
    });

    it('should handle multiple data arguments', () => {
      _logMessage('debug', 'Test', 'message1', 'message2', { test: true });

      expect(mockConsole.debug).toHaveBeenCalledWith(
        color.gray('[2025-07-22 12:00:00] {Test}'),
        'message1',
        'message2',
        { test: true },
      );
    });
  });

  describe('log', () => {
    it('should call console.log with magenta color', () => {
      log('Test', 'message');

      expect(mockConsole.log).toHaveBeenCalledWith(
        color.magenta('[2025-07-22 12:00:00] {Test}'),
        'message',
      );
    });
  });

  describe('info', () => {
    it('should call console.info with blue color', () => {
      info('Test', 'message');

      expect(mockConsole.info).toHaveBeenCalledWith(
        color.blue('[2025-07-22 12:00:00] {Test}'),
        'message',
      );
    });
  });

  describe('warn', () => {
    it('should call console.warn with yellow color', () => {
      warn('Test', 'message');

      expect(mockConsole.warn).toHaveBeenCalledWith(
        color.yellow('[2025-07-22 12:00:00] {Test}'),
        'message',
      );
    });
  });

  describe('debug', () => {
    it('should call console.debug with gray color', () => {
      debug('Test', 'message');

      expect(mockConsole.debug).toHaveBeenCalledWith(
        color.gray('[2025-07-22 12:00:00] {Test}'),
        'message',
      );
    });
  });

  describe('error', () => {
    it('should call console.error with red color', () => {
      error('Test', 'message');

      expect(mockConsole.error).toHaveBeenCalledWith(
        color.red('[2025-07-22 12:00:00] {Test}'),
        'message',
      );
    });
  });
});
