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

  // Create the viewport
  const viewport = new Viewport({
    screenWidth: app.screen.width,
    screenHeight: app.screen.height,
    worldWidth: worldWidth * tileSize,
    worldHeight: worldHeight * tileSize,
    events: app.renderer.events,
  });

  // Add the viewport to the app stage
  app.stage.addChild(viewport);

  // Enable dragging
  viewport.drag();

  // Enable zooming with mouse wheel
  viewport
    .wheel({
      smooth: 3,
      interrupt: false,
    })
    .clampZoom({
      minScale: minZoom,
      maxScale: maxZoom,
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
    viewport.resize(container.clientWidth, container.clientHeight);
  });

  resizeObserver.observe(container);

  return resizeObserver;
}