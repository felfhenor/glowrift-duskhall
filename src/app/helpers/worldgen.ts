import * as Compass from 'cardinal-direction';

import { getEntriesByType, getEntry } from '@helpers/content';
import {
  allItemDefinitions,
  pickRandomItemDefinitionBasedOnRarity,
} from '@helpers/creator-equipment';
import {
  allSkillDefinitions,
  pickRandomSkillDefinitionBasedOnRarity,
} from '@helpers/creator-skill';
import { defaultNodeCountBlock, defaultWorldNode } from '@helpers/defaults';
import { createGuardianForLocation } from '@helpers/guardian';
import {
  gamerng,
  randomChoice,
  randomIdentifiableChoice,
  randomNumberRange,
  seededrng,
  uuid,
} from '@helpers/rng';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { distanceBetweenNodes } from '@helpers/travel';
import type {
  DroppableEquippable,
  GameElement,
  GameId,
  GameStateWorld,
  Guardian,
  GuardianContent,
  LocationType,
  WorldConfigContent,
  WorldLocation,
  WorldPosition,
} from '@interfaces';
import { clamp } from 'es-toolkit/compat';

function fillEmptySpaceWithEmptyNodes(
  config: WorldConfigContent,
  nodes: Record<string, WorldLocation>,
): void {
  for (let x = 0; x < config.width; x++) {
    for (let y = 0; y < config.height; y++) {
      if (nodes[`${x},${y}`]) continue;

      nodes[`${x},${y}`] = {
        ...defaultWorldNode(x, y),
      };
    }
  }
}

export function getAngleBetweenPoints(
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

export function getElementsForCardinalDirection(
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
  config: WorldConfigContent,
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
  config: WorldConfigContent,
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
    if (!node.nodeType) return;

    const dist = distanceBetweenNodes(node, middleNode);
    node.encounterLevel = Math.floor((dist / maxDistance) * maxLevel);
  });
}

function fillSpacesWithGuardians(nodes: Record<string, WorldLocation>): void {
  Object.values(nodes).forEach((node) => {
    if (!node.nodeType) return;

    populateLocationWithGuardians(node);
  });
}

function fillSpacesWithLoot(nodes: Record<string, WorldLocation>): void {
  Object.values(nodes).forEach((node) => {
    if (!node.nodeType) return;

    populateLocationWithLoot(node);
  });
}

function cleanUpEmptyNodes(nodes: Record<string, WorldLocation>): void {
  Object.keys(nodes).forEach((nodePos) => {
    if (!nodes[nodePos].nodeType) {
      delete nodes[nodePos];
    }
  });
}

export function setWorldSeed(seed: string | null): void {
  if (!seed) return;

  updateGamestate((state) => {
    state.gameId = seed as GameId;
    return state;
  });
}

