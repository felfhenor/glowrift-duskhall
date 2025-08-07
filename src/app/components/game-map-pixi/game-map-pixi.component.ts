import type { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Component, computed, effect, inject, viewChild } from '@angular/core';
import {
  createClaimIndicatorTextures,
  createDestinationIndicator,
  createGameMapContainers,
  createNodeSprites,
  createPlayerIndicator,
  createTravelingHeroIndicator,
  createTravelLine,
  gamestate,
  generateMapGrid,
  getSpriteFromNodeType,
  getTravelProgress,
  initializePixiApp,
  isAtNode,
  isTravelingToPosition,
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
      if (this.app && this.mapContainer) {
        this.updateMap(mapData.tiles);
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
    if (!this.app || !this.mapContainer || !this.playerIndicatorContainer || !this.travelVisualizationContainer)
      return;

    setupMapDragging({
      app: this.app,
      containers: [this.mapContainer, this.playerIndicatorContainer, this.travelVisualizationContainer],
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
      const { loadTexturesFromAtlas } = await import('@helpers/pixi-texture-loader');
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
    if (!this.mapContainer || !this.playerIndicatorContainer || !this.travelVisualizationContainer) return;

    this.mapContainer.removeChildren();
    this.playerIndicatorContainer.removeChildren();
    this.travelVisualizationContainer.removeChildren();
    this.nodeSprites = {};

    mapData.forEach((row) => {
      row.forEach(({ x, y, nodeData, tileSprite }) => {
        this.createNodeSprites(x, y, nodeData, tileSprite);
      });
    });

    this.updatePlayerIndicators(mapData);
    this.updateTravelVisualization();
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
    );

    if (spriteData) {
      this.nodeSprites[nodeKey] = spriteData;
    }
  }

  private updatePlayerIndicators(mapData: MapTileData[][]) {
    if (!this.playerIndicatorContainer || !this.app) return;

    const travelProgress = getTravelProgress();

    mapData.forEach((row) => {
      row.forEach(({ x, y, nodeData }) => {
        // Show normal player indicator when at a node and not traveling
        if (!travelProgress.isActive && isAtNode(nodeData)) {
          createPlayerIndicator(
            x,
            y,
            this.playerIndicatorContainer!,
            this.app!.ticker,
          );
        }

        // Show destination indicator when this node is the travel target
        if (travelProgress.isActive && isTravelingToPosition({ x, y })) {
          createDestinationIndicator(
            x,
            y,
            this.playerIndicatorContainer!,
            this.app!.ticker,
          );
        }
      });
    });
  }

  private updateTravelVisualization() {
    if (!this.travelVisualizationContainer || !this.app) return;

    const travelProgress = getTravelProgress();
    if (!travelProgress.isActive) return;

    const { fromPosition, toPosition, interpolatedPosition } = travelProgress;

    // Draw travel line between source and destination
    createTravelLine(
      fromPosition.x,
      fromPosition.y,
      toPosition.x,
      toPosition.y,
      this.travelVisualizationContainer,
    );

    // Show traveling hero sprite at interpolated position
    const state = gamestate();
    const partyLeader = state.hero.heroes[0]; // Get party leader
    if (partyLeader && this.heroTextures[partyLeader.sprite]) {
      createTravelingHeroIndicator(
        interpolatedPosition.x,
        interpolatedPosition.y,
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
