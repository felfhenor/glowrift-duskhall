import type { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Component, computed, effect, inject, viewChild } from '@angular/core';
import {
  createClaimIndicatorTextures,
  createGameMapContainers,
  createNodeSprites,
  createPlayerIndicator,
  createTravelingHeroIndicator,
  createTravelLine,
  gamestate,
  generateMapGrid,
  getOption,
  getSpriteFromNodeType,
  getTravelProgress,
  initializePixiApp,
  isTraveling,
  loadGameMapTextures,
  setupMapDragging,
  setupResponsiveCanvas,
  showLocationMenu,
  windowHeightTiles,
  windowWidthTiles,
} from '@helpers';
import type { MapTileData, WorldLocation } from '@interfaces';
import type { NodeSpriteData } from '@interfaces/sprite';
import type { LoadedTextures } from '@interfaces/texture';
import { ContentService } from '@services/content.service';
import { LoggerService } from '@services/logger.service';
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

  public nodeWidth = computed(() =>
    Math.min(gamestate().world.config.width, windowWidthTiles() + 1),
  );

  public nodeHeight = computed(() =>
    Math.min(gamestate().world.config.height, windowHeightTiles() + 1),
  );

  public camera = computed(() => gamestate().camera);

  public debugMapNodePositions = computed(() =>
    getOption('debugMapNodePositions'),
  );

  public firstHero = computed(() => gamestate().hero.heroes[0]);

  public position = computed(() => gamestate().hero.position);

  public map = computed(() => {
    const camera = this.camera();
    const width = this.nodeWidth();
    const height = this.nodeHeight();
    const world = gamestate().world;

    return generateMapGrid(
      camera.x,
      camera.y,
      width,
      height,
      world.config.width,
      world.config.height,
    );
  });

  constructor() {
    effect(() => {
      const mapData = this.map();
      // debugMapNodePositions is tracked automatically by the effect
      this.debugMapNodePositions();
      if (this.app && this.mapContainer) {
        this.updateMap(mapData.tiles);
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
  }

  async ngOnInit() {
    await this.initPixi();
    await this.loadTextures();
    this.updateMap(this.map().tiles);
  }

  ngOnDestroy() {
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
        'art/spritesheets/hero.png',
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

    this.mapContainer.removeChildren();
    this.playerIndicatorContainer.removeChildren();
    this.nodeSprites = {};

    mapData.forEach((row) => {
      row.forEach(({ x, y, nodeData, tileSprite }) => {
        this.createNodeSprites(x, y, nodeData, tileSprite);
      });
    });

    this.updatePlayerIndicators();
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
      createPlayerIndicator(
        relativeX,
        relativeY,
        this.playerIndicatorContainer,
        this.app.ticker,
      );
    }
  }

  private updateTravelVisualization() {
    if (!this.travelVisualizationContainer || !this.app) return;

    // Clear previous travel visualization
    this.travelVisualizationContainer.removeChildren();

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
    createTravelLine(
      relativeFromX,
      relativeFromY,
      relativeToX,
      relativeToY,
      this.travelVisualizationContainer,
    );

    // Show traveling hero sprite at interpolated position using relative coordinates
    const partyLeader = this.firstHero();
    if (partyLeader && this.heroTextures[partyLeader.sprite]) {
      createTravelingHeroIndicator(
        relativeInterpolatedX,
        relativeInterpolatedY,
        this.heroTextures[partyLeader.sprite],
        this.travelVisualizationContainer,
        this.app.ticker,
      );
    }
  }

  private investigateLocation(nodeData: WorldLocation) {
    showLocationMenu.set(nodeData);
  }
}
