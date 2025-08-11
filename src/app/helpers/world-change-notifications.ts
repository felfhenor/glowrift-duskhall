import { signal } from '@angular/core';
import type { WorldLocation, WorldNodeChangeEvent } from '@interfaces';

// Global signal for world node changes
const worldNodeChanges = signal<WorldNodeChangeEvent[]>([]);

/**
 * Gets the current list of world node changes
 */
export function worldGetNodeChanges() {
  return worldNodeChanges();
}

/**
 * Clears all world node changes (call after processing them)
 */
export function worldClearNodeChanges() {
  worldNodeChanges.set([]);
}

/**
 * Notifies that a node has been claimed
 */
export function worldNotifyClaim(node: WorldLocation): void {
  const currentChanges = worldNodeChanges();
  worldNodeChanges.set([
    ...currentChanges,
    {
      type: 'claim',
      node,
      worldX: node.x,
      worldY: node.y,
      timestamp: Date.now(),
    },
  ]);
}

/**
 * Notifies that a node has been unclaimed
 */
export function worldNotifyUnclaimed(node: WorldLocation): void {
  const currentChanges = worldNodeChanges();
  worldNodeChanges.set([
    ...currentChanges,
    {
      type: 'unclaim',
      node,
      worldX: node.x,
      worldY: node.y,
      timestamp: Date.now(),
    },
  ]);
}

/**
 * Notifies that a node has been updated in some other way
 */
export function worldNotifyUpdated(node: WorldLocation): void {
  const currentChanges = worldNodeChanges();
  worldNodeChanges.set([
    ...currentChanges,
    {
      type: 'update',
      node,
      worldX: node.x,
      worldY: node.y,
      timestamp: Date.now(),
    },
  ]);
}
