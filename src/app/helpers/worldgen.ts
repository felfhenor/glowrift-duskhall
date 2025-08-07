import * as Compass from 'cardinal-direction';

import type { Signal } from '@angular/core';
import { signal } from '@angular/core';
import { getEntriesByType, getEntry } from '@helpers/content';
import {
  allItemDefinitions,
  pickRandomItemDefinitionBasedOnRarity,
} from '@helpers/creator-equipment';
import {
  allSkillDefinitions,
  pickRandomSkillDefinitionBasedOnRarity,
} from '@helpers/creator-skill';
import {
  getDefaultNodeCountBlock,
  getDefaultWorldNode,
} from '@helpers/defaults';
import { createGuardianForLocation } from '@helpers/guardian';
import { Quadtree, type QuadtreePoint } from '@helpers/quadtree';
import {
  gamerng,
  randomChoice,
  randomChoiceByRarity,
  randomIdentifiableChoice,
  randomNumberRange,
  seededrng,
  succeedsChance,
  uuid,
} from '@helpers/rng';
import { gamestate } from '@helpers/state-game';
import {
  locationTraitEncounterLevelModifier,
  locationTraitGuardianCountModifier,
  locationTraitLootCountModifier,
} from '@helpers/trait-location-worldgen';
import { distanceBetweenNodes } from '@helpers/travel';
import type { TraitLocationContent } from '@interfaces';
import {
  type DroppableEquippable,
  type GameElement,
  type GameStateWorld,
  type Guardian,
  type GuardianContent,
  type LocationType,
  type WorldConfigContent,
  type WorldLocation,
  type WorldPosition,
} from '@interfaces';
import { clamp } from 'es-toolkit/compat';
import { from, lastValueFrom, Subject, takeUntil, timer, zip } from 'rxjs';
import type { PRNG } from 'seedrandom';

type WorldGenNode = {
  node: WorldLocation;
  nodeCount: number;
  nodeNum: number;
  worldGenDisplayType: string;
  minDist: number;
  maxDist: number;
  isLast: boolean;
};

const _currentWorldGenStatus = signal<string>('');
export const currentWorldGenStatus: Signal<string> =
  _currentWorldGenStatus.asReadonly();

const cancelWorldGen = new Subject<void>();

export function cancelWorldGeneration(): void {
  cancelWorldGen.next();
}

function setWorldGenStatus(status: string): void {
  _currentWorldGenStatus.set(status);
}

