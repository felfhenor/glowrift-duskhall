import { HttpClient } from '@angular/common/http';
import {
  computed,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  allContentById,
  allIdsByName,
  ensureContent,
  setAllContentById,
  setAllIdsByName,
} from '@helpers';
import { Content, ContentType } from '@interfaces';
import { LoggerService } from '@services/logger.service';
import { MetaService } from '@services/meta.service';
import { forkJoin, Observable } from 'rxjs';

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

  public artAtlases = signal<
    Record<
      string,
      Record<string, { x: number; y: number; width: number; height: number }>
    >
  >({});

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

  private toJSONURL(key: string): string {
    return this.toCacheBustURL(`./json/${key}.json`);
  }

  private loadArt() {
    const spritesheetsToLoad = [
      'accessory',
      'armor',
      'enemy',
      'hero',
      'skill',
      'trinket',
      'talent',
      'weapon',
      'world-object',
      'world-terrain',
    ];

    forkJoin(
      spritesheetsToLoad.map((s) =>
        this.http.get(this.toCacheBustURL(`./art/spritesheets/${s}.json`)),
      ),
    ).subscribe((allAtlases) => {
      const atlasesByName = spritesheetsToLoad.reduce(
        (prev, cur, idx) => ({
          ...prev,
          [cur]: allAtlases[idx],
        }),
        {},
      );

      this.artAtlases.set(atlasesByName);
      this.hasLoadedAtlases.set(true);
      this.logger.info('Content:LoadArt', 'Loaded atlases.');
    });

    this.artSignals = spritesheetsToLoad.map(() => signal<boolean>(false));

    const artImageHash: Record<string, HTMLImageElement> = {};

    spritesheetsToLoad.forEach((sheet, idx) => {
      const img = new Image();
      img.src = `art/spritesheets/${sheet}.png`;
      this.artSignals[idx].set(false);
      img.onload = async () => {
        artImageHash[sheet] = img;

        this.artImages.set(artImageHash);
        this.artSignals[idx].set(true);

        this.logger.info('Content:LoadArt', `Loaded sheet: ${sheet}`);
      };
    });
  }

  private loadJSON() {
    const contentTypeObject: {
      [key in ContentType]: undefined;
    } = {
      worldconfig: undefined,
      currency: undefined,
      guardian: undefined,
      skill: undefined,
      accessory: undefined,
      armor: undefined,
      trinket: undefined,
      weapon: undefined,
      festival: undefined,
      statuseffect: undefined,
      talent: undefined,
      talenttree: undefined,
    };
    const allJsons = Object.keys(contentTypeObject);

    const jsonMaps = allJsons.reduce(
      (prev, cur) => {
        prev[cur] = this.http.get<Content[]>(this.toJSONURL(cur));
        return prev;
      },
      {} as Record<string, Observable<Content[]>>,
    );

    forkJoin(jsonMaps).subscribe((assets) => {
      this.unfurlAssets(assets as unknown as Record<string, Content[]>);

      this.logger.info(
        'Content:LoadJSON',
        `Content loaded: ${allJsons.join(', ')}`,
      );
      this.hasLoadedData.set(true);
    });
  }

  private unfurlAssets(assets: Record<string, Content[]>) {
    const allIdsByNameAssets: Map<string, string> = allIdsByName();
    const allEntriesByIdAssets: Map<string, Content> = allContentById();

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
