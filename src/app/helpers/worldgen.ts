import * as Compass from 'cardinal-direction';
import { PRNG } from 'seedrandom';

import { clamp } from 'lodash';
import {
  DroppableEquippable,
  GameElement,
  GameId,
  GameStateWorld,
  Guardian,
  GuardianData,
  LocationType,
  WorldConfig,
  WorldLocation,
  WorldPosition,
} from '../interfaces';
import { getEntriesByType, getEntry } from './content';
import {
  allItemDefinitions,
  pickRandomItemDefinition,
} from './creator-equipment';
import {
  allSkillDefinitions,
  pickRandomSkillDefinition,
} from './creator-skill';
import { createGuardianForLocation } from './guardian';
import {
  gamerng,
  randomChoice,
  randomIdentifiableChoice,
  randomNumber,
  randomNumberRange,
  seededrng,
  uuid,
} from './rng';
import { getSpriteFromNodeType, indexToSprite } from './sprite';
import { blankNodeCountBlock, gamestate, updateGamestate } from './state-game';
import { distanceBetweenNodes } from './travel';
import { blankWorldNode } from './world';

function fillEmptySpaceWithEmptyNodes(
  config: WorldConfig,
  nodes: Record<string, WorldLocation>,
): void {
  for (let x = 0; x < config.width; x++) {
    for (let y = 0; y < config.height; y++) {
      if (nodes[`${x},${y}`]) continue;

      nodes[`${x},${y}`] = {
        ...blankWorldNode(x, y),
      };
    }
  }
}

function getAngleBetweenPoints(
  center: WorldPosition,
  check: WorldPosition,
): number {
  function rad2deg(radians: number) {
    return (radians * 180) / Math.PI;
  }

  let angle = rad2deg(Math.atan2(check.y - center.y, check.x - center.x));
  if (angle < 0) {
    angle += 360;
  }

  return angle;
}

function getElementsForCardinalDirection(
  dir: Compass.CardinalDirection,
): Array<{ element: GameElement; multiplier: number }> {
  const FULL = 1;
  const MAJOR = 0.5;
  const SPLIT = 0.3;
  const MINOR = 0.2;

  switch (dir) {
    case Compass.CardinalDirection.N:
      return [{ element: 'Fire', multiplier: FULL }];

    case Compass.CardinalDirection.NNE:
      return [
        { element: 'Fire', multiplier: MAJOR },
        { element: 'Air', multiplier: MINOR },
      ];
    case Compass.CardinalDirection.NE:
      return [
        { element: 'Fire', multiplier: SPLIT },
        { element: 'Air', multiplier: SPLIT },
      ];
    case Compass.CardinalDirection.ENE:
      return [
        { element: 'Air', multiplier: MAJOR },
        { element: 'Fire', multiplier: MINOR },
      ];

    case Compass.CardinalDirection.E:
      return [{ element: 'Air', multiplier: FULL }];

    case Compass.CardinalDirection.ESE:
      return [
        { element: 'Air', multiplier: MAJOR },
        { element: 'Water', multiplier: MINOR },
      ];
    case Compass.CardinalDirection.SE:
      return [
        { element: 'Air', multiplier: SPLIT },
        { element: 'Water', multiplier: SPLIT },
      ];
    case Compass.CardinalDirection.SSE:
      return [
        { element: 'Water', multiplier: MAJOR },
        { element: 'Air', multiplier: MINOR },
      ];

    case Compass.CardinalDirection.S:
      return [{ element: 'Water', multiplier: FULL }];

    case Compass.CardinalDirection.SSW:
      return [
        { element: 'Water', multiplier: MAJOR },
        { element: 'Earth', multiplier: MINOR },
      ];
    case Compass.CardinalDirection.SW:
      return [
        { element: 'Water', multiplier: SPLIT },
        { element: 'Earth', multiplier: SPLIT },
      ];
    case Compass.CardinalDirection.WSW:
      return [
        { element: 'Earth', multiplier: MAJOR },
        { element: 'Water', multiplier: MINOR },
      ];

    case Compass.CardinalDirection.W:
      return [{ element: 'Earth', multiplier: FULL }];

    case Compass.CardinalDirection.WNW:
      return [
        { element: 'Earth', multiplier: MAJOR },
        { element: 'Fire', multiplier: MINOR },
      ];
    case Compass.CardinalDirection.NW:
      return [
        { element: 'Earth', multiplier: SPLIT },
        { element: 'Fire', multiplier: SPLIT },
      ];
    case Compass.CardinalDirection.NNW:
      return [
        { element: 'Fire', multiplier: MAJOR },
        { element: 'Earth', multiplier: MINOR },
      ];

    default:
      return [
        { element: 'Fire', multiplier: MINOR },
        { element: 'Air', multiplier: MINOR },
        { element: 'Water', multiplier: MINOR },
        { element: 'Earth', multiplier: MINOR },
      ];
  }
}

