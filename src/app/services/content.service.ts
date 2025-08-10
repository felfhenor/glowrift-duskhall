import { HttpClient } from '@angular/common/http';
import type { WritableSignal } from '@angular/core';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  allContentById,
  allIdsByName,
  ensureContent,
  setAllContentById,
  setAllIdsByName,
} from '@helpers';
import type { ContentType, IsContentItem } from '@interfaces';
import { LoggerService } from '@services/logger.service';
import { MetaService } from '@services/meta.service';
import { lastValueFrom } from 'rxjs';

type ArtAtlases = Record<
  string,
  Record<string, { x: number; y: number; width: number; height: number }>
>;

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private metaService = inject(MetaService);
  private logger = inject(LoggerService);
  private http = inject(HttpClient);

  private artSignals: Array<WritableSignal<boolean>> = [];
  public artImages = signal<Record<string, HTMLImageElement>>({});
  private hasLoadedArt = computed(() => this.artSignals.every((s) => s()));
  private hasLoadedAtlases = signal<boolean>(false);
  private hasLoadedData = signal<boolean>(false);

  public artAtlases = signal<ArtAtlases>({});

  public hasLoaded = computed(
    () =>
      this.hasLoadedArt() && this.hasLoadedData() && this.hasLoadedAtlases(),
  );

  async init() {
    this.loadJSON();
    this.loadArt();
  }

  private toCacheBustURL(url: string): string {
    return `${url}?v=${this.metaService.versionString()}`;
  }

  private async loadArt() {
    const req = this.http.get<ArtAtlases>(
      this.toCacheBustURL(`./art/spritesheets/all.json`),
    );

    const allAtlases = await lastValueFrom(req);

    this.artAtlases.set(allAtlases);
    this.logger.info('Content:LoadArt', 'Loaded atlases.');

    const spritesheetsToLoad = Object.keys(allAtlases);

    this.artSignals = spritesheetsToLoad.map(() => signal<boolean>(false));

    const artImageHash: Record<string, HTMLImageElement> = {};

    spritesheetsToLoad.forEach((sheet, idx) => {
      const img = new Image();
      img.src = `art/spritesheets/${sheet}.webp`;
      this.artSignals[idx].set(false);
      img.onload = async () => {
        artImageHash[sheet] = img;

        this.artImages.set(artImageHash);
        this.artSignals[idx].set(true);

        this.logger.info('Content:LoadArt', `Loaded sheet: ${sheet}`);
      };
    });

    this.hasLoadedAtlases.set(true);
  }

  private async loadJSON() {
    const req = this.http.get<Record<string, IsContentItem[]>>(
      this.toCacheBustURL(`./json/all.json`),
    );

    const assets = await lastValueFrom(req);

    this.unfurlAssets(assets);

    this.logger.info(
      'Content:LoadJSON',
      `Content loaded: ${Object.keys(assets).join(', ')}`,
    );
    this.hasLoadedData.set(true);
  }

  private unfurlAssets(assets: Record<string, IsContentItem[]>) {
    const allIdsByNameAssets: Map<string, string> = allIdsByName();
    const allEntriesByIdAssets: Map<string, IsContentItem> = allContentById();

    Object.keys(assets).forEach((subtype) => {
      Object.values(assets[subtype]).forEach((entry) => {
        entry.__type = subtype as ContentType;

        if (allIdsByNameAssets.has(entry.name)) {
          this.logger.warn(
            'Content',
            `"${entry.name}/${
              entry.id
            }" is a duplicate name to "${allIdsByNameAssets.get(
              entry.name,
            )}". Skipping...`,
          );
          return;
        }

        const dupe = allEntriesByIdAssets.get(entry.id);
        if (dupe) {
          this.logger.warn(
            'Content',
            `"${entry.name}/${entry.id}" is a duplicate id to "${dupe.name}/${dupe.id}". Skipping...`,
          );
          return;
        }

        const cleanedEntry = ensureContent(entry);

        allIdsByNameAssets.set(cleanedEntry.name, cleanedEntry.id);
        allEntriesByIdAssets.set(cleanedEntry.id, cleanedEntry);
      });
    });

    setAllIdsByName(allIdsByNameAssets);
    setAllContentById(allEntriesByIdAssets);
  }
}
