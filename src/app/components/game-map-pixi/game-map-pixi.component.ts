import type { ElementRef, OnDestroy, OnInit } from '@angular/core';
import {
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  cameraPosition,
  fogIsPositionRevealed,
  gamestate,
  getOption,
  isLoadingGamePage,
  isTraveling,
  locationGet,
  mapGridGenerate,
  pixiAppInitialize,
  pixiDragSetup,
  pixiGameMapContainersCreate,
  pixiIconTextureClaimCreate,
  pixiIndicatorHeroTravelCreate,
  pixiIndicatorNodePlayerAtLocationArrowCreate,
  pixiIndicatorNodePlayerAtLocationCreate,
  pixiIndicatorNodeSpriteCreate,
  pixiIndicatorNodeTerritoryOwnershipCreate,
  pixiIndicatorOffscreenArrowCreate,
  pixiIndicatorTravelLineCreate,
  pixiResponsiveCanvasSetup,
  pixiTextureGameMapLoad,
  showLocationMenu,
  spriteGetForPosition,
  spriteGetFromNodeType,
  travelCurrentPosition,
  travelVisualizationProgress,
  windowHeightTiles,
  windowWidthTiles,
  worldClearNodeChanges,
  worldGetNodeChanges,
} from '@helpers';
import {
  calculateDirectionToPosition,
  calculateScreenEdgePosition,
  isPositionOnScreen,
} from '@helpers/pixi-offscreen-indicator';
import type { WorldNodeChangeEvent } from '@interfaces';
import { REVELATION_RADIUS, type WorldLocation } from '@interfaces';
import type { NodeSpriteData } from '@interfaces/sprite';
import type { LoadedTextures } from '@interfaces/texture';
import { ContentService } from '@services/content.service';
import { LoggerService } from '@services/logger.service';
import type { Application, Container, Graphics, Texture } from 'pixi.js';

@Component({
  selector: 'app-game-map-pixi',
  template: `
    <div #pixiContainer class="w-full h-full"></div>
  `,
  styleUrls: ['./game-map-pixi.component.scss'],
})
export class GameMapPixiComponent implements OnInit, OnDestroy {
  pixiContainer = viewChild<ElementRef>('pixiContainer');

  private contentService = inject(ContentService);
  private loggerService = inject(LoggerService);

  private isPixiSetup = signal<boolean>(false);

  private app?: Application;
  private mapContainer?: Container;
  private ownershipVisualizationContainer?: Container;
  private playerIndicatorContainer?: Container;
  private travelVisualizationContainer?: Container;
  private offscreenIndicatorContainer?: Container;
  private terrainTextures: LoadedTextures = {};
  private objectTextures: LoadedTextures = {};
  private heroTextures: LoadedTextures = {};
  private checkTexture?: Texture;
  private xTexture?: Texture;
  private nodeSprites: Record<string, NodeSpriteData> = {};
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;

  private ownershipVisualizerTickerUpdates: Record<
    string,
    { graphics: Graphics; ticker: () => void }
  > = {};

  private heroAtLocationArrowTicker?: () => void;
  private heroAtLocationTicker?: () => void;
  private heroTickerUpdate?: () => void;
  private offscreenArrowTicker?: () => void;

  // Local computed properties for component functionality
  private debugMapNodePositions = computed(() =>
    getOption('debugMapNodePositions'),
  );
  private firstHero = computed(() => gamestate().hero.heroes[0]);
  private heroPosition = computed(() => travelCurrentPosition());

  private worldConfig = computed(() => gamestate().world.config);
  private nodeWidth = computed(() =>
    Math.min(this.worldConfig().width, windowWidthTiles() + 1),
  );
  private nodeHeight = computed(() =>
    Math.min(this.worldConfig().height, windowHeightTiles() + 1),
  );

  private lastCameraX = signal<number>(0);
  private lastCameraY = signal<number>(0);
  private lastDebugState = signal<boolean | undefined>(undefined);

