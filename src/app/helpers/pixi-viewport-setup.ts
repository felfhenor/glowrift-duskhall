import type { ViewportConfig } from '@interfaces/pixi-config';
import { Viewport } from 'pixi-viewport';
import { Container } from 'pixi.js';

/**
 * Creates a viewport with zoom and drag functionality for the game map
 * @param config Viewport configuration
 * @returns Configured viewport with map, player indicator, and travel visualization containers
 */
export function pixiViewportCreate(config: ViewportConfig): {
  viewport: Viewport;
  mapContainer: Container;
  playerIndicatorContainer: Container;
  travelVisualizationContainer: Container;
} {
  const {
    app,
    worldWidth,
    worldHeight,
    tileSize = 64,
    maxZoom = 1,
    minZoom = 0.25,
  } = config;

  // Create the viewport with proper screen dimensions matching the canvas
  const viewport = new Viewport({
    screenWidth: app.canvas.width,
    screenHeight: app.canvas.height,
    worldWidth: worldWidth * tileSize,
    worldHeight: worldHeight * tileSize,
    events: app.renderer.events,
    interaction: app.renderer.events,
  });

  // Add the viewport to the app stage
  app.stage.addChild(viewport);

  // Configure viewport plugins in the correct order and chain them
  viewport
    .drag({
      wheel: false, // Disable wheel on drag to prevent conflicts
      mouseButtons: 'left'
    })
    .wheel({
      smooth: 3,
      interrupt: false,
    })
    .clampZoom({
      minScale: minZoom,
      maxScale: maxZoom,
    })
    .clamp({
      left: 0,
      right: worldWidth * tileSize,
      top: 0,
      bottom: worldHeight * tileSize,
      direction: 'all',
    });

  // Create containers for different layers
  const mapContainer = new Container();
  const playerIndicatorContainer = new Container();
  const travelVisualizationContainer = new Container();

  // Add containers to viewport in the correct order
  viewport.addChild(mapContainer);
  viewport.addChild(travelVisualizationContainer);
  viewport.addChild(playerIndicatorContainer);

  return {
    viewport,
    mapContainer,
    playerIndicatorContainer,
    travelVisualizationContainer,
  };
}

/**
 * Sets up automatic viewport resizing based on container size changes
 * @param viewport The viewport instance
 * @param container HTML container element
 * @returns ResizeObserver instance
 */
export function pixiViewportResponsiveSetup(
  viewport: Viewport,
  container: HTMLElement,
): ResizeObserver {
  const resizeObserver = new ResizeObserver(() => {
    // Update viewport to match container dimensions exactly
    viewport.resize(container.clientWidth, container.clientHeight);
  });

  resizeObserver.observe(container);

  return resizeObserver;
}