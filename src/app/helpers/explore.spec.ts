import { travelHome } from '@helpers/explore';
import type { WorldLocation } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn(),
}));

vi.mock('@helpers/travel', () => ({
  travelToNode: vi.fn(),
}));

vi.mock('@helpers/world', () => ({
  getNearestTown: vi.fn(),
}));

vi.mock('@helpers/ui', () => ({
  globalStatusText: {
    set: vi.fn(),
  },
}));

vi.mock('@helpers/combat-end', () => ({
  currentCombatHasGuardiansAlive: vi.fn(),
}));

import { gamestate } from '@helpers/state-game';
import { travelToNode } from '@helpers/travel';
import { getNearestTown } from '@helpers/world';

describe('Explore Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('travelHome', () => {
    it('should travel to the nearest town when one exists', () => {
      const heroPosition = { x: 5, y: 5 };
      const nearestTown: WorldLocation = {
        id: 'town-1',
        name: 'Nearest Town',
        x: 3,
        y: 4,
        nodeType: 'town',
        traitIds: [],
      } as WorldLocation;

      vi.mocked(gamestate).mockReturnValue({
        hero: { position: heroPosition },
      } as ReturnType<typeof gamestate>);

      vi.mocked(getNearestTown).mockReturnValue(nearestTown);

      travelHome();

      expect(getNearestTown).toHaveBeenCalledWith(heroPosition);
      expect(travelToNode).toHaveBeenCalledWith(nearestTown);
    });

    it('should log an error when no towns are found', () => {
      const heroPosition = { x: 5, y: 5 };

      vi.mocked(gamestate).mockReturnValue({
        hero: { position: heroPosition },
      } as ReturnType<typeof gamestate>);

      vi.mocked(getNearestTown).mockReturnValue(undefined);

      travelHome();

      expect(getNearestTown).toHaveBeenCalledWith(heroPosition);
      expect(travelToNode).not.toHaveBeenCalled();
    });
  });
});