export function generateWorld(config: WorldConfigContent): GameStateWorld {
  const rng = gamerng();

  const nodes: Record<string, WorldLocation> = {};
  const nodeList: WorldLocation[] = [];
  const nodePositionsAvailable: Record<
    string,
    { x: number; y: number; taken: boolean }
  > = {};

  const centerPosition: WorldPosition = {
    x: Math.floor(config.width / 2),
    y: Math.floor(config.height / 2),
  };

  const firstTown: WorldLocation = {
    ...defaultWorldNode(),
    id: uuid(),
    x: Math.floor(config.width / 2),
    y: Math.floor(config.height / 2),
    nodeType: 'town',
    name: 'LaFlotte',
    currentlyClaimed: true,
  };

  const maxDistance = distanceBetweenNodes(
    { x: centerPosition.x, y: 0 },
    firstTown,
  );

  const minDistancesForLocationNode: Record<LocationType, number> = {
    cave: 0,
    town: maxDistance * 0.5,
    village: maxDistance * 0.75,
    dungeon: maxDistance * 0.3,
    castle: maxDistance * 0.7,
  };

  const findUnusedPosition: (
    distMin: number,
    distMax: number,
  ) => {
    x: number;
    y: number;
  } = (distMin: number, distMax: number) => {
    const freeNodes = Object.values(nodePositionsAvailable).filter((n) => {
      const dist = distanceBetweenNodes(n, firstTown);
      if (dist < distMin || dist > distMax) return false;
      if (n.taken) return false;
      return true;
    });
    if (freeNodes.length === 0) return { x: -1, y: -1 };

    const chosenNode = randomChoice<{ x: number; y: number }>(freeNodes, rng);
    return { x: chosenNode.x, y: chosenNode.y };
  };

  const addNode = (node: WorldLocation): void => {
    nodeList.push(node);
    nodes[`${node.x},${node.y}`] = node;
    nodePositionsAvailable[`${node.x},${node.y}`].taken = true;
  };

  const counts: Record<LocationType, number> = defaultNodeCountBlock();
  counts.town++;

  const minCavesNearStart = [
    { minDist: 0, maxDist: 1, minNodes: 2, maxNodes: 4 },
    { minDist: 1, maxDist: 2, minNodes: 3, maxNodes: 4 },
    { minDist: 2, maxDist: 3, minNodes: 4, maxNodes: 5 },
    { minDist: 4, maxDist: 7, minNodes: 10, maxNodes: 20 },
  ];

  for (let x = 0; x < config.width; x++) {
    for (let y = 0; y < config.height; y++) {
      nodePositionsAvailable[`${x},${y}`] = { x, y, taken: false };
    }
  }

  addNode(firstTown);

  minCavesNearStart.forEach((caveConfig) => {
    const nodeCount = randomNumberRange(
      caveConfig.minNodes,
      caveConfig.maxNodes,
      rng,
    );

    for (let i = 0; i < nodeCount; i++) {
      const { x, y } = findUnusedPosition(
        caveConfig.minDist,
        caveConfig.maxDist,
      );
      if (x === -1 || y === -1) continue;

      const node: WorldLocation = {
        ...defaultWorldNode(),
        id: uuid(),
        x,
        y,
        nodeType: 'cave',
        name: `starter cave ${caveConfig.minDist}-${i + 1}`,
      };

      counts.cave++;

      addNode(node);
    }
  });

  Object.keys(config.nodeCount).forEach((key) => {
    const count = config.nodeCount[key as LocationType];
    const nodeCount = randomNumberRange(count.min, count.max, rng);

    for (let i = 0; i < nodeCount; i++) {
      const { x, y } = findUnusedPosition(
        minDistancesForLocationNode[key as LocationType],
        maxDistance,
      );
      if (x === -1 || y === -1) continue;

      const node: WorldLocation = {
        ...defaultWorldNode(),
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
  cleanUpEmptyNodes(nodes);

  return {
    width: config.width,
    height: config.height,
    nodes,
    homeBase: {
      x: firstTown.x,
      y: firstTown.y,
    },
    nodeCounts: counts,
    claimedCounts: defaultNodeCountBlock(),
  };
}

function populateLocationWithLoot(location: WorldLocation): void {
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
        pickRandomItemDefinitionBasedOnRarity(allValidItemDefinitions, rng),
        pickRandomSkillDefinitionBasedOnRarity(allValidSkillDefinitions, rng),
      ],
      rng,
    );
  }).filter(Boolean);
}

function numLootForLocation(location: WorldLocation): number {
  const nodeTypes: Record<LocationType, number> = {
    castle: 5,
    town: 4,
    dungeon: 3,
    village: 2,
    cave: 1,
  };

  return nodeTypes[location.nodeType ?? 'cave'] ?? 0;
}

function populateLocationWithGuardians(location: WorldLocation): void {
  if (location.currentlyClaimed) return;

  location.guardianIds = getGuardiansForLocation(location).map((i) => i.id);
}

export function getGuardiansForLocation(location: WorldLocation): Guardian[] {
  const rng = seededrng(
    `$${gamestate().gameId}-${location.id}-${location.claimCount}`,
  );
  const numGuardians = numGuardiansForLocation(location);
  const guardians = Array.from({ length: numGuardians }, () => {
    const randomGuardianDataId = randomIdentifiableChoice<GuardianContent>(
      getEntriesByType<GuardianContent>('guardian'),
      rng,
    );
    const randomGuardianData = getEntry<GuardianContent>(randomGuardianDataId);
    if (!randomGuardianData) return undefined;

    return createGuardianForLocation(location, randomGuardianData);
  }).filter(Boolean) as Guardian[];

  return guardians;
}

function numGuardiansForLocation(location: WorldLocation): number {
  const nodeTypes: Record<LocationType, number> = {
    castle: 10,
    town: 7,
    dungeon: 5,
    village: 3,
    cave: 1,
  };

  return nodeTypes[location.nodeType ?? 'cave'] ?? 0;
}
