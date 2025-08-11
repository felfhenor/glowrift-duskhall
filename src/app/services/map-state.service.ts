import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  gamestate,
  mapGridGenerate,
  windowHeightTiles,
  windowWidthTiles,
} from '@helpers';
import type { MapState, WorldLocation } from '@interfaces';
import { LoggerService } from '@services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class MapStateService {
  private logger = inject(LoggerService);

  private mapState = signal<MapState | null>(null);

  private lastCameraX = signal<number>(0);
  private lastCameraY = signal<number>(0);

  public nodeWidth = computed(() =>
    Math.min(gamestate().world.config.width, windowWidthTiles() + 1),
  );

  public nodeHeight = computed(() =>
    Math.min(gamestate().world.config.height, windowHeightTiles() + 1),
  );

  public camera = computed(() => gamestate().camera);

  public map = computed(() => {
    const camera = this.camera();
    const width = this.nodeWidth();
    const height = this.nodeHeight();
    const world = gamestate().world;

    const currentState = this.mapState();
    const cameraMoved = this.hasCameraMoved(camera.x, camera.y);

    if (!currentState || cameraMoved) {
      this.logger.debug(
        'MapState',
        `Regenerating map grid - camera: ${camera.x},${camera.y}`,
      );

      const newMapData = mapGridGenerate(
        camera.x,
        camera.y,
        width,
        height,
        world.config.width,
        world.config.height,
      );

      const newState: MapState = {
        ...newMapData,
        cameraX: camera.x,
        cameraY: camera.y,
      };

      return newState;
    }

    return currentState;
  });

  constructor() {
    effect(() => {
      const newState = this.map();

      this.mapState.set(newState);
      this.lastCameraX.set(newState.cameraX);
      this.lastCameraY.set(newState.cameraY);
    });
  }

  private hasCameraMoved(currentX: number, currentY: number): boolean {
    const threshold = 1;
    const deltaX = Math.abs(currentX - this.lastCameraX());
    const deltaY = Math.abs(currentY - this.lastCameraY());

    return deltaX >= threshold || deltaY >= threshold;
  }

  /**
   * Updates a specific node in the current map state without full regeneration
   */
  public updateNode(
    worldX: number,
    worldY: number,
    updatedNode: WorldLocation,
  ): boolean {
    const currentState = this.mapState();
    if (!currentState) return false;

    // Calculate relative position within current viewport
    const relativeX = worldX - Math.floor(currentState.cameraX);
    const relativeY = worldY - Math.floor(currentState.cameraY);

    // Check if the node is within the current viewport
    if (
      relativeX >= 0 &&
      relativeX < currentState.width &&
      relativeY >= 0 &&
      relativeY < currentState.height
    ) {
      // Find and update the specific tile
      const tileRow = currentState.tiles[relativeY];
      if (tileRow && tileRow[relativeX]) {
        this.logger.debug(
          'MapState',
          `Surgically updating node at ${worldX},${worldY}`,
        );

        // Update the tile data with the new node information
        tileRow[relativeX] = {
          ...tileRow[relativeX],
          nodeData: updatedNode,
        };

        // Trigger reactivity by setting the state again
        this.mapState.set({ ...currentState });
        return true;
      }
    }

    return false;
  }

  /**
   * Forces a complete map regeneration - use sparingly
   */
  public forceRegenerate(): void {
    this.logger.debug('MapState', 'Forcing complete map regeneration');
    this.mapState.set(null);
  }

  /**
   * Gets the current node data at specific world coordinates
   */
  public getNodeAtWorldPosition(
    worldX: number,
    worldY: number,
  ): WorldLocation | null {
    const currentState = this.mapState();
    if (!currentState) return null;

    const relativeX = worldX - Math.floor(currentState.cameraX);
    const relativeY = worldY - Math.floor(currentState.cameraY);

    if (
      relativeX >= 0 &&
      relativeX < currentState.width &&
      relativeY >= 0 &&
      relativeY < currentState.height
    ) {
      const tileRow = currentState.tiles[relativeY];
      return tileRow?.[relativeX]?.nodeData || null;
    }

    return null;
  }
}
