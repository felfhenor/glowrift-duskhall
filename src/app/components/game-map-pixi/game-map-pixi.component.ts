import type { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Component, computed, effect, inject, viewChild } from '@angular/core';
import {
  clearWorldNodeChanges,
  createClaimIndicatorTextures,
  createGameMapContainers,
  createNodeSprites,
  createPlayerAtLocationIndicator,
  createTravelingHeroIndicator,
  createTravelLine,
  gamestate,
  getOption,
  getSpriteForPosition,
  getSpriteFromNodeType,
  getTravelProgress,
  getWorldNodeChanges,
  initializePixiApp,
  isTraveling,
  loadGameMapTextures,
  setupMapDragging,
  setupResponsiveCanvas,
  showLocationMenu,
} from '@helpers';
import type { MapTileData, WorldLocation } from '@interfaces';
import type { NodeSpriteData } from '@interfaces/sprite';
import type { LoadedTextures } from '@interfaces/texture';
import { ContentService } from '@services/content.service';
import { LoggerService } from '@services/logger.service';
import { MapStateService } from '@services/map-state.service';
import type { Application, Container, Texture } from 'pixi.js';

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
  private terrainTextures: LoadedTextures = {};
  private objectTextures: LoadedTextures = {};
  private heroTextures: LoadedTextures = {};
  private checkTexture?: Texture;
  private xTexture?: Texture;
  private nodeSprites: Record<string, NodeSpriteData> = {};
  private playerIndicatorContainer?: Container;
  private travelVisualizationContainer?: Container;
  private resizeObserver?: ResizeObserver;

  // Track dynamic sprites for proper cleanup
  private playerIndicatorCleanup?: () => void;
  private travelVisualizationCleanups: Array<() => void> = [];

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
      const changes = getWorldNodeChanges();

      if (changes.length > 0 && this.app && this.mapContainer) {
        this.loggerService.debug(
          'GameMapPixi',
          `Processing ${changes.length} surgical node updates`,
        );

        // Process each change and update specific nodes
        changes.forEach((change) => {
          this.updateSingleNode(change.worldX, change.worldY, change.node);
        });

        // Clear the changes after processing
        clearWorldNodeChanges();
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
  }

  async ngOnInit() {
    await this.initPixi();
    await this.loadTextures();
    this.updateMap(this.map().tiles);
  }

  ngOnDestroy() {
    // Clean up tracked dynamic sprites
    if (this.playerIndicatorCleanup) {
      this.playerIndicatorCleanup();
    }
    this.travelVisualizationCleanups.forEach((cleanup) => cleanup());

    this.resizeObserver?.disconnect();
    this.app?.destroy(true);
  }

  private async initPixi() {
    this.app = await initializePixiApp(this.pixiContainer()?.nativeElement, {
      width: this.pixiContainer()?.nativeElement.clientWidth,
      height: this.pixiContainer()?.nativeElement.clientHeight,
      backgroundAlpha: 0,
      antialias: false,
    });

    const containers = createGameMapContainers(this.app);
    this.mapContainer = containers.mapContainer;
    this.playerIndicatorContainer = containers.playerIndicatorContainer;
    this.travelVisualizationContainer = containers.travelVisualizationContainer;
    this.mapContainer.cullable = true;

    this.resizeObserver = setupResponsiveCanvas(
      this.app,
      this.pixiContainer()?.nativeElement,
    );

    this.setupMouseDragging();
  }

  private setupMouseDragging() {
    if (
      !this.app ||
      !this.mapContainer ||
      !this.playerIndicatorContainer ||
      !this.travelVisualizationContainer
    )
      return;

    setupMapDragging({
      app: this.app,
      containers: [
        this.mapContainer,
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
      const textures = await loadGameMapTextures(
        artAtlases['world-terrain'],
        artAtlases['world-object'],
      );
      this.terrainTextures = textures.terrainTextures;
      this.objectTextures = textures.objectTextures;

      // Load hero textures
      const { loadTexturesFromAtlas } = await import(
        '@helpers/pixi-texture-loader'
      );
      this.heroTextures = await loadTexturesFromAtlas(
        'art/spritesheets/hero.webp',
        artAtlases['hero'],
      );

      const claimTextures = createClaimIndicatorTextures();
      this.checkTexture = claimTextures.checkTexture;
      this.xTexture = claimTextures.xTexture;
    } catch (error) {
      this.loggerService.error('Failed to load textures:', error);
    }
  }

  private updateMap(mapData: MapTileData[][]) {
    if (!this.mapContainer || !this.playerIndicatorContainer) return;

    // Clean up previous player indicator before clearing container
    if (this.playerIndicatorCleanup) {
      this.playerIndicatorCleanup();
      this.playerIndicatorCleanup = undefined;
    }

    this.mapContainer.removeChildren();
    this.playerIndicatorContainer.removeChildren();
    this.nodeSprites = {};

    mapData.forEach((row) => {
      row.forEach(({ x, y, nodeData, tileSprite }) => {
        this.createNodeSprites(x, y, nodeData, tileSprite);
      });
    });
  }

  private updateSingleNode(
    worldX: number,
    worldY: number,
    updatedNode: WorldLocation,
  ) {
    if (!this.mapContainer) return;

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
          'GameMapPixi',
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
        'GameMapPixi',
        `Creating updated sprite for node ${worldX},${worldY}`,
      );
      // Get the correct tile sprite for this world position
      const tileSprite = getSpriteForPosition(worldX, worldY);
      this.createNodeSprites(relativeX, relativeY, updatedNode, tileSprite);
    }
  }

  private createNodeSprites(
    x: number,
    y: number,
    nodeData: WorldLocation,
    tileSprite: string,
  ) {
    if (!this.mapContainer) return;

    const nodeKey = `${x}-${y}`;
    const spriteData = createNodeSprites(
      x,
      y,
      nodeData,
      tileSprite,
      getSpriteFromNodeType(nodeData.nodeType),
      this.terrainTextures,
      this.objectTextures,
      this.mapContainer,
      this.checkTexture,
      this.xTexture,
      (nodeData: WorldLocation) => this.investigateLocation(nodeData),
      this.debugMapNodePositions(),
    );

    if (spriteData) {
      this.nodeSprites[nodeKey] = spriteData;
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
      const playerIndicator = createPlayerAtLocationIndicator(
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

    const travelProgress = getTravelProgress();
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
    const travelLine = createTravelLine(
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
      const travelingHero = createTravelingHeroIndicator(
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
