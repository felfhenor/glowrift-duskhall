import { Application, Container, FederatedPointerEvent } from 'pixi.js';
import { DragState } from '@interfaces/camera';
import {
  calculateCameraBounds,
  processCameraDrag,
  updateCameraPosition,
} from './camera-controller';
import { gamestate } from './index';
import { resetContainerPositions } from './pixi-app-setup';

export interface DragHandlerConfig {
  app: Application;
  containers: Container[];
  viewportWidth: number;
  viewportHeight: number;
  tileSize?: number;
}

/**
 * Sets up mouse dragging for camera movement
 * @param config Drag handler configuration
 * @returns Drag state object
 */
export function setupMapDragging(config: DragHandlerConfig): DragState {
  const {
    app,
    containers,
    viewportWidth,
    viewportHeight,
    tileSize = 64,
  } = config;

  const dragState: DragState = {
    isDragging: false,
    lastPointerPosition: { x: 0, y: 0 },
    accumulatedDrag: { x: 0, y: 0 },
  };

  app.stage.interactive = true;
  app.stage.hitArea = app.screen;

  app.stage.on('pointerdown', (event: FederatedPointerEvent) => {
    dragState.isDragging = true;
    dragState.lastPointerPosition = { x: event.global.x, y: event.global.y };
    dragState.accumulatedDrag = { x: 0, y: 0 };
    app.stage.cursor = 'grabbing';
  });

  app.stage.on('pointermove', (event: FederatedPointerEvent) => {
    if (!dragState.isDragging) return;

    const currentPosition = { x: event.global.x, y: event.global.y };
    const deltaX = currentPosition.x - dragState.lastPointerPosition.x;
    const deltaY = currentPosition.y - dragState.lastPointerPosition.y;

    dragState.accumulatedDrag.x += deltaX;
    dragState.accumulatedDrag.y += deltaY;

    const currentCamera = gamestate().camera;
    const world = gamestate().world;
    const bounds = calculateCameraBounds(
      world.width,
      world.height,
      viewportWidth,
      viewportHeight,
    );

    const result = processCameraDrag(
      dragState.accumulatedDrag,
      currentCamera,
      bounds,
      tileSize,
    );

    updateCameraPosition(result.newCamera);
    dragState.accumulatedDrag = result.remainingDrag;
    dragState.lastPointerPosition = currentPosition;
  });

  const handlePointerEnd = () => {
    dragState.isDragging = false;
    resetContainerPositions(...containers);
    app.stage.cursor = 'grab';
  };

  app.stage.on('pointerup', handlePointerEnd);
  app.stage.on('pointerupoutside', handlePointerEnd);

  app.stage.cursor = 'grab';

  return dragState;
}
