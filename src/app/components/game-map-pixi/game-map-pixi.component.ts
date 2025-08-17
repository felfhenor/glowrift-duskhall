import type { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Component, computed, effect, inject, viewChild } from '@angular/core';
import {
  fogIsPositionRevealed,
  gamestate,
  getOption,
  isTraveling,
  locationGet,
  pixiAppInitialize,
  pixiDragSetup,
  pixiGameMapContainersCreate,
  pixiIconTextureClaimCreate,
  pixiIndicatorHeroTravelCreate,
  pixiIndicatorNodePlayerAtLocationCreate,
  pixiIndicatorNodeSpriteCreate,
  pixiIndicatorTravelLineCreate,
  pixiResponsiveCanvasSetup,
  pixiTextureFogGet,
  pixiTextureGameMapLoad,
  showLocationMenu,
  spriteGetForPosition,
  spriteGetFromNodeType,
  travelVisualizationProgress,
  worldClearNodeChanges,
  worldGetNodeChanges,
} from '@helpers';
import type { MapTileData, WorldLocation } from '@interfaces';
import type { NodeSpriteData } from '@interfaces/sprite';
import type { LoadedTextures } from '@interfaces/texture';
import { ContentService } from '@services/content.service';
import { LoggerService } from '@services/logger.service';
import { MapStateService } from '@services/map-state.service';
import type { Application, Container, Texture } from 'pixi.js';
import { Sprite } from 'pixi.js';

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
  private mapStateService = inject(MapStateService);

  private app?: Application;
  private mapContainer?: Container;
  private fogContainer?: Container;
  private terrainTextures: LoadedTextures = {};
  private objectTextures: LoadedTextures = {};
  private heroTextures: LoadedTextures = {};
  private checkTexture?: Texture;
  private xTexture?: Texture;
  private fogTexture?: Texture;
  private nodeSprites: Record<string, NodeSpriteData> = {};
  private fogSprites: Record<string, Sprite> = {}; // Track fog sprites by position
  private playerIndicatorContainer?: Container;
  private travelVisualizationContainer?: Container;
  private resizeObserver?: ResizeObserver;

  // Track dynamic sprites for proper cleanup
  private playerIndicatorCleanup?: () => void;
  private travelVisualizationCleanups: Array<() => void> = [];

  // Performance optimization: debounce fog updates during camera movement
  private fogUpdateTimeout?: ReturnType<typeof setTimeout>;

  // Use map state service instead of local computed values
  public nodeWidth = computed(() => this.mapStateService.nodeWidth());
  public nodeHeight = computed(() => this.mapStateService.nodeHeight());
  public camera = computed(() => this.mapStateService.camera());
  public map = computed(() => this.mapStateService.map());

  // Local computed properties for component functionality
  public debugMapNodePositions = computed(() =>
    getOption('debugMapNodePositions'),
  );
  public firstHero = computed(() => gamestate().hero.heroes[0]);
  public position = computed(() => gamestate().hero.position);

  constructor() {
    effect(() => {
      const mapData = this.map();
      // debugMapNodePositions is tracked automatically by the effect
      this.debugMapNodePositions();

      if (this.app && this.mapContainer) {
        this.updateMap(mapData.tiles);
      }
    });

    // Effect for surgical node updates - watch for world node changes
    effect(() => {
      const changes = worldGetNodeChanges();

      if (changes.length > 0 && this.app && this.mapContainer) {
        this.loggerService.debug(
          'PixiMap',
          `Processing ${changes.length} surgical node updates`,
        );

        // Process each change and update specific nodes
        changes.forEach((change) => {
          this.updateSingleNode(change.worldX, change.worldY, change.node);
        });

        // Clear the changes after processing
        worldClearNodeChanges();
      }
    });

    // Separate effect for travel visualization to ensure it updates when travel state or camera changes
    effect(() => {
      this.camera(); // Watch camera changes
      isTraveling(); // Watch travel state changes

      if (this.app && this.travelVisualizationContainer) {
        this.updateTravelVisualization();
      }
    });

    // Separate effect for player indicators to update when position changes without full map rebuild
    effect(() => {
      this.position(); // Watch position changes
      this.camera(); // Watch camera changes for viewport calculations

      if (this.app && this.playerIndicatorContainer) {
        this.updatePlayerIndicators();
      }
    });

    // Separate effect for fog updates when camera changes - debounced for performance
    effect(() => {
      this.camera(); // Watch camera changes

      if (this.app && this.fogContainer && this.fogTexture) {
        // Clear existing timeout to debounce rapid camera changes
        if (this.fogUpdateTimeout) {
          clearTimeout(this.fogUpdateTimeout);
        }

        // Debounce fog updates by 16ms (~1 frame at 60fps) to improve dragging performance
        this.fogUpdateTimeout = setTimeout(() => {
          this.updateFogForViewport();
        }, 16);
      }
    });

    // Effect to watch for debug fog of war option changes - immediate update
    effect(() => {
      getOption('debugDisableFogOfWar'); // Watch debug option changes

      if (this.app && this.fogContainer && this.fogTexture) {
        // Debug option changes should be immediate, not debounced
        if (this.fogUpdateTimeout) {
          clearTimeout(this.fogUpdateTimeout);
          this.fogUpdateTimeout = undefined;
        }
        this.updateFogForViewport();
      }
    });
  }

  async ngOnInit() {
    await this.initPixi();
    await this.loadTextures();
    this.updateMap(this.map().tiles);
  }

  ngOnDestroy() {
    // Clean up performance timers
    if (this.fogUpdateTimeout) {
      clearTimeout(this.fogUpdateTimeout);
    }

    // Clean up tracked dynamic sprites
    if (this.playerIndicatorCleanup) {
      this.playerIndicatorCleanup();
    }
    this.travelVisualizationCleanups.forEach((cleanup) => cleanup());

    // Clean up fog sprites properly
    this.clearFogSprites();

    // Clean up all textures to prevent memory leaks
    // Note: We don't destroy the global fog texture since it's shared across the app
    if (this.checkTexture) {
      this.checkTexture.destroy(true);
    }
    if (this.xTexture) {
      this.xTexture.destroy(true);
    }

    this.resizeObserver?.disconnect();
    this.app?.destroy(true);
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
    this.fogContainer = containers.fogContainer;
    this.playerIndicatorContainer = containers.playerIndicatorContainer;
    this.travelVisualizationContainer = containers.travelVisualizationContainer;
    this.mapContainer.cullable = true;

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

    this.setupMouseDragging();
  }

  private setupMouseDragging() {
    if (
      !this.app ||
      !this.mapContainer ||
      !this.fogContainer ||
      !this.playerIndicatorContainer ||
      !this.travelVisualizationContainer
    )
      return;

    pixiDragSetup({
      app: this.app,
      containers: [
        this.mapContainer,
        this.fogContainer,
        this.playerIndicatorContainer,
        this.travelVisualizationContainer,
      ],
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

      // Get the singleton fog texture (will recreate if context was lost)
      this.fogTexture = pixiTextureFogGet();
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
      this.updateMap(this.map().tiles);

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
    // Clear fog sprites
    this.clearFogSprites();

    // Clear node sprites
    Object.values(this.nodeSprites).forEach((spriteData) => {
      if (spriteData.terrain) {
        this.mapContainer?.removeChild(spriteData.terrain);
        spriteData.terrain.destroy();
      }
      if (spriteData.object) {
        this.mapContainer?.removeChild(spriteData.object);
        spriteData.object.destroy();
      }
      if (spriteData.claimIndicator) {
        this.mapContainer?.removeChild(spriteData.claimIndicator);
        spriteData.claimIndicator.destroy();
      }
      if (spriteData.debugText) {
        this.mapContainer?.removeChild(spriteData.debugText);
        spriteData.debugText.destroy();
      }
      if (spriteData.levelIndicator) {
        this.mapContainer?.removeChild(spriteData.levelIndicator);
        spriteData.levelIndicator.destroy();
      }
    });
    this.nodeSprites = {};

    // Clear other dynamic sprites
    if (this.playerIndicatorCleanup) {
      this.playerIndicatorCleanup();
      this.playerIndicatorCleanup = undefined;
    }
    this.travelVisualizationCleanups.forEach((cleanup) => cleanup());
    this.travelVisualizationCleanups = [];
  }

  private updateMap(mapData: MapTileData[][]) {
    if (
      !this.mapContainer ||
      !this.playerIndicatorContainer ||
      !this.fogContainer
    )
      return;

    // Clean up previous player indicator before clearing container
    if (this.playerIndicatorCleanup) {
      this.playerIndicatorCleanup();
      this.playerIndicatorCleanup = undefined;
    }

    this.mapContainer.removeChildren();
    this.clearFogSprites();
    this.playerIndicatorContainer.removeChildren();
    this.nodeSprites = {};
    this.fogSprites = {};

    mapData.forEach((row) => {
      row.forEach(({ x, y, nodeData, tileSprite }) => {
        this.createNodeSprites(x, y, nodeData, tileSprite);
        this.createFogSprite(x, y);
      });
    });
  }

  private updateSingleNode(
    worldX: number,
    worldY: number,
    updatedNode: WorldLocation,
  ) {
    if (!this.mapContainer || !this.fogContainer) return;

    const camera = this.camera();
    const relativeX = worldX - Math.floor(camera.x);
    const relativeY = worldY - Math.floor(camera.y);

    // Check if the node is within the current viewport
    if (
      relativeX >= 0 &&
      relativeX < this.nodeWidth() &&
      relativeY >= 0 &&
      relativeY < this.nodeHeight()
    ) {
      const nodeKey = `${relativeX}-${relativeY}`;

      // Remove existing sprite if it exists
      const existingSprite = this.nodeSprites[nodeKey];
      if (existingSprite) {
        this.loggerService.debug(
          'PixiMap',
          `Removing existing sprite for node ${worldX},${worldY}`,
        );

        // Remove and destroy all sprite components
        if (existingSprite.terrain) {
          this.mapContainer.removeChild(existingSprite.terrain);
          existingSprite.terrain.destroy();
        }
        if (existingSprite.object) {
          this.mapContainer.removeChild(existingSprite.object);
          existingSprite.object.destroy();
        }
        if (existingSprite.claimIndicator) {
          this.mapContainer.removeChild(existingSprite.claimIndicator);
          existingSprite.claimIndicator.destroy();
        }
        if (existingSprite.debugText) {
          this.mapContainer.removeChild(existingSprite.debugText);
          existingSprite.debugText.destroy();
        }
        if (existingSprite.levelIndicator) {
          this.mapContainer.removeChild(existingSprite.levelIndicator);
          existingSprite.levelIndicator.destroy();
        }

        delete this.nodeSprites[nodeKey];
      }

      // Create new sprite with updated data
      this.loggerService.debug(
        'PixiMap',
        `Creating updated sprite for node ${worldX},${worldY}`,
      );
      // Get the correct tile sprite for this world position
      const tileSprite = spriteGetForPosition(worldX, worldY);
      this.createNodeSprites(relativeX, relativeY, updatedNode, tileSprite);

      // When a node's claimed status changes, we need to refresh fog for the entire visible area
      // because this node might now reveal or hide areas due to its revelation radius
      this.updateFogForViewport();
    }
  }

  private createNodeSprites(
    x: number,
    y: number,
    nodeData: WorldLocation,
    tileSprite: string,
  ) {
    if (!this.mapContainer) return;

    const camera = this.camera();
    const worldX = Math.floor(camera.x) + x;
    const worldY = Math.floor(camera.y) + y;

    // Always get fresh node data to ensure we have the latest claim status
    const currentNodeData = locationGet(worldX, worldY);
    const isRevealed =
      getOption('debugDisableFogOfWar') ||
      fogIsPositionRevealed(worldX, worldY);

    const nodeKey = `${x}-${y}`;
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
      if (!isRevealed && spriteData.object) {
        spriteData.object.interactive = false;
        spriteData.object.cursor = 'default';
      }

      // Hide level indicator for unrevealed nodes
      if (!isRevealed && spriteData.levelIndicator) {
        spriteData.levelIndicator.visible = false;
      }

      this.nodeSprites[nodeKey] = spriteData;
    }
  }

  private updateFogForViewport() {
    if (!this.fogContainer) return;

    // If fog of war is disabled in debug options, clear all fog and return
    if (getOption('debugDisableFogOfWar')) {
      this.clearFogSprites();
      return;
    }

    // Ensure we have a valid fog texture before updating
    if (!this.fogTexture || this.fogTexture.destroyed) {
      this.fogTexture = pixiTextureFogGet();
    }

    if (!this.fogTexture) {
      this.loggerService.error(
        'PixiMap',
        'Could not create fog texture for viewport update',
      );
      return;
    }

    // Use incremental update instead of clearing all sprites
    this.updateFogSpritesIncremental();
  }

  private updateFogSpritesIncremental() {
    if (!this.fogContainer) return;

    const camera = this.camera();
    const currentViewportKeys = new Set<string>();

    // Determine which fog sprites should exist in the current viewport
    for (let x = 0; x < this.nodeWidth(); x++) {
      for (let y = 0; y < this.nodeHeight(); y++) {
        const worldX = Math.floor(camera.x) + x;
        const worldY = Math.floor(camera.y) + y;
        const spriteKey = `${x}-${y}`;

        currentViewportKeys.add(spriteKey);

        // Check if position should have fog
        if (!fogIsPositionRevealed(worldX, worldY)) {
          // Create sprite if it doesn't exist
          if (!this.fogSprites[spriteKey]) {
            this.createFogSpriteOptimized(x, y, spriteKey);
          }
        } else {
          // Remove sprite if position is now revealed
          this.removeFogSprite(spriteKey);
        }
      }
    }

    // Remove sprites that are outside the current viewport
    Object.keys(this.fogSprites).forEach((spriteKey) => {
      if (!currentViewportKeys.has(spriteKey)) {
        this.removeFogSprite(spriteKey);
      }
    });
  }

  private createFogSpriteOptimized(x: number, y: number, spriteKey: string) {
    if (!this.fogContainer || !this.fogTexture) return;

    try {
      const fogSprite = new Sprite(this.fogTexture);

      // Use 64x64 to match the tile size
      fogSprite.x = x * 64;
      fogSprite.y = y * 64;
      fogSprite.width = 64;
      fogSprite.height = 64;

      this.fogContainer.addChild(fogSprite);
      this.fogSprites[spriteKey] = fogSprite;
    } catch (error) {
      this.loggerService.error(
        'PixiMap',
        'Failed to create optimized fog sprite:',
        error,
      );
      // If texture creation fails, try to refresh fog texture
      this.fogTexture = pixiTextureFogGet();
    }
  }

  private removeFogSprite(spriteKey: string) {
    const sprite = this.fogSprites[spriteKey];
    if (sprite && this.fogContainer) {
      this.fogContainer.removeChild(sprite);
      sprite.destroy();
      delete this.fogSprites[spriteKey];
    }
  }

  private clearFogSprites() {
    if (!this.fogContainer) return;

    // Use the optimized removal method for each sprite
    Object.keys(this.fogSprites).forEach((spriteKey) => {
      this.removeFogSprite(spriteKey);
    });

    // Ensure container is clean
    this.fogContainer.removeChildren();
  }

  private createFogSprite(x: number, y: number) {
    if (!this.fogContainer) return;

    // If fog of war is disabled in debug options, don't create fog sprites
    if (getOption('debugDisableFogOfWar')) return;

    // Ensure we have a valid fog texture, recreate if destroyed
    if (!this.fogTexture || this.fogTexture.destroyed) {
      this.fogTexture = pixiTextureFogGet();
    }

    if (!this.fogTexture) return;

    const camera = this.camera();
    const worldX = Math.floor(camera.x) + x;
    const worldY = Math.floor(camera.y) + y;
    const spriteKey = `${x}-${y}`;

    // Only render fog if the position is not revealed
    if (!fogIsPositionRevealed(worldX, worldY)) {
      // Don't recreate if sprite already exists
      if (this.fogSprites[spriteKey]) return;

      try {
        const fogSprite = new Sprite(this.fogTexture);

        // Use 64x64 to match the tile size
        fogSprite.x = x * 64;
        fogSprite.y = y * 64;
        fogSprite.width = 64;
        fogSprite.height = 64;

        this.fogContainer.addChild(fogSprite);
        this.fogSprites[spriteKey] = fogSprite;
      } catch (error) {
        this.loggerService.error(
          'PixiMap',
          'Failed to create fog sprite:',
          error,
        );
        // If texture creation fails, try to refresh fog texture
        this.fogTexture = pixiTextureFogGet();
      }
    } else {
      // Remove fog sprite if position is now revealed
      const existingSprite = this.fogSprites[spriteKey];
      if (existingSprite) {
        this.fogContainer.removeChild(existingSprite);
        existingSprite.destroy();
        delete this.fogSprites[spriteKey];
      }
    }
  }

  private updatePlayerIndicators() {
    if (!this.playerIndicatorContainer || !this.app) return;

    // Clean up previous player indicator
    if (this.playerIndicatorCleanup) {
      this.playerIndicatorCleanup();
      this.playerIndicatorCleanup = undefined;
    }

    const camera = this.camera();
    const heroPosition = this.position();

    const relativeX = heroPosition.x - Math.floor(camera.x);
    const relativeY = heroPosition.y - Math.floor(camera.y);

    // Only show indicator if it's within the visible viewport
    if (
      relativeX >= 0 &&
      relativeX < this.nodeWidth() &&
      relativeY >= 0 &&
      relativeY < this.nodeHeight()
    ) {
      const playerIndicator = pixiIndicatorNodePlayerAtLocationCreate(
        relativeX,
        relativeY,
        this.playerIndicatorContainer,
      );
      this.playerIndicatorCleanup = playerIndicator.cleanup;
    }
  }

  private updateTravelVisualization() {
    if (!this.travelVisualizationContainer || !this.app) return;

    // Clean up previous travel visualization sprites
    this.travelVisualizationCleanups.forEach((cleanup) => cleanup());
    this.travelVisualizationCleanups = [];

    const travelProgress = travelVisualizationProgress();
    if (!travelProgress.isActive) return;

    const { fromPosition, toPosition, interpolatedPosition } = travelProgress;

    // Convert world coordinates to relative coordinates based on current camera
    // Use Math.floor on camera position to match map grid generation logic
    const camera = this.camera();
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
      this.travelVisualizationContainer,
    );
    this.travelVisualizationCleanups.push(travelLine.cleanup);

    // Show traveling hero sprite at interpolated position using relative coordinates
    const partyLeader = this.firstHero();
    if (partyLeader && this.heroTextures[partyLeader.sprite]) {
      const travelingHero = pixiIndicatorHeroTravelCreate(
        relativeInterpolatedX,
        relativeInterpolatedY,
        this.heroTextures[partyLeader.sprite],
        this.travelVisualizationContainer,
      );
      this.travelVisualizationCleanups.push(travelingHero.cleanup);
    }
  }

  private investigateLocation(nodeData: WorldLocation) {
    showLocationMenu.set(nodeData);
  }
}