function fillEmptySpaceWithEmptyNodes(
  config: WorldConfigContent,
  nodes: Record<string, WorldLocation>,
): void {
  for (let x = 0; x < config.width; x++) {
    for (let y = 0; y < config.height; y++) {
      if (nodes[`${x},${y}`]) continue;

      nodes[`${x},${y}`] = {
        ...getDefaultWorldNode(x, y),
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

function addTraitsToLocations(nodes: Record<string, WorldLocation>, rng: PRNG) {
  Object.values(nodes).forEach((node) => {
    if (!node.nodeType) return;

    if (!succeedsChance(30)) return;

    const traits = getEntriesByType<TraitLocationContent>('traitlocation');
    const chosenTrait = randomChoiceByRarity(traits, rng);
    if (chosenTrait) {
      node.traitIds = [chosenTrait.id];
    }
  });
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
    if (node.elements.length > 0) return;

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
        intensity: clamp(Math.floor(e.multiplier * intensity), 1, 100),
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
    node.encounterLevel = Math.max(
      1,
      Math.floor((dist / maxDistance) * maxLevel) +
        locationTraitEncounterLevelModifier(node),
    );
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

function addCornerNodes(
  config: WorldConfigContent,
  nodes: Record<string, WorldLocation>,
  rng: PRNG,
  counts: Record<LocationType, number>,
): void {
  // Define corner areas - within 10% of each corner
  const cornerMargin = Math.floor(Math.min(config.width, config.height) * 0.1);
  
  const corners = [
    { x: 0, y: 0, maxX: cornerMargin, maxY: cornerMargin }, // top-left
    { x: config.width - cornerMargin, y: 0, maxX: config.width, maxY: cornerMargin }, // top-right
    { x: 0, y: config.height - cornerMargin, maxX: cornerMargin, maxY: config.height }, // bottom-left
    { x: config.width - cornerMargin, y: config.height - cornerMargin, maxX: config.width, maxY: config.height }, // bottom-right
  ];

  corners.forEach((corner, cornerIndex) => {
    // Count existing nodes in this corner
    let existingNodesInCorner = 0;
    let emptyPositions: Array<{x: number, y: number}> = [];
    
    for (let x = corner.x; x < corner.maxX; x++) {
      for (let y = corner.y; y < corner.maxY; y++) {
        const nodeKey = `${x},${y}`;
        if (nodes[nodeKey]?.nodeType) {
          existingNodesInCorner++;
        } else {
          emptyPositions.push({x, y});
        }
      }
    }
    
    // Calculate how many nodes this corner should have
    // Aim for about 1-2 nodes per corner area, more for larger corners
    const cornerArea = (corner.maxX - corner.x) * (corner.maxY - corner.y);
    const targetNodesInCorner = Math.max(1, Math.floor(cornerArea / 20)); // 1 node per ~20 tiles
    
    // Add nodes if corner is underutilized
    const nodesToAdd = Math.max(0, targetNodesInCorner - existingNodesInCorner);
    
    if (nodesToAdd > 0 && emptyPositions.length > 0) {
      for (let i = 0; i < Math.min(nodesToAdd, emptyPositions.length); i++) {
        // Randomly choose node type (prefer caves and dungeons for corners)
        const nodeTypes: LocationType[] = ['cave', 'cave', 'dungeon', 'castle']; // Higher chance for caves
        const nodeType = randomChoice(nodeTypes, rng);
        
        // Pick random empty position in this corner
        const positionIndex = randomNumberRange(0, emptyPositions.length - 1, rng);
        const position = emptyPositions.splice(positionIndex, 1)[0];
        
        // Create the node
        const cornerNode: WorldLocation = {
          ...getDefaultWorldNode(),
          id: uuid(),
          x: position.x,
          y: position.y,
          nodeType,
          name: `${nodeType} (corner ${cornerIndex + 1}-${i + 1})`,
        };
        
        // Add to nodes and update counts
        nodes[`${position.x},${position.y}`] = cornerNode;
        counts[nodeType]++;
      }
    }
  });
}

function cleanUpEmptyNodes(nodes: Record<string, WorldLocation>): void {
  Object.keys(nodes).forEach((nodePos) => {
    if (!nodes[nodePos].nodeType) {
      delete nodes[nodePos];
    }
  });
}

export async function generateWorld(
  config: WorldConfigContent,
): Promise<GameStateWorld & { didFinish?: boolean }> {
  setWorldGenStatus('Initializing world generation...');

  const rng = gamerng();

  const nodes: Record<string, WorldLocation> = {};
  const nodeList: WorldLocation[] = [];
  const nodePositionsAvailable: Record<
    string,
    { x: number; y: number; taken: boolean }
  > = {};

  // Initialize quadtree for efficient spatial queries
  const positionQuadtree = new Quadtree({
    x: 0,
    y: 0,
    width: config.width,
    height: config.height,
  });

  const centerPosition: WorldPosition = {
    x: Math.floor(config.width / 2),
    y: Math.floor(config.height / 2),
  };

  const firstTown: WorldLocation = {
    ...getDefaultWorldNode(),
    id: uuid(),
    x: Math.floor(config.width / 2),
    y: Math.floor(config.height / 2),
    nodeType: 'town',
    name: 'LaFlotte',
    currentlyClaimed: true,
    elements: [
      { element: 'Air', intensity: 1 },
      { element: 'Fire', intensity: 1 },
      { element: 'Earth', intensity: 1 },
      { element: 'Water', intensity: 1 },
    ],
  };

  const maxDistance = distanceBetweenNodes(
    { x: centerPosition.x, y: 0 },
    firstTown,
  );

  const minDistancesForLocationNode: Record<LocationType, number> = {
    cave: 0,
    town: maxDistance * 0.15, // Reduced from 0.5 to allow towns closer to center
    village: maxDistance * 0.25, // Reduced from 0.75 to spread villages more
    dungeon: maxDistance * 0.1, // Reduced from 0.3 for better spread
    castle: maxDistance * 0.2, // Reduced from 0.7 to avoid edge clustering
  };

  const findUnusedPosition: (
    distMin: number,
    distMax: number,
  ) => {
    x: number;
    y: number;
  } = (distMin: number, distMax: number) => {
    // Query a large area that could contain positions within our distance range
    // We use a conservative bounds that covers the maximum possible area
    const queryX = Math.max(0, firstTown.x - distMax);
    const queryY = Math.max(0, firstTown.y - distMax);
    const queryBounds = {
      x: queryX,
      y: queryY,
      width: Math.min(config.width - queryX, 2 * distMax + 1),
      height: Math.min(config.height - queryY, 2 * distMax + 1),
    };

    const candidates = positionQuadtree.retrieve(queryBounds);
    const freeNodes = candidates.filter((n) => {
      const dist = distanceBetweenNodes(n, firstTown);
      if (dist < distMin || dist > distMax) return false;
      if (n.taken) return false;
      return true;
    });

    if (freeNodes.length === 0) return { x: -1, y: -1 };

    const chosenNode = randomChoice<QuadtreePoint>(freeNodes, rng);
    return { x: chosenNode.x, y: chosenNode.y };
  };

  const addNode = (node: WorldLocation): void => {
    nodeList.push(node);
    nodes[`${node.x},${node.y}`] = node;
    nodePositionsAvailable[`${node.x},${node.y}`].taken = true;
    positionQuadtree.updatePoint(node.x, node.y, true);
  };

  setWorldGenStatus('Generating world...');
  const counts: Record<LocationType, number> = getDefaultNodeCountBlock();
  counts.town++;

  const minCavesNearStart = [
    { minDist: 0, maxDist: 1, minNodes: 2, maxNodes: 4 },
    { minDist: 1, maxDist: 2, minNodes: 3, maxNodes: 4 },
    { minDist: 2, maxDist: 3, minNodes: 4, maxNodes: 5 },
    { minDist: 4, maxDist: 7, minNodes: 10, maxNodes: 20 },
  ];

  for (let x = 0; x < config.width; x++) {
    for (let y = 0; y < config.height; y++) {
      const position = { x, y, taken: false };
      nodePositionsAvailable[`${x},${y}`] = position;
      positionQuadtree.insert(position);
    }
  }

  setWorldGenStatus('Generating LaFlotte...');
  addNode(firstTown);

  let didWorldGenFinish = false;

  const nodesToAdd: WorldGenNode[] = [];

  // set up starter caves
  const starterCaves: WorldGenNode[] = minCavesNearStart.flatMap(
    (caveConfig) => {
      const nodeCount = randomNumberRange(
        caveConfig.minNodes,
        caveConfig.maxNodes,
        rng,
      );

      return Array(nodeCount)
        .fill(undefined)
        .map((_, i) => {
          const node: WorldLocation = {
            ...getDefaultWorldNode(),
            id: uuid(),
            x: -1,
            y: -1,
            nodeType: 'cave',
            name: `starter cave ${caveConfig.minDist}-${i + 1}`,
          };

          return {
            node,
            nodeCount,
            nodeNum: i,
            worldGenDisplayType: `starter cave (range ${caveConfig.minDist})`,
            minDist: caveConfig.minDist,
            maxDist: caveConfig.maxDist,
            isLast: false,
          };
        });
    },
  );

  counts.cave += starterCaves.length;

  // set up non-starter nodes
  const chosenConfigs = Object.keys(config.nodeCount).map((key) => {
    const count = config.nodeCount[key as LocationType];
    const nodeCount = randomNumberRange(count.min, count.max, rng);

    return { nodeType: key as LocationType, nodeCount };
  });

  chosenConfigs.forEach(({ nodeType, nodeCount }) => {
    counts[nodeType] += nodeCount;
  });

  const nonStarterNodes: WorldGenNode[] = chosenConfigs.flatMap(
    ({ nodeType, nodeCount }) => {
      return Array(nodeCount)
        .fill(nodeType)
        .map((nodeType, i) => {
          const node: WorldLocation = {
            ...getDefaultWorldNode(),
            id: uuid(),
            x: -1,
            y: -1,
            nodeType,
            name: `${nodeType} ${i + 1}`,
          };

          return {
            node,
            nodeCount,
            nodeNum: i,
            worldGenDisplayType: nodeType,
            minDist: minDistancesForLocationNode[node.nodeType!] * randomNumberRange(0.5, 1.5, rng),
            maxDist: maxDistance,
            isLast: false,
          };
        });
    },
  );

  nodesToAdd.push(...starterCaves);
  nodesToAdd.push(...nonStarterNodes);
  nodesToAdd.at(-1)!.isLast = true;

  const worldGen$ = zip(
    from(nodesToAdd),
    timer(0, 5).pipe(takeUntil(cancelWorldGen)),
  );

  worldGen$.subscribe(([nodeData]) => {
    const {
      node,
      nodeCount,
      worldGenDisplayType: nodeType,
      nodeNum,
      minDist,
      maxDist,
    } = nodeData;
    const { x, y } = findUnusedPosition(minDist, maxDist);

    node.x = x;
    node.y = y;

    if (node.x === -1 || node.y === -1) return;

    setWorldGenStatus(`Generating ${nodeType} ${nodeNum + 1}/${nodeCount}...`);

    addNode(node);
  });

  const [node] = await lastValueFrom(worldGen$);
  if (node.isLast) {
    setWorldGenStatus(`Filling empty space...`);
    fillEmptySpaceWithEmptyNodes(config, nodes);

    setWorldGenStatus('Adding corner nodes...');
    addCornerNodes(config, nodes, rng, counts);

    setWorldGenStatus('Adding spice to the world...');
    addTraitsToLocations(nodes, rng);

    setWorldGenStatus(`Setting encounter levels...`);
    setEncounterLevels(config, nodes, firstTown);

    setWorldGenStatus(`Giving elements to the world...`);
    addElementsToWorld(config, nodes);

    setWorldGenStatus(`Giving darkness to the world...`);
    fillSpacesWithGuardians(nodes);

    setWorldGenStatus(`Giving treasure to the world...`);
    fillSpacesWithLoot(nodes);

    setWorldGenStatus(`Finalizing the world...`);
    cleanUpEmptyNodes(nodes);

    didWorldGenFinish = true;
  }

  return {
    didFinish: didWorldGenFinish,
    config,
    nodes,
    homeBase: {
      x: firstTown.x,
      y: firstTown.y,
    },
    nodeCounts: counts,
    claimedCounts: getDefaultNodeCountBlock(),
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

  const modifier = locationTraitLootCountModifier(location);
  return Math.max(0, modifier + (nodeTypes[location.nodeType ?? 'cave'] ?? 0));
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

  const modifier = locationTraitGuardianCountModifier(location);

  return Math.max(0, modifier + (nodeTypes[location.nodeType ?? 'cave'] ?? 0));
}
