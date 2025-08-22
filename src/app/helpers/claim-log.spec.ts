import { beforeEach, describe, expect, it, vi } from 'vitest';

import { rngUuid } from '@helpers/rng';
import {
  beginClaimLogCommits,
  claimFormatMessage,
  claimLog,
  claimLogReset,
  claimMessageLog,
  endClaimLogCommits,
} from './claim-log';

vi.mock('@helpers/rng', () => ({
  rngUuid: vi.fn(() => 'mock-uuid-123'),
}));

describe('Claim Log', () => {
  const mockWorldLocation = {
    x: 1,
    y: 2,
    name: 'Test Location',
    nodeType: 'Cave' as const,
  };

  beforeEach(() => {
    claimLogReset();
    vi.clearAllMocks();
    // Mock Date.now to return a consistent timestamp
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  describe('claimFormatMessage', () => {
    it('should format message with template and props', () => {
      const template = 'Hello {{name}}!';
      const props = { name: 'World' };

      const result = claimFormatMessage(template, props);

      expect(result).toBe('Hello World!');
    });
  });

  describe('claimMessageLog', () => {
    it('should not log if node has no nodeType', () => {
      const nodeWithoutType = { ...mockWorldLocation, nodeType: undefined };

      beginClaimLogCommits();
      claimMessageLog(nodeWithoutType as any, 'Test message');
      endClaimLogCommits();

      expect(rngUuid).not.toHaveBeenCalled();
      expect(claimLog.update).not.toHaveBeenCalled();
    });

    it('should add message to pending logs but not commit immediately', () => {
      const message = 'Test claim message';

      // Start collecting messages
      beginClaimLogCommits();
      claimMessageLog(mockWorldLocation, message);

      // At this point, the signal should not have been updated
      expect(claimLog.update).not.toHaveBeenCalled();
      expect(rngUuid).toHaveBeenCalled();
    });

    it('should commit pending messages when endClaimLogCommits is called', () => {
      const message = 'Test claim message';

      beginClaimLogCommits();
      claimMessageLog(mockWorldLocation, message);
      endClaimLogCommits();

      expect(rngUuid).toHaveBeenCalled();
      expect(claimLog.update).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle multiple messages in a single commit cycle', () => {
      const message1 = 'First message';
      const message2 = 'Second message';

      beginClaimLogCommits();
      claimMessageLog(mockWorldLocation, message1);
      claimMessageLog(mockWorldLocation, message2);
      endClaimLogCommits();

      expect(rngUuid).toHaveBeenCalledTimes(2);
      expect(claimLog.update).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should limit log entries to 500 items', () => {
      const message = 'Test message';

      // Set up the signal to have 499 existing logs initially
      const existingLogs = Array.from({ length: 499 }, (_, i) => ({
        locationId: 'existing-id',
        messageId: `existing-${i}`,
        timestamp: 1000 + i,
        message: `Old message ${i}`,
        locationType: 'Cave' as const,
        locationName: 'Old Location',
      }));

      // Mock the signal to return existing logs and capture the final result
      let finalResult: any[] = [];
      vi.mocked(claimLog.update).mockImplementation((updater) => {
        const result = updater(existingLogs);
        finalResult = result;
        return result;
      });

      beginClaimLogCommits();
      claimMessageLog(mockWorldLocation, message);
      endClaimLogCommits();

      // Should have exactly 500 logs (new one + 499 existing)
      expect(finalResult).toHaveLength(500);
      expect(finalResult[0].messageId).toBe('mock-uuid-123'); // New log should be first
    });
  });

  describe('claimLogReset', () => {
    it('should reset both the signal and pending messages', () => {
      beginClaimLogCommits();
      claimMessageLog(mockWorldLocation, 'Test message');

      claimLogReset();

      expect(claimLog.set).toHaveBeenCalledWith([]);
      
      // After reset, ending commits should not add any messages
      endClaimLogCommits();
      expect(claimLog.update).not.toHaveBeenCalled();
    });
  });

  describe('commit cycle behavior', () => {
    it('should clear pending messages after each commit cycle', () => {
      beginClaimLogCommits();
      claimMessageLog(mockWorldLocation, 'First message');
      endClaimLogCommits();

      // Start a new cycle - should not include previous messages
      beginClaimLogCommits();
      claimMessageLog(mockWorldLocation, 'Second message');
      endClaimLogCommits();

      // Should only call update for each cycle separately
      expect(claimLog.update).toHaveBeenCalledTimes(2);
    });
  });
});