import type { PixiAppConfig } from '@interfaces/pixi-config';
import { Application, Container } from 'pixi.js';

/**
 * Initializes a pixijs with the specified configuration
 * @param container HTML element to append the canvas to
 * @param config pixijs configuration
 * @returns Initialized pixijs
 */
export async function pixiAppInitialize(
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

  app.ticker.maxFPS = 60;

  container.appendChild(app.canvas);

  return app;
}

/**
 * Sets up automatic canvas resizing based on container size changes
 * @param app pixijs application
 * @param container HTML container element
 * @returns ResizeObserver instance
 */
export function pixiResponsiveCanvasSetup(
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
 * @returns Map, player indicator, and travel visualization containers
 */
export function pixiGameMapContainersCreate(app: Application): {
  mapContainer: Container;
  fogContainer: Container;
  playerIndicatorContainer: Container;
  travelVisualizationContainer: Container;
} {
  const mapContainer = new Container();
  const fogContainer = new Container();
  const playerIndicatorContainer = new Container();
  const travelVisualizationContainer = new Container();

  app.stage.addChild(mapContainer);
  app.stage.addChild(fogContainer);
  app.stage.addChild(travelVisualizationContainer);
  app.stage.addChild(playerIndicatorContainer);

  return {
    mapContainer,
    fogContainer,
    playerIndicatorContainer,
    travelVisualizationContainer,
  };
}

/**
 * Resets container positions to origin
 * @param containers Containers to reset
 */
export function pixiGameMapContainersPositionReset(
  ...containers: Container[]
): void {
  containers.forEach((container) => {
    if (!container) return;

    container.x = 0;
    container.y = 0;
  });
}
