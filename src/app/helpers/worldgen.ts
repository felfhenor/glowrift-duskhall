import * as Compass from 'cardinal-direction';

import type { Signal } from '@angular/core';
import { signal } from '@angular/core';
import { getEntriesByType, getEntry } from '@helpers/content';
import {
  equipmentAllDefinitions,
  equipmentPickRandomDefinitionByRarity,
} from '@helpers/creator-equipment';
import {
  skillAllDefinitions,
  skillPickRandomDefinitionByRarity,
} from '@helpers/creator-skill';
import { defaultLocation, defaultNodeCountBlock } from '@helpers/defaults';
import { guardianCreateForLocation } from '@helpers/guardian';
import { angleBetweenPoints, distanceBetweenNodes } from '@helpers/math';
import { Quadtree } from '@helpers/quadtree';
import {
  rngChoice,
  rngChoiceIdentifiable,
  rngChoiceRarity,
  rngGame,
  rngNumberRange,
  rngSeeded,
  rngSucceedsChance,
  rngUuid,
} from '@helpers/rng';
import { gamestate } from '@helpers/state-game';
import {
  locationTraitEncounterLevelModifier,
  locationTraitGuardianCountModifier,
  locationTraitLootCountModifier,
} from '@helpers/trait-location-worldgen';
import { worldNodeGetAccessId } from '@helpers/world';
import {
  locationEncounterLevel,
  locationLootLevel,
} from '@helpers/world-location-upgrade';
import type {
  DropRarity,
  QuadtreePoint,
  TraitLocationContent,
} from '@interfaces';
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
  REVELATION_RADIUS,
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
        ...defaultLocation(x, y),
      };
    }
  }
}

