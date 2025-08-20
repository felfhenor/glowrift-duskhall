import { cameraPosition, cameraPositionSet } from '@helpers/camera';
import {
  cameraCalculateBounds,
  cameraProcessDrag,
} from '@helpers/camera-controller';
import { pixiGameMapContainersPositionReset } from '@helpers/pixi-app-setup';
import { gamestate } from '@helpers/state-game';
import type { DragState } from '@interfaces/camera';
import type { DragHandlerConfig } from '@interfaces/pixi-config';
import type { FederatedPointerEvent } from 'pixi.js';

/**
 * Sets up mouse dragging for camera movement
 * @param config Drag handler configuration
 * @returns Drag state object
 */
export function pixiDragSetup(config: DragHandlerConfig): DragState {
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

    const currentCamera = cameraPosition();
    const world = gamestate().world;
    const bounds = cameraCalculateBounds(
      world.config.width,
      world.config.height,
      viewportWidth,
      viewportHeight,
    );

    const result = cameraProcessDrag(
      dragState.accumulatedDrag,
      currentCamera,
      bounds,
      tileSize,
    );

    cameraPositionSet(result.newCamera.x, result.newCamera.y);
    dragState.accumulatedDrag = result.remainingDrag;
    dragState.lastPointerPosition = currentPosition;
  });

  const handlePointerEnd = () => {
    dragState.isDragging = false;
    pixiGameMapContainersPositionReset(...containers);
    app.stage.cursor = 'grab';
  };

  app.stage.on('pointerup', handlePointerEnd);
  app.stage.on('pointerupoutside', handlePointerEnd);

  app.stage.cursor = 'grab';

  return dragState;
}