function addElementsToWorld(
  config: WorldConfig,
  nodes: Record<string, WorldLocation>,
): void {
  const centerPosition: WorldPosition = {
    x: Math.floor(config.width / 2),
    y: Math.floor(config.height / 2),
  };

  const maxDistance = distanceBetweenNodes(
    { x: centerPosition.x, y: 0 },
    centerPosition,
  );

  Object.values(nodes).forEach((node) => {
    const cardinality = Compass.cardinalFromDegree(
      getAngleBetweenPoints(centerPosition, node),
      Compass.CardinalSubset.Intercardinal,
    );

    // sometimes we lie to typescript because other people have bad typings
    const elements = getElementsForCardinalDirection(
      Compass.CardinalDirection[
        cardinality as unknown as number
      ] as unknown as Compass.CardinalDirection,
    );

    const distance = distanceBetweenNodes(centerPosition, node);
    const intensity = Math.floor((distance / maxDistance) * 100);

    node.elements = elements
      .map((e) => ({
        element: e.element,
        intensity: clamp(Math.floor(e.multiplier * intensity), 0, 100),
      }))
      .filter((e) => e.intensity !== 0);
  });
}

function setEncounterLevels(
  config: WorldConfig,
  nodes: Record<string, WorldLocation>,
  middleNode: WorldLocation,
): void {
  const centerPosition: WorldPosition = {
    x: Math.floor(config.width / 2),
    y: Math.floor(config.height / 2),
  };

  const { maxLevel } = config;
  const maxDistance = distanceBetweenNodes(
    { x: centerPosition.x, y: 0 },
    middleNode,
  );

  Object.values(nodes).forEach((node) => {
    const dist = distanceBetweenNodes(node, middleNode);
    node.encounterLevel = Math.floor((dist / maxDistance) * maxLevel);
  });
}

function determineSpritesForWorld(
  nodes: Record<string, WorldLocation>,
  sprites: Record<string, string>,
  rng: PRNG,
): void {
  const elementStartSprites: Record<GameElement, number> = {
    Air: 16,
    Earth: 0,
    Fire: 24,
    Water: 12,
  };

  Object.values(nodes).forEach((node) => {
    const dominantElement = node.elements[0]?.element ?? 'Air';

    node.sprite = indexToSprite(
      elementStartSprites[dominantElement] + randomNumber(4, rng),
    );

    node.objectSprite = getSpriteFromNodeType(node.nodeType);
  });
}

function fillSpacesWithGuardians(nodes: Record<string, WorldLocation>): void {
  Object.values(nodes).forEach((node) => {
    populateLocationWithGuardians(node);
  });
}

function fillSpacesWithLoot(nodes: Record<string, WorldLocation>): void {
  Object.values(nodes).forEach((node) => {
    populateLocationWithLoot(node);
  });
}

export function setWorldSeed(seed: string | null): void {
  if (!seed) return;

  updateGamestate((state) => {
    state.gameId = seed as GameId;
    return state;
  });
}