  constructor() {
    effect(() => {
      const pos = cameraPosition();

      if (pos.x === this.lastCameraX() && pos.y === this.lastCameraY()) return;

      this.loggerService.debug(
        'PixiMap:Regenerate',
        `Camera moving to ${pos.x},${pos.y}`,
      );

      this.lastCameraX.set(pos.x);
      this.lastCameraY.set(pos.y);

      this.updateMap();
    });

    effect(() => {
      const newDebugState = this.debugMapNodePositions();

      if (newDebugState !== this.lastDebugState()) {
        this.loggerService.debug(
          'PixiMap:Regenerate',
          `Toggled debugMapNodePositions`,
        );

        this.lastDebugState.set(newDebugState);
        this.updateMap();
      }
    });

    // Effect for surgical node updates - watch for world node changes
    effect(() => {
      const changes = worldGetNodeChanges();

      if (changes.length > 0 && this.app && this.mapContainer) {
        this.loggerService.debug(
          'PixiMap',
          `Processing ${changes.length} node updates`,
        );

        // Process each change and update specific nodes
        changes.forEach((change) => {
          this.updateSingleNode(change.worldX, change.worldY);

          if (
            change.node.nodeType &&
            (change.type === 'claim' || change.type === 'unclaim')
          ) {
            this.updateFoWForSurroundingNodes(change);
          }
        });

        // Clear the changes after processing
        worldClearNodeChanges();
      }
    });

    // Separate effect for travel visualization to ensure it updates when travel state or camera changes
    effect(() => {
      this.isPixiSetup();
      const currentlyTraveling = isTraveling();

      if (currentlyTraveling) {
        this.updateTravelVisualization();
      } else {
        this.clearTravelVisualization();
      }
    });

    // Separate effect for player indicators to update when position changes without full map rebuild
    effect(() => {
      this.isPixiSetup();
      travelCurrentPosition();

      this.updatePlayerIndicators();
    });

    // Effect for offscreen indicator to update when hero position or camera changes
    effect(() => {
      this.isPixiSetup();
      travelCurrentPosition();
      cameraPosition();

      this.updateOffscreenIndicator();
    });
  }

  private updateFoWForSurroundingNodes(change: WorldNodeChangeEvent) {
    if (!change.node.nodeType) return;

    const radiusToUpdate = REVELATION_RADIUS[change.node.nodeType];

    for (
      let x = change.worldX - radiusToUpdate;
      x <= change.worldX + radiusToUpdate;
      x++
    ) {
      for (
        let y = change.worldY - radiusToUpdate;
        y <= change.worldY + radiusToUpdate;
        y++
      ) {
        this.updateSingleNode(x, y);
      }
    }
  }

  async ngOnInit() {
    isLoadingGamePage.set(true);
    await this.initPixi();
    await this.loadTextures();
    this.updateMap();

    this.isPixiSetup.set(true);
    isLoadingGamePage.set(false);
  }

  /**
   * Clean up a single node sprite and all its components
   */
  private cleanupNodeSprite(positionalKey: string) {
    const spriteData = this.nodeSprites[positionalKey];
    if (!spriteData) return;

    if (spriteData.objectContainer) {
      this.mapContainer?.removeChild(spriteData.objectContainer);
      if (!spriteData.objectContainer.destroyed) {
        spriteData.objectContainer.destroy();
      }
    }

    delete this.nodeSprites[positionalKey];
  }

  ngOnDestroy() {
    // Stop the ticker to save GPU resources
    const ticker = this.app?.ticker;
    if (ticker) {
      ticker.stop();
      ticker.remove(this.heroAtLocationTicker!);
      ticker.remove(this.heroAtLocationArrowTicker!);
      ticker.remove(this.offscreenArrowTicker!);
      Object.values(this.ownershipVisualizerTickerUpdates).forEach((update) => {
        ticker.remove(update.ticker);
      });

      ticker.destroy();
    }

    // Clean up all sprites properly before destroying app
    this.clearAllSprites();

    // Clean up all texture collections to prevent memory leaks
    this.destroyTextureCollection(this.terrainTextures);
    this.destroyTextureCollection(this.objectTextures);
    this.destroyTextureCollection(this.heroTextures);
    this.terrainTextures = {};
    this.objectTextures = {};
    this.heroTextures = {};

    // Clean up individual textures
    if (this.checkTexture && !this.checkTexture.destroyed) {
      this.checkTexture.destroy(true);
    }

    if (this.xTexture && !this.xTexture.destroyed) {
      this.xTexture.destroy(true);
    }

    // Clean up containers
    this.mapContainer?.removeChildren();
    this.ownershipVisualizationContainer?.removeChildren();
    this.playerIndicatorContainer?.removeChildren();
    this.travelVisualizationContainer?.removeChildren();

    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.app?.destroy(true, { children: true, texture: true });
  }

  /**
   * Helper method to destroy all textures in a collection
   */
  private destroyTextureCollection(textureCollection: LoadedTextures) {
    Object.values(textureCollection).forEach((texture) => {
      if (texture && !texture.destroyed) {
        texture.destroy(true);
      }
    });
  }

