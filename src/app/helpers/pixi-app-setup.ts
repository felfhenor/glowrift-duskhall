import { warn } from '@helpers/logging';
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
    // Performance optimizations to reduce GPU load
    powerPreference: 'high-performance',
    sharedTicker: true,
    resolution: 1, // Avoid high DPI rendering unless needed
    autoDensity: false, // Disable auto density scaling
    preference: 'webgpu',
  });

  // Reduce maximum FPS to decrease GPU load
  app.ticker.maxFPS = 30; // Reduced from 60 to 30

  // Stop the ticker when not needed
  app.ticker.autoStart = false;
  app.ticker.stop();

  // Add WebGL context loss and restoration handlers
  const canvas = app.canvas as HTMLCanvasElement;

  canvas.addEventListener('webglcontextlost', (event) => {
    warn('PixiMap', 'WebGL context lost, preventing default behavior');
    event.preventDefault();
  });

  container.appendChild(app.canvas);

  // Start ticker only when canvas is actually visible and being used
  app.ticker.start();

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
 * @returns Map, player indicator, travel visualization, and offscreen indicator containers
 */
export function pixiGameMapContainersCreate(app: Application): {
  mapContainer: Container;
  ownershipVisualizationContainer: Container;
  playerIndicatorContainer: Container;
  travelVisualizationContainer: Container;
  offscreenIndicatorContainer: Container;
} {
  const mapContainer = new Container();
  const ownershipVisualizationContainer = new Container();
  const playerIndicatorContainer = new Container();
  const travelVisualizationContainer = new Container();
  const offscreenIndicatorContainer = new Container();

  app.stage.addChild(mapContainer);
  app.stage.addChild(ownershipVisualizationContainer);
  app.stage.addChild(playerIndicatorContainer);
  app.stage.addChild(travelVisualizationContainer);
  app.stage.addChild(offscreenIndicatorContainer);

  mapContainer.cullable = true;
  ownershipVisualizationContainer.cullable = false;
  playerIndicatorContainer.cullable = false;
  travelVisualizationContainer.cullable = false;
  offscreenIndicatorContainer.cullable = false;

  return {
    mapContainer,
    ownershipVisualizationContainer,
    playerIndicatorContainer,
    travelVisualizationContainer,
    offscreenIndicatorContainer,
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