export function generateWorld(config: WorldConfig): GameStateWorld {
  const rng = gamerng();

  const nodeSprites: Record<string, string> = {};
  const nodes: Record<string, WorldLocation> = {};
  const nodeList: WorldLocation[] = [];
  const nodePositionsAvailable: Record<
    string,
    { x: number; y: number; taken: boolean }
  > = {};

  for (let x = 0; x < config.width; x++) {
    for (let y = 0; y < config.height; y++) {
      nodePositionsAvailable[`${x},${y}`] = { x, y, taken: false };
    }
  }

  const findUnusedPosition: () => { x: number; y: number } = () => {
    const freeNodes = Object.values(nodePositionsAvailable).filter(
      (n) => !n.taken,
    );
    if (freeNodes.length === 0) return { x: -1, y: -1 };

    const chosenNode = randomChoice<{ x: number; y: number }>(freeNodes, rng);
    return { x: chosenNode.x, y: chosenNode.y };
  };

  const addNode = (node: WorldLocation): void => {
    nodeList.push(node);
    nodes[`${node.x},${node.y}`] = node;
    nodePositionsAvailable[`${node.x},${node.y}`].taken = true;
  };

  const firstTown: WorldLocation = {
    ...blankWorldNode(),
    id: uuid(),
    x: Math.floor(config.width / 2),
    y: Math.floor(config.height / 2),
    nodeType: 'town',
    name: 'LaFlotte',
    currentlyClaimed: true,
  };

  addNode(firstTown);

  const counts: Record<LocationType, number> = blankNodeCountBlock();
  counts.town++;

  Object.keys(config.nodeCount).forEach((key) => {
    const count = config.nodeCount[key as LocationType];
    const nodeCount = randomNumberRange(count.min, count.max, rng);

    for (let i = 0; i < nodeCount; i++) {
      const { x, y } = findUnusedPosition();
      const node: WorldLocation = {
        ...blankWorldNode(),
        id: uuid(),
        x,
        y,
        nodeType: key as LocationType,
        name: `${key} ${i + 1}`,
      };

      counts[key as LocationType]++;

      addNode(node);
    }
  });

  fillEmptySpaceWithEmptyNodes(config, nodes);
  setEncounterLevels(config, nodes, firstTown);
  addElementsToWorld(config, nodes);
  fillSpacesWithGuardians(nodes);
  fillSpacesWithLoot(nodes);
  determineSpritesForWorld(nodes, nodeSprites, rng);

  return {
    width: config.width,
    height: config.height,
    nodes,
    homeBase: {
      x: firstTown.x,
      y: firstTown.y,
    },
    nodeCounts: counts,
    claimedCounts: blankNodeCountBlock(),
  };
}

export function populateLocationWithLoot(location: WorldLocation): void {
  if (location.currentlyClaimed) return;

  location.claimLootIds = getLootForLocation(location).map((i) => i.id);
}

export function getLootForLocation(
  location: WorldLocation,
): DroppableEquippable[] {
  const allValidItemDefinitions = allItemDefinitions().filter(
    (d) => d.dropLevel <= location.encounterLevel,
  );

  const allValidSkillDefinitions = allSkillDefinitions().filter(
    (d) => d.dropLevel <= location.encounterLevel,
  );

  const rng = seededrng(
    `$${gamestate().gameId}-${location.id}-${location.claimCount}`,
  );
  const numLoot = numLootForLocation(location);
  return Array.from({ length: numLoot }, () => {
    return randomChoice(
      [
        pickRandomItemDefinition(allValidItemDefinitions, rng),
        pickRandomSkillDefinition(allValidSkillDefinitions, rng),
      ],
      rng,
    );
  }).filter(Boolean);
}

export function numLootForLocation(location: WorldLocation): number {
  switch (location.nodeType) {
    case 'castle':
      return 5;
    case 'town':
      return 4;
    case 'dungeon':
      return 3;
    case 'village':
      return 2;
    case 'cave':
      return 1;
    default:
      return 0;
  }
}

export function populateLocationWithGuardians(location: WorldLocation): void {
  if (location.currentlyClaimed) return;

  location.guardianIds = getGuardiansForLocation(location).map((i) => i.id);
}

export function getGuardiansForLocation(location: WorldLocation): Guardian[] {
  const rng = seededrng(
    `$${gamestate().gameId}-${location.id}-${location.claimCount}`,
  );
  const numGuardians = numGuardiansForLocation(location);
  const guardians = Array.from({ length: numGuardians }, () => {
    const randomGuardianDataId = randomIdentifiableChoice<GuardianData>(
      getEntriesByType<GuardianData>('guardian'),
      rng,
    );
    const randomGuardianData = getEntry<GuardianData>(randomGuardianDataId);
    if (!randomGuardianData) return undefined;

    return createGuardianForLocation(location, randomGuardianData);
  }).filter(Boolean) as Guardian[];

  return guardians;
}

export function numGuardiansForLocation(location: WorldLocation): number {
  switch (location.nodeType) {
    case 'castle':
      return 10;
    case 'town':
      return 7;
    case 'dungeon':
      return 5;
    case 'village':
      return 3;
    case 'cave':
      return 1;
    default:
      return 0;
  }
}
