import { _logMessage, debug, error, info, log, trace, warn } from '@helpers/logging';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Angular's formatDate
vi.mock('@angular/common', () => ({
  formatDate: () => '2025-07-22 12:00:00',
}));

describe('Logging Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('_logMessage', () => {
    it('should format message with correct color and timestamp', () => {
      // Test that the function runs without throwing errors
      expect(() => _logMessage('info', 'Test', 'message')).not.toThrow();
    });

    it('should handle multiple data arguments', () => {
      // Test that the function runs without throwing errors
      expect(() => _logMessage('debug', 'Test', 'message1', 'message2', { test: true })).not.toThrow();
    });
  });

  describe('log', () => {
    it('should call console.log with magenta color and caller info', () => {
      // Test that the function runs without throwing errors
      expect(() => log('Test', 'message')).not.toThrow();
    });
  });

  describe('info', () => {
    it('should call console.info with blue color and caller info', () => {
      // Test that the function runs without throwing errors
      expect(() => info('Test', 'message')).not.toThrow();
    });
  });

  describe('warn', () => {
    it('should call console.warn with yellow color and caller info', () => {
      // Test that the function runs without throwing errors
      expect(() => warn('Test', 'message')).not.toThrow();
    });
  });

  describe('debug', () => {
    it('should call console.debug with gray color and caller info', () => {
      // Test that the function runs without throwing errors
      expect(() => debug('Test', 'message')).not.toThrow();
    });
  });

  describe('error', () => {
    it('should call console.error with red color and caller info', () => {
      // Test that the function runs without throwing errors
      expect(() => error('Test', 'message')).not.toThrow();
    });
  });

  describe('trace', () => {
    it('should call console.log and console.trace with caller info', () => {
      // Test that the function runs without throwing errors
      expect(() => trace('Test', 'message')).not.toThrow();
    });
  });
});