  private async initPixi() {
    this.app = await pixiAppInitialize(this.pixiContainer()?.nativeElement, {
      width: this.pixiContainer()?.nativeElement.clientWidth,
      height: this.pixiContainer()?.nativeElement.clientHeight,
      backgroundAlpha: 0,
      antialias: false,
    });

    const containers = pixiGameMapContainersCreate(this.app);
    this.mapContainer = containers.mapContainer;
    this.ownershipVisualizationContainer =
      containers.ownershipVisualizationContainer;
    this.playerIndicatorContainer = containers.playerIndicatorContainer;
    this.travelVisualizationContainer = containers.travelVisualizationContainer;
    this.offscreenIndicatorContainer = containers.offscreenIndicatorContainer;

    // Add specific WebGL context restoration handler for this component
    const canvas = this.app.canvas as HTMLCanvasElement;
    canvas.addEventListener('webglcontextrestored', () => {
      this.loggerService.info(
        'PixiMap',
        'WebGL context restored, refreshing textures',
      );
      this.refreshTexturesAfterContextRestore();
    });

    this.resizeObserver = pixiResponsiveCanvasSetup(
      this.app,
      this.pixiContainer()?.nativeElement,
    );

    // Set up intersection observer to pause rendering when not visible
    this.setupVisibilityOptimization();

    this.setupMouseDragging();

    this.setupPlayerIndicators();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__PIXI_APP__ = this.app;
  }