export function elementsForCardinalDirection(
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

    if (!rngSucceedsChance(30)) return;

    const traits = getEntriesByType<TraitLocationContent>('traitlocation');
    const chosenTrait = rngChoiceRarity(traits, rng);
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
      angleBetweenPoints(centerPosition, node),
      Compass.CardinalSubset.Intercardinal,
    );

    // sometimes we lie to typescript because other people have bad typings
    const elements = elementsForCardinalDirection(
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

function fillSpacesWithGuardians(
  nodes: Record<string, WorldLocation>,
  worldCenter: WorldPosition,
  maxDistance: number,
): void {
  Object.values(nodes).forEach((node) => {
    if (!node.nodeType) return;

    populateLocationWithGuardians(node, worldCenter, maxDistance);
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
  // Define corner areas - within 20% of each corner
  const cornerMargin = Math.floor(Math.min(config.width, config.height) * 0.2);

  const corners = [
    { x: 0, y: 0, maxX: cornerMargin, maxY: cornerMargin }, // top-left
    {
      x: config.width - cornerMargin,
      y: 0,
      maxX: config.width,
      maxY: cornerMargin,
    }, // top-right
    {
      x: 0,
      y: config.height - cornerMargin,
      maxX: cornerMargin,
      maxY: config.height,
    }, // bottom-left
    {
      x: config.width - cornerMargin,
      y: config.height - cornerMargin,
      maxX: config.width,
      maxY: config.height,
    }, // bottom-right
  ];

  corners.forEach((corner, cornerIndex) => {
    // Count existing nodes in this corner
    let existingNodesInCorner = 0;
    const emptyPositions: Array<{ x: number; y: number }> = [];

    for (let x = corner.x; x < corner.maxX; x++) {
      for (let y = corner.y; y < corner.maxY; y++) {
        const nodeKey = `${x},${y}`;
        if (nodes[nodeKey]?.nodeType) {
          existingNodesInCorner++;
        } else {
          emptyPositions.push({ x, y });
        }
      }
    }

    // Calculate how many nodes this corner should have
    // Aim for about 1-2 nodes per corner area, more for larger corners
    const cornerArea = (corner.maxX - corner.x) * (corner.maxY - corner.y);
    const targetNodesInCorner = Math.max(1, Math.floor(cornerArea / 4)); // 1 node per ~4 tiles

    // Add nodes if corner is underutilized
    const nodesToAdd = Math.max(0, targetNodesInCorner - existingNodesInCorner);

    if (nodesToAdd > 0 && emptyPositions.length > 0) {
      for (let i = 0; i < Math.min(nodesToAdd, emptyPositions.length); i++) {
        const nodeTypesWithRarities: Array<{
          rarity: DropRarity;
          type: LocationType;
        }> = [
          { rarity: 'Common', type: 'cave' },
          { rarity: 'Rare', type: 'dungeon' },
          { rarity: 'Mystical', type: 'castle' },
        ];

        const chosenNode = rngChoiceRarity(nodeTypesWithRarities, rng);
        const nodeType = chosenNode!.type;

        // Pick random empty position in this corner
        const positionIndex = rngNumberRange(0, emptyPositions.length - 1, rng);
        const position = emptyPositions.splice(positionIndex, 1)[0];

        // Create the node
        const cornerNode: WorldLocation = {
          ...defaultLocation(),
          id: rngUuid(),
          x: position.x,
          y: position.y,
          nodeType,
          name: `${nodeType} (corner ${cornerIndex + 1}-${i + 1})`,
        };

        // Add to nodes and update counts
        nodes[worldNodeGetAccessId(cornerNode)] = cornerNode;
        counts[nodeType]++;
      }
    }
  });
}

function fillFogGaps(
  config: WorldConfigContent,
  nodes: Record<string, WorldLocation>,
  rng: PRNG,
  counts: Record<LocationType, number>,
): void {

  // Calculate all revealed positions based on current nodes
  const revealedPositions = new Set<string>();
  const existingNodes: Array<{ x: number; y: number; nodeType: LocationType }> = [];
  
  Object.values(nodes).forEach((node) => {
    if (!node.nodeType) return;
    
    existingNodes.push({ x: node.x, y: node.y, nodeType: node.nodeType });
    const radius = REVELATION_RADIUS[node.nodeType];
    
    // Add all positions within the revelation radius
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = node.x + dx;
        const y = node.y + dy;
        // Only add positions within world bounds
        if (x >= 0 && x < config.width && y >= 0 && y < config.height) {
          revealedPositions.add(`${x},${y}`);
        }
      }
    }
  });

  // Find unrevealed positions that need to be filled
  const unrevealedPositions: Array<{ x: number; y: number }> = [];
  
  for (let x = 0; x < config.width; x++) {
    for (let y = 0; y < config.height; y++) {
      if (!revealedPositions.has(`${x},${y}`)) {
        unrevealedPositions.push({ x, y });
      }
    }
  }

  // If there are no unrevealed positions, we're done
  if (unrevealedPositions.length === 0) {
    return;
  }

  // Process unrevealed positions more strategically
  const processedPositions = new Set<string>();
  
  unrevealedPositions.forEach(({ x, y }) => {
    const posKey = `${x},${y}`;
    if (processedPositions.has(posKey)) return;
    
    // Check if this position already has a node
    if (nodes[posKey]?.nodeType) return;
    
    // Determine node type based on distance to nearest existing node
    const distanceToNearestNode = Math.min(...existingNodes.map(node => 
      Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
    ));
    
    // Use dungeon for isolated areas (far from existing nodes), cave for smaller gaps
    let nodeType: LocationType;
    if (distanceToNearestNode > 5) {
      // Far from existing nodes - use dungeon (radius 2) for better coverage
      nodeType = 'dungeon';
    } else {
      // Close to existing nodes - use cave (radius 1) for small gaps
      nodeType = 'cave';
    }
    
    // Place the node
    const newNode: WorldLocation = {
      ...defaultLocation(),
      id: rngUuid(),
      x,
      y,
      nodeType,
      name: `fill-gap ${nodeType} ${x}-${y}`,
    };
    
    nodes[posKey] = newNode;
    counts[nodeType]++;
    existingNodes.push({ x, y, nodeType });
    
    // Mark positions that would be revealed by this new node as processed
    const radius = REVELATION_RADIUS[nodeType];
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < config.width && newY >= 0 && newY < config.height) {
          processedPositions.add(`${newX},${newY}`);
        }
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

export async function worldgenGenerateWorld(
  config: WorldConfigContent,
): Promise<GameStateWorld & { didFinish?: boolean }> {
  setWorldGenStatus('Initializing world generation...');

  const rng = rngGame();

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
    ...defaultLocation(),
    id: rngUuid(),
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
    town: maxDistance * 0.5,
    village: maxDistance * 0.4,
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

    const chosenNode = rngChoice<QuadtreePoint>(freeNodes, rng);
    return { x: chosenNode.x, y: chosenNode.y };
  };

  const addNode = (node: WorldLocation): void => {
    nodeList.push(node);
    nodes[worldNodeGetAccessId(node)] = node;
    nodePositionsAvailable[worldNodeGetAccessId(node)].taken = true;
    positionQuadtree.updatePoint(node.x, node.y, true);
  };

  setWorldGenStatus('Generating world...');
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
      const position = { x, y, taken: false };
      nodePositionsAvailable[worldNodeGetAccessId(position)] = position;
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
      const nodeCount = rngNumberRange(
        caveConfig.minNodes,
        caveConfig.maxNodes,
        rng,
      );

      return Array(nodeCount)
        .fill(undefined)
        .map((_, i) => {
          const node: WorldLocation = {
            ...defaultLocation(),
            id: rngUuid(),
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
    const nodeCount = rngNumberRange(count.min, count.max, rng);

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
            ...defaultLocation(),
            id: rngUuid(),
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
            minDist: minDistancesForLocationNode[node.nodeType!],
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

    setWorldGenStatus(`Filling fog gaps...`);
    fillFogGaps(config, nodes, rng, counts);

    setWorldGenStatus('Adding spice to the world...');
    addTraitsToLocations(nodes, rng);

    setWorldGenStatus(`Setting encounter levels...`);
    setEncounterLevels(config, nodes, firstTown);

    setWorldGenStatus(`Giving elements to the world...`);
    addElementsToWorld(config, nodes);

    setWorldGenStatus(`Giving darkness to the world...`);
    fillSpacesWithGuardians(nodes, centerPosition, maxDistance);

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
    claimedCounts: {
      ...defaultNodeCountBlock(),
      town: 1,
    },
  };
}

function populateLocationWithLoot(location: WorldLocation): void {
  if (location.currentlyClaimed) return;

  location.claimLootIds = worldgenLootForLocation(location).map((i) => i.id);
}

export function worldgenLootForLocation(
  location: WorldLocation,
): DroppableEquippable[] {
  const lootLevel = locationLootLevel(location);

  const allValidItemDefinitions = equipmentAllDefinitions().filter(
    (d) => d.dropLevel <= lootLevel,
  );

  const allValidSkillDefinitions = skillAllDefinitions().filter(
    (d) => d.dropLevel <= lootLevel,
  );

  const rng = rngSeeded(
    `$${gamestate().gameId}-${location.id}-${location.claimCount}`,
  );
  const numLoot = numLootForLocation(location);
  return Array.from({ length: numLoot }, () => {
    return rngChoice(
      [
        equipmentPickRandomDefinitionByRarity(allValidItemDefinitions, rng),
        skillPickRandomDefinitionByRarity(allValidSkillDefinitions, rng),
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

function populateLocationWithGuardians(
  location: WorldLocation,
  worldCenter: WorldPosition,
  maxDistance: number,
): void {
  if (location.currentlyClaimed) return;

  location.guardianIds = worldgenGuardiansForLocation(
    location,
    worldCenter,
    maxDistance,
  ).map((i) => i.id);
}

export function worldgenGuardiansForLocation(
  location: WorldLocation,
  worldCenter?: WorldPosition,
  maxDistance?: number,
): Guardian[] {
  const rng = rngSeeded(
    `$${gamestate().gameId}-${location.id}-${location.claimCount}`,
  );

  const encounterLevel = locationEncounterLevel(location);

  const validGuardians = getEntriesByType<GuardianContent>('guardian').filter(
    (g) => g.minLevel <= encounterLevel,
  );

  const numGuardians = numGuardiansForLocation(
    location,
    worldCenter,
    maxDistance,
  );
  const guardians = Array.from({ length: numGuardians }, () => {
    const randomGuardianDataId = rngChoiceIdentifiable<GuardianContent>(
      validGuardians,
      rng,
    );
    const randomGuardianData = getEntry<GuardianContent>(randomGuardianDataId);
    if (!randomGuardianData) return undefined;

    return guardianCreateForLocation(location, randomGuardianData);
  }).filter(Boolean) as Guardian[];

  return guardians;
}

function numGuardiansForLocation(
  location: WorldLocation,
  worldCenter?: WorldPosition,
  maxDistance?: number,
): number {
  const nodeTypes: Record<LocationType, number> = {
    castle: 10,
    town: 7,
    dungeon: 5,
    village: 3,
    cave: 1,
  };

  const modifier = locationTraitGuardianCountModifier(location);
  const baseCount = nodeTypes[location.nodeType ?? 'cave'] ?? 0;

  // Calculate distance-based bonus if world center and max distance are provided
  let distanceBonus = 0;
  if (worldCenter && maxDistance && maxDistance > 0) {
    const distance = distanceBetweenNodes(location, worldCenter);
    const distancePercentage = Math.min((distance / maxDistance) * 100, 100);

    // Scale from 0 to 5 based on distance percentage
    // At 20% distance: 1 extra creature
    // At 100% distance: 5 extra creatures
    distanceBonus = Math.floor(distancePercentage / 20);
  }

  return Math.max(0, modifier + baseCount + distanceBonus);
}
