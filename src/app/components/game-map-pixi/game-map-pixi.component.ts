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
  private intersectionObserver?: IntersectionObserver;

  // Track dynamic sprites for proper cleanup
  private playerIndicatorCleanup?: () => void;
  private travelVisualizationCleanups: Array<() => void> = [];

  // Performance optimization: debounce fog updates during camera movement
  private fogUpdateTimeout?: ReturnType<typeof setTimeout>;

  // Performance optimization: track last camera position to avoid unnecessary updates
  private lastCameraX = 0;
  private lastCameraY = 0;
  private lastFogUpdateCameraX = 0;
  private lastFogUpdateCameraY = 0;

  // Performance optimization: fog sprite pool for reuse
  private fogSpritePool: Sprite[] = [];
  private readonly MAX_FOG_POOL_SIZE = 200;

  // Performance optimization: reduce update frequency
  private readonly FOG_UPDATE_DEBOUNCE_MS = 100; // Increased from 16ms
  private readonly CAMERA_MOVEMENT_THRESHOLD = 0.1; // Only update if camera moved significantly

  // Performance optimization: periodic cleanup to prevent memory leaks
  private memoryCleanupInterval?: ReturnType<typeof setInterval>;
  private readonly MEMORY_CLEANUP_INTERVAL_MS = 30000; // 30 seconds

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
      const position = this.position(); // Watch position changes
      const camera = this.camera(); // Watch camera changes for viewport calculations

      if (this.app && this.playerIndicatorContainer) {
        // Only update if camera or position changed significantly
        const deltaX = Math.abs(camera.x - this.lastCameraX);
        const deltaY = Math.abs(camera.y - this.lastCameraY);

        if (
          deltaX > this.CAMERA_MOVEMENT_THRESHOLD ||
          deltaY > this.CAMERA_MOVEMENT_THRESHOLD ||
          position.x !== this.lastCameraX ||
          position.y !== this.lastCameraY
        ) {
          this.updatePlayerIndicators();
          this.lastCameraX = camera.x;
          this.lastCameraY = camera.y;
        }
      }
    });

    // Separate effect for fog updates when camera changes - debounced for performance
    effect(() => {
      const camera = this.camera(); // Watch camera changes

      if (this.app && this.fogContainer && this.fogTexture) {
        // Only update if camera moved significantly to avoid excessive updates
        const deltaX = Math.abs(camera.x - this.lastFogUpdateCameraX);
        const deltaY = Math.abs(camera.y - this.lastFogUpdateCameraY);

        if (
          deltaX > this.CAMERA_MOVEMENT_THRESHOLD ||
          deltaY > this.CAMERA_MOVEMENT_THRESHOLD
        ) {
          // Clear existing timeout to debounce rapid camera changes
          if (this.fogUpdateTimeout) {
            clearTimeout(this.fogUpdateTimeout);
          }

          // Use longer debounce for better performance during dragging
          this.fogUpdateTimeout = setTimeout(() => {
            this.updateFogForViewport();
            this.lastFogUpdateCameraX = camera.x;
            this.lastFogUpdateCameraY = camera.y;
          }, this.FOG_UPDATE_DEBOUNCE_MS);
        }
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

    // Start periodic memory cleanup to prevent accumulation
    this.memoryCleanupInterval = setInterval(() => {
      this.performMemoryCleanup();
    }, this.MEMORY_CLEANUP_INTERVAL_MS);
  }

  /**
   * Performs periodic memory cleanup to prevent accumulation of orphaned sprites
   */
  private performMemoryCleanup() {
    // Clean up any destroyed sprites from the fog sprite pool
    this.fogSpritePool = this.fogSpritePool.filter(
      (sprite) => !sprite.destroyed,
    );

    // Clean up any orphaned fog sprites that might have invalid textures
    Object.keys(this.fogSprites).forEach((spriteKey) => {
      const sprite = this.fogSprites[spriteKey];
      if (
        sprite &&
        (sprite.destroyed || !sprite.texture || sprite.texture.destroyed)
      ) {
        this.loggerService.debug(
          'PixiMap',
          `Cleaning up orphaned fog sprite: ${spriteKey}`,
        );
        this.removeFogSprite(spriteKey);
      }
    });

    // Clean up any orphaned node sprites with invalid textures
    Object.keys(this.nodeSprites).forEach((nodeKey) => {
      const spriteData = this.nodeSprites[nodeKey];
      let needsCleanup = false;

      // Check if any sprite components are destroyed or have invalid textures
      if (
        spriteData.terrain &&
        (spriteData.terrain.destroyed ||
          !spriteData.terrain.texture ||
          spriteData.terrain.texture.destroyed)
      ) {
        needsCleanup = true;
      }
      if (spriteData.objectContainer && spriteData.objectContainer.destroyed) {
        needsCleanup = true;
      }

      if (needsCleanup) {
        this.loggerService.debug(
          'PixiMap',
          `Cleaning up orphaned node sprite: ${nodeKey}`,
        );
        // Remove the entire node sprite group
        this.cleanupNodeSprite(nodeKey);
      }
    });

    // Log memory usage for debugging
    this.loggerService.debug(
      'PixiMap',
      `Memory cleanup complete. Active sprites: fog=${Object.keys(this.fogSprites).length}, nodes=${Object.keys(this.nodeSprites).length}, pool=${this.fogSpritePool.length}`,
    );
  }

  /**
   * Clean up a single node sprite and all its components
   */
  private cleanupNodeSprite(nodeKey: string) {
    const spriteData = this.nodeSprites[nodeKey];
    if (!spriteData) return;

    // Clean up all sprite components
    if (spriteData.terrain) {
      this.mapContainer?.removeChild(spriteData.terrain);
      if (!spriteData.terrain.destroyed) {
        spriteData.terrain.destroy();
      }
    }
    if (spriteData.objectContainer) {
      this.mapContainer?.removeChild(spriteData.objectContainer);
      if (!spriteData.objectContainer.destroyed) {
        spriteData.objectContainer.destroy();
      }
    }
    if (spriteData.debugText) {
      this.mapContainer?.removeChild(spriteData.debugText);
      if (!spriteData.debugText.destroyed) {
        spriteData.debugText.destroy();
      }
    }

    delete this.nodeSprites[nodeKey];
  }

  ngOnDestroy() {
    // Clean up performance timers
    if (this.fogUpdateTimeout) {
      clearTimeout(this.fogUpdateTimeout);
    }

    // Clean up memory cleanup interval
    if (this.memoryCleanupInterval) {
      clearInterval(this.memoryCleanupInterval);
    }

    // Stop the ticker to save GPU resources
    if (this.app?.ticker) {
      this.app.ticker.stop();
    }

    // Clean up tracked dynamic sprites
    if (this.playerIndicatorCleanup) {
      this.playerIndicatorCleanup();
    }
    this.travelVisualizationCleanups.forEach((cleanup) => cleanup());

    // Clean up fog sprites properly
    this.clearFogSprites();

    // Clean up fog sprite pool
    this.fogSpritePool.forEach((sprite) => sprite.destroy());
    this.fogSpritePool = [];

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
    // Note: We don't destroy the global fog texture since it's shared across the app
    if (this.checkTexture && !this.checkTexture.destroyed) {
      this.checkTexture.destroy(true);
    }
    if (this.xTexture && !this.xTexture.destroyed) {
      this.xTexture.destroy(true);
    }

    // Clean up containers
    this.mapContainer?.removeChildren();
    this.fogContainer?.removeChildren();
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

    // Set up intersection observer to pause rendering when not visible
    this.setupVisibilityOptimization();

    this.setupMouseDragging();
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

    // Clear node sprites with comprehensive cleanup
    Object.values(this.nodeSprites).forEach((spriteData) => {
      if (spriteData.terrain) {
        this.mapContainer?.removeChild(spriteData.terrain);
        spriteData.terrain.destroy();
      }
      if (spriteData.objectContainer) {
        this.mapContainer?.removeChild(spriteData.objectContainer);
        spriteData.objectContainer.destroy();
      }
      if (spriteData.debugText) {
        this.mapContainer?.removeChild(spriteData.debugText);
        spriteData.debugText.destroy();
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

    // Force clear all containers to ensure no orphaned sprites
    this.mapContainer?.removeChildren();
    this.fogContainer?.removeChildren();
    this.playerIndicatorContainer?.removeChildren();
    this.travelVisualizationContainer?.removeChildren();
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

        // Use the centralized cleanup method
        this.cleanupNodeSprite(nodeKey);
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
      if (!isRevealed && spriteData.objectContainer) {
        spriteData.objectContainer.interactiveChildren = false;
        spriteData.objectContainer.cursor = 'default';
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
    const spritesToAdd: Array<{ x: number; y: number; spriteKey: string }> = [];
    const spritesToRemove: string[] = [];

    // Determine which fog sprites should exist in the current viewport
    for (let x = 0; x < this.nodeWidth(); x++) {
      for (let y = 0; y < this.nodeHeight(); y++) {
        const worldX = Math.floor(camera.x) + x;
        const worldY = Math.floor(camera.y) + y;
        const spriteKey = `${x}-${y}`;

        currentViewportKeys.add(spriteKey);

        // Check if position should have fog
        if (!fogIsPositionRevealed(worldX, worldY)) {
          // Queue sprite for creation if it doesn't exist
          if (!this.fogSprites[spriteKey]) {
            spritesToAdd.push({ x, y, spriteKey });
          }
        } else {
          // Queue sprite for removal if position is now revealed
          if (this.fogSprites[spriteKey]) {
            spritesToRemove.push(spriteKey);
          }
        }
      }
    }

    // Remove sprites that are outside the current viewport
    Object.keys(this.fogSprites).forEach((spriteKey) => {
      if (!currentViewportKeys.has(spriteKey)) {
        spritesToRemove.push(spriteKey);
      }
    });

    // Batch operations to reduce GPU state changes
    if (spritesToRemove.length > 0) {
      spritesToRemove.forEach((spriteKey) => this.removeFogSprite(spriteKey));
    }

    if (spritesToAdd.length > 0) {
      spritesToAdd.forEach(({ x, y, spriteKey }) => {
        this.createFogSpriteOptimized(x, y, spriteKey);
      });
    }
  }

  private createFogSpriteOptimized(x: number, y: number, spriteKey: string) {
    if (!this.fogContainer || !this.fogTexture || this.fogTexture.destroyed) {
      // Attempt to recreate fog texture if it's missing or destroyed
      this.fogTexture = pixiTextureFogGet();
      if (!this.fogTexture || this.fogTexture.destroyed) {
        this.loggerService.error(
          'PixiMap',
          'Cannot create fog sprite: fog texture is invalid',
        );
        return;
      }
    }

    try {
      // Try to reuse a sprite from the pool first
      let fogSprite = this.fogSpritePool.pop();

      if (!fogSprite || fogSprite.destroyed) {
        // Create new sprite only if pool is empty or sprite is destroyed
        fogSprite = new Sprite(this.fogTexture);
        fogSprite.width = 64;
        fogSprite.height = 64;
      } else {
        // Update texture in case it was recreated after context loss
        fogSprite.texture = this.fogTexture;
      }

      // Position the sprite
      fogSprite.x = x * 64;
      fogSprite.y = y * 64;
      fogSprite.visible = true;
      fogSprite.alpha = 1; // Ensure alpha is reset

      if (this.fogContainer) {
        this.fogContainer.addChild(fogSprite);
        this.fogSprites[spriteKey] = fogSprite;
      }
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

      // Return sprite to pool for reuse instead of destroying it
      if (
        this.fogSpritePool.length < this.MAX_FOG_POOL_SIZE &&
        !sprite.destroyed
      ) {
        sprite.visible = false; // Hide it while in pool
        // Reset any transforms that might have been applied
        sprite.alpha = 1;
        sprite.rotation = 0;
        sprite.scale.set(1);
        this.fogSpritePool.push(sprite);
      } else {
        // Pool is full or sprite is destroyed, destroy the sprite
        sprite.destroy();
      }

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