  private setupVisibilityOptimization() {
    if (!this.pixiContainer()?.nativeElement) return;

    // Use IntersectionObserver to pause rendering when component is not visible
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (this.app?.ticker) {
            if (entry.isIntersecting) {
              // Component is visible, resume rendering
              if (!this.app.ticker.started) {
                this.app.ticker.start();
              }
            } else {
              // Component is not visible, pause rendering to save GPU
              this.app.ticker.stop();
            }
          }
        });
      },
      {
        threshold: 0.1, // Trigger when at least 10% is visible
      },
    );

    this.intersectionObserver.observe(this.pixiContainer()!.nativeElement);
  }

  private setupMouseDragging() {
    if (!this.app || !this.mapContainer) return;

    pixiDragSetup({
      app: this.app,
      containers: [this.mapContainer],
      viewportWidth: this.nodeWidth(),
      viewportHeight: this.nodeHeight(),
    });
  }

  private async loadTextures() {
    try {
      const artAtlases = this.contentService.artAtlases();
      const textures = await pixiTextureGameMapLoad(
        artAtlases['world-terrain'],
        artAtlases['world-object'],
      );
      this.terrainTextures = textures.terrainTextures;
      this.objectTextures = textures.objectTextures;

      // Load hero textures
      const { pixiTextureAtlasLoad: loadTexturesFromAtlas } = await import(
        '@helpers/pixi-texture-loader'
      );
      this.heroTextures = await loadTexturesFromAtlas(
        'art/spritesheets/hero.webp',
        artAtlases['hero'],
      );

      const claimTextures = pixiIconTextureClaimCreate();
      this.checkTexture = claimTextures.checkTexture;
      this.xTexture = claimTextures.xTexture;
    } catch (error) {
      this.loggerService.error('PixiMap', 'Failed to load textures:', error);
    }
  }

  /**
   * Refreshes textures after WebGL context restoration
   * This method recreates all textures and re-renders the map
   */
  private async refreshTexturesAfterContextRestore() {
    this.loggerService.info(
      'PixiMap',
      'Refreshing textures after WebGL context restore',
    );

    try {
      // Clear existing sprites to prevent rendering with invalid textures
      this.clearAllSprites();

      // Reload all textures
      await this.loadTextures();

      // Re-render the entire map with new textures
      this.updateMap();

      this.loggerService.info(
        'PixiMap',
        'Successfully refreshed textures after context restore',
      );
    } catch (error) {
      this.loggerService.error(
        'PixiMap',
        'Failed to refresh textures after context restore:',
        error,
      );
    }
  }

  /**
   * Clears all sprites from containers
   */
  private clearAllSprites() {
    // Clear node sprites with comprehensive cleanup
    Object.values(this.nodeSprites).forEach((spriteData) => {
      if (spriteData.objectContainer) {
        this.mapContainer?.removeChild(spriteData.objectContainer);
        spriteData.objectContainer.destroy();
      }
    });

    this.nodeSprites = {};

    // Force clear all containers to ensure no orphaned sprites
    this.mapContainer?.removeChildren();
    this.playerIndicatorContainer?.removeChildren();
    this.travelVisualizationContainer?.removeChildren();
  }

  private updateMap() {
    if (!this.app || !this.mapContainer) return;

    const camera = cameraPosition();
    const worldConfig = this.worldConfig();

    const mapData = mapGridGenerate(
      camera.x,
      camera.y,
      this.nodeWidth(),
      this.nodeHeight(),
      worldConfig.width,
      worldConfig.height,
    );

    this.ownershipVisualizationContainer?.removeChildren();
    mapData.tiles.forEach((row) => {
      row.forEach(({ x, y, tileSprite }) => {
        this.createOrUpdateNodeSprites(x, y, tileSprite);
      });
    });
  }

  private updateSingleNode(worldX: number, worldY: number) {
    if (!this.mapContainer) return;

    const camera = cameraPosition();
    const relativeX = worldX - Math.floor(camera.x);
    const relativeY = worldY - Math.floor(camera.y);

    // Check if the node is within the current viewport
    if (
      relativeX >= 0 &&
      relativeX < this.nodeWidth() &&
      relativeY >= 0 &&
      relativeY < this.nodeHeight()
    ) {
      const positionalKey = `${relativeX}-${relativeY}`;

      // Remove existing sprite if it exists
      const existingSprite = this.nodeSprites[positionalKey];
      if (existingSprite) {
        this.loggerService.debug(
          'PixiMap',
          `Removing existing sprite for node ${worldX},${worldY}`,
        );

        // Use the centralized cleanup method
        this.cleanupNodeSprite(positionalKey);
      }

      // Create new sprite with updated data
      this.loggerService.debug(
        'PixiMap',
        `Creating updated sprite for node ${worldX},${worldY}`,
      );

      // Get the correct tile sprite for this world position
      const tileSprite = spriteGetForPosition(worldX, worldY);
      this.createOrUpdateNodeSprites(relativeX, relativeY, tileSprite);
    }
  }

  private cleanupOwnershipVisualizer(nodeKey: string): void {
    if (!this.app || !this.ownershipVisualizationContainer) return;

    const hasPreviousOwnership = this.ownershipVisualizerTickerUpdates[nodeKey];
    if (hasPreviousOwnership) {
      this.ownershipVisualizationContainer.removeChild(
        hasPreviousOwnership.graphics,
      );
      this.app.ticker.remove(hasPreviousOwnership.ticker);
    }
  }

  private createOrUpdateNodeSprites(x: number, y: number, tileSprite: string) {
    if (
      !this.app ||
      !this.mapContainer ||
      !this.ownershipVisualizationContainer
    )
      return;

    const camera = cameraPosition();
    const worldX = Math.floor(camera.x) + x;
    const worldY = Math.floor(camera.y) + y;

    // Always get fresh node data to ensure we have the latest claim status
    const currentNodeData = locationGet(worldX, worldY);
    const isRevealed =
      getOption('debugDisableFogOfWar') ||
      fogIsPositionRevealed(worldX, worldY);

    const positionalKey = `${x}-${y}`;
    const nodeKey = currentNodeData.id;

    this.cleanupOwnershipVisualizer(currentNodeData.id);
    this.nodeSprites[positionalKey]?.objectContainer?.destroy();

    const spriteData = pixiIndicatorNodeSpriteCreate(
      x,
      y,
      currentNodeData,
      tileSprite,
      spriteGetFromNodeType(currentNodeData.nodeType),
      this.terrainTextures,
      this.objectTextures,
      this.mapContainer,
      this.checkTexture,
      this.xTexture,
      isRevealed
        ? (nodeData: WorldLocation) => this.investigateLocation(nodeData)
        : undefined,
      this.debugMapNodePositions(),
    );

    if (spriteData) {
      // Disable interactivity for unrevealed nodes
      if (!isRevealed && spriteData.objectContainer) {
        spriteData.objectContainer.interactiveChildren = false;
        spriteData.objectContainer.cursor = 'default';
      }

      this.nodeSprites[positionalKey] = spriteData;

      if (currentNodeData.currentlyClaimed) {
        const res = pixiIndicatorNodeTerritoryOwnershipCreate(currentNodeData);
        if (res) {
          this.ownershipVisualizerTickerUpdates[nodeKey] = res;

          this.ownershipVisualizationContainer.addChild(res.graphics);
          this.app.ticker.add(res.ticker);

          res.graphics.x =
            spriteData.objectContainer.x - res.graphics.width / 2 + 32;
          res.graphics.y =
            spriteData.objectContainer.y - res.graphics.height / 2 + 32;
        }
      }
    }
  }

  private setupPlayerIndicators() {
    if (!this.playerIndicatorContainer || !this.app) return;

    const { graphics, ticker } = pixiIndicatorNodePlayerAtLocationCreate();
    this.playerIndicatorContainer.addChild(graphics);

    this.heroAtLocationTicker = ticker;
    this.app.ticker.add(ticker);

    const { graphics: arrowGraphics, ticker: arrowTicker } =
      pixiIndicatorNodePlayerAtLocationArrowCreate();
    this.playerIndicatorContainer.addChild(arrowGraphics);

    this.heroAtLocationTicker = arrowTicker;
    this.app.ticker.add(arrowTicker);

    const heroPosition = this.heroPosition();
    const camera = cameraPosition();

    this.playerIndicatorContainer.position.set(
      (heroPosition.x - camera.x) * 64,
      (heroPosition.y - camera.y) * 64,
    );
  }

  private updatePlayerIndicators() {
    if (!this.playerIndicatorContainer || !this.app) return;

    const heroPosition = this.heroPosition();
    const camera = cameraPosition();

    this.playerIndicatorContainer.position.set(
      (heroPosition.x - camera.x) * 64,
      (heroPosition.y - camera.y) * 64,
    );
  }

  private updateTravelVisualization() {
    if (!this.travelVisualizationContainer || !this.app) return;

    const travelProgress = travelVisualizationProgress();
    if (!travelProgress.isActive) return;

    this.clearTravelVisualization();

    const { fromPosition, toPosition, interpolatedPosition } = travelProgress;

    // Convert world coordinates to relative coordinates based on current camera
    // Use Math.floor on camera position to match map grid generation logic
    const camera = cameraPosition();
    const relativeFromX = fromPosition.x - Math.floor(camera.x);
    const relativeFromY = fromPosition.y - Math.floor(camera.y);
    const relativeToX = toPosition.x - Math.floor(camera.x);
    const relativeToY = toPosition.y - Math.floor(camera.y);
    const relativeInterpolatedX = interpolatedPosition.x - Math.floor(camera.x);
    const relativeInterpolatedY = interpolatedPosition.y - Math.floor(camera.y);

    // Draw travel line between source and destination using relative coordinates
    const travelLine = pixiIndicatorTravelLineCreate(
      relativeFromX,
      relativeFromY,
      relativeToX,
      relativeToY,
    );

    this.travelVisualizationContainer.addChild(travelLine);

    // Show traveling hero sprite at interpolated position using relative coordinates
    const partyLeader = this.firstHero();
    if (partyLeader && this.heroTextures[partyLeader.sprite]) {
      const { sprite, ticker } = pixiIndicatorHeroTravelCreate(
        relativeInterpolatedX,
        relativeInterpolatedY,
        this.heroTextures[partyLeader.sprite],
      );

      this.heroTickerUpdate = ticker;
      this.travelVisualizationContainer.addChild(sprite);

      this.app.ticker.add(ticker);
    }
  }

  private clearTravelVisualization() {
    this.travelVisualizationContainer?.removeChildren();

    this.app?.ticker.remove(this.heroTickerUpdate!);
    this.heroTickerUpdate = undefined;
  }

  private updateOffscreenIndicator() {
    if (!this.offscreenIndicatorContainer || !this.app) return;

    const heroPosition = this.heroPosition();

    // Clear existing offscreen indicator
    this.clearOffscreenIndicator();

    // Only show offscreen indicator if hero is not visible on screen
    if (!isPositionOnScreen(heroPosition)) {
      const direction = calculateDirectionToPosition(heroPosition);
      const edgePosition = calculateScreenEdgePosition(direction);

      // Get hero texture for the indicator
      const partyLeader = this.firstHero();
      const heroTexture =
        partyLeader && this.heroTextures[partyLeader.sprite]
          ? this.heroTextures[partyLeader.sprite]
          : undefined;

      const { container, ticker } = pixiIndicatorOffscreenArrowCreate(
        direction,
        heroTexture,
      );

      // Position the arrow at the calculated edge position
      container.position.set(edgePosition.x, edgePosition.y);

      this.offscreenIndicatorContainer.addChild(container);
      this.offscreenArrowTicker = ticker;
      this.app.ticker.add(ticker);
    }
  }

  private clearOffscreenIndicator() {
    this.offscreenIndicatorContainer?.removeChildren();

    if (this.offscreenArrowTicker) {
      this.app?.ticker.remove(this.offscreenArrowTicker);
      this.offscreenArrowTicker = undefined;
    }
  }

  private investigateLocation(nodeData: WorldLocation) {
    showLocationMenu.set(nodeData);
  }
}
