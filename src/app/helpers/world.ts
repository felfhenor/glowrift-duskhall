import { distanceBetweenNodes } from '@helpers/math';
import { gamestate, updateGamestate } from '@helpers/state-game';
import type {
  GameId,
  GameStateWorld,
  WorldConfigContent,
  WorldPosition,
} from '@interfaces';

export function worldNodeGetAccessId(node: WorldPosition): string {
  return `${node.x},${node.y}`;
}

export function worldMaxDistance(): number {
  const state = gamestate();

  return distanceBetweenNodes(
    { x: Math.floor(state.world.config.width / 2), y: 0 },
    state.world.homeBase,
  );
}

export function setWorldSeed(seed: string | null): void {
  if (!seed) return;

  updateGamestate((state) => {
    state.gameId = seed as GameId;
    return state;
  });
}

export function setWorldConfig(config: WorldConfigContent): void {
  updateGamestate((state) => {
    state.world.config = config;
    return state;
  });
}

export function setWorld(world: GameStateWorld): void {
  updateGamestate((state) => {
    state.world = world;
    return state;
  });
}
