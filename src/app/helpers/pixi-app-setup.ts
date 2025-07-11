import { Application, Container } from 'pixi.js';
import { PixiAppConfig } from '@interfaces/pixi-config';

/**
 * Initializes a pixijs with the specified configuration
 * @param container HTML element to append the canvas to
 * @param config pixijs configuration
 * @returns Initialized pixijs
 */
export async function initializePixiApp(
  container: HTMLElement,
  config: PixiAppConfig,
): Promise<Application> {
  const app = new Application();

  await app.init({
    width: config.width,
    height: config.height,
    backgroundAlpha: config.backgroundAlpha ?? 0,
    antialias: config.antialias ?? false,
  });

  container.appendChild(app.canvas);

  return app;
}

/**
 * Sets up automatic canvas resizing based on container size changes
 * @param app pixijs application
 * @param container HTML container element
 * @returns ResizeObserver instance
 */
export function setupResponsiveCanvas(
  app: Application,
  container: HTMLElement,
): ResizeObserver {
  const resizeObserver = new ResizeObserver(() => {
    app.renderer.resize(container.clientWidth, container.clientHeight);
  });

  resizeObserver.observe(container);

  return resizeObserver;
}

/**
 * Creates the main containers for the game map
 * @param app pixijs application
 * @returns Map and player indicator containers
 */
export function createGameMapContainers(app: Application): {
  mapContainer: Container;
  playerIndicatorContainer: Container;
} {
  const mapContainer = new Container();
  const playerIndicatorContainer = new Container();

  app.stage.addChild(mapContainer);
  app.stage.addChild(playerIndicatorContainer);

  return { mapContainer, playerIndicatorContainer };
}

/**
 * Resets container positions to origin
 * @param containers Containers to reset
 */
export function resetContainerPositions(...containers: Container[]): void {
  containers.forEach((container) => {
    if (!container) return;

    container.x = 0;
    container.y = 0;
  });
}
