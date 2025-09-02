import { signal } from '@angular/core';
import { distanceBetweenNodes } from '@helpers/math';
import { worldNodeGetAccessId } from '@helpers/world';
import { locationGetAll, locationNodesAround } from '@helpers/world-location';
import type {
  WorldLocation,
  WorldLocationInterconnectedness,
} from '@interfaces/world';
import { REVELATION_RADIUS } from '@interfaces/world';
import { sortBy } from 'es-toolkit/compat';

const interconnectedness = signal<
  Record<string, WorldLocationInterconnectedness>
>({});
export const interconnectednessState = interconnectedness.asReadonly();

const interconnectednessCalculated = signal<boolean>(false);
export const isInterconnectednessReady =
  interconnectednessCalculated.asReadonly();

function calculateInterconnectednessForLocation(
  location: WorldLocation,
): WorldLocationInterconnectedness {
  const allNodes = locationGetAll();

  const nearestTowns = sortBy(
    allNodes.filter((node) => node.nodeType === 'town'),
    (checkNode) => distanceBetweenNodes(location, checkNode),
  ).map((n) => ({ x: n.x, y: n.y }));

  const zocNodes = [];
  if (['town', 'village'].includes(location.nodeType!)) {
    zocNodes.push(
      ...locationNodesAround(
        location.x,
        location.y,
        REVELATION_RADIUS[location.nodeType!],
      ).filter((n) => n.id !== location.id),
    );
  }

  return {
    nearbyTownOrderPositions: nearestTowns,
    zocNodePositions: zocNodes,
  };
}

function updateInterconnectednessForLocation(location: WorldLocation) {
  if (!location.nodeType) return;

  const newInterconnectedness = interconnectedness();

  const locationInterconnectedness =
    calculateInterconnectednessForLocation(location);

  newInterconnectedness[worldNodeGetAccessId(location)] =
    locationInterconnectedness;

  if (['town', 'village'].includes(location.nodeType)) {
    const zocNodes = locationNodesAround(
      location.x,
      location.y,
      REVELATION_RADIUS[location.nodeType],
    );

    zocNodes.forEach((loc) => {
      const zocLocId = worldNodeGetAccessId(loc);
      newInterconnectedness[zocLocId] =
        calculateInterconnectednessForLocation(loc);

      newInterconnectedness[zocLocId].zocOwnerPosition = {
        x: location.x,
        y: location.y,
      };
    });
  }

  interconnectedness.set(newInterconnectedness);
}

export function interconnectednessRecalculate() {
  interconnectednessReset();
  interconnectedness.set({});

  const newInterconnectedness: Record<string, WorldLocationInterconnectedness> =
    {};

  const allNodes = locationGetAll();

  allNodes.forEach((loc) => {
    const interconnectedness = calculateInterconnectednessForLocation(loc);
    newInterconnectedness[worldNodeGetAccessId(loc)] = interconnectedness;
  });

  interconnectedness.set(newInterconnectedness);

  allNodes
    .filter((n) => ['town', 'village'].includes(n.nodeType!))
    .forEach((loc) => {
      updateInterconnectednessForLocation(loc);
    });

  interconnectednessCalculated.set(true);
}

export function interconnectednessReset() {
  interconnectednessCalculated.set(false);
}
