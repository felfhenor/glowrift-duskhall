import { DecimalPipe } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AtlasAnimationComponent } from '@components/atlas-animation/atlas-animation.component';
import { ModalComponent } from '@components/modal/modal.component';
import { PanelDuskmoteShopComponent } from '@components/panel-duskmote-shop/panel-duskmote-shop.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { SFXDirective } from '@directives/sfx.directive';
import {
  ascendCopyData,
  ascendSetCopiedData,
  closeAllMenus,
  currencyGet,
  currencyHasAmount,
  discordSetStatus,
  gameReset,
  gamestate,
  getEntriesByType,
  heroPickSpriteByName,
  heroUpdateData,
  jobUnlocked,
  setWorldConfig,
  setWorldSeed,
  showDuskmoteShop,
} from '@helpers';
import type { JobId, LocationType, WorldConfigContent } from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { sum } from 'es-toolkit/compat';
import * as romans from 'romans';

@Component({
  selector: 'app-game-setup-world',
  imports: [
    AnalyticsClickDirective,
    SweetAlert2Module,
    AtlasAnimationComponent,
    SFXDirective,
    FormsModule,
    TippyDirective,
    DecimalPipe,
    ModalComponent,
    PanelDuskmoteShopComponent,
  ],
  templateUrl: './game-setup-world.component.html',
  styleUrl: './game-setup-world.component.scss',
})
export class GameSetupWorldComponent implements OnInit {
  private router = inject(Router);

  public readonly allWorldSizes =
    getEntriesByType<WorldConfigContent>('worldconfig');

  public heroNames = [
    signal<string>('Terrus'),
    signal<string>('Ignatius'),
    signal<string>('Aquara'),
    signal<string>('Zephyra'),
  ];

  public heroJobs = [
    signal<string>('Earth Mage'),
    signal<string>('Fire Mage'),
    signal<string>('Water Mage'),
    signal<string>('Air Mage'),
  ];

  public ascensionRoman = computed(() =>
    gamestate().duskmote.numAscends > 0
      ? romans.romanize(gamestate().duskmote.numAscends)
      : '',
  );
  public duskmoteAmount = computed(() => currencyGet('Duskmote'));
  public shouldShowDuskmoteShop = computed(
    () =>
      currencyHasAmount('Duskmote', 1) || gamestate().meta.isCurrentlyAscending,
  );
  public isShowingDuskmoteShop = computed(() => showDuskmoteShop());

  public allJobs = computed(() => jobUnlocked());

  public readonly heroSprites = [
    computed(() => heroPickSpriteByName(this.heroNames[0]())),
    computed(() => heroPickSpriteByName(this.heroNames[1]())),
    computed(() => heroPickSpriteByName(this.heroNames[2]())),
    computed(() => heroPickSpriteByName(this.heroNames[3]())),
  ];

  public selectedWorldSize = signal<WorldConfigContent>(this.allWorldSizes[2]);
  public isGeneratingWorld = signal<boolean>(false);
  public worldSeed = signal<string | null>(null);

  public nodeCounts = computed(() => {
    const config = this.selectedWorldSize();
    return {
      min: sum(
        Object.keys(config.nodeCount).map(
          (key) => config.nodeCount[key as LocationType].min,
        ),
      ),
      max: sum(
        Object.keys(config.nodeCount).map(
          (key) => config.nodeCount[key as LocationType].max,
        ),
      ),
    };
  });

  ngOnInit() {
    discordSetStatus({
      state: 'Starting a new game...',
    });
  }

  public async createWorld() {
    closeAllMenus();

    const copyData = ascendCopyData();

    gameReset();
    setWorldSeed(this.worldSeed());
    setWorldConfig(this.selectedWorldSize());

    for (let h = 0; h < 4; h++) {
      const hero = gamestate().hero.heroes[h];
      hero.name = this.heroNames[h]();
      hero.sprite = this.heroSprites[h]();
      hero.jobId = this.heroJobs[h]() as JobId;

      heroUpdateData(hero);
    }

    ascendSetCopiedData(copyData);

    await this.router.navigate(['/setup', 'generate']);
  }

  public renameHero(index: number, name: string): void {
    this.heroNames[index].set(name);
  }

  public showDuskmoteShop() {
    showDuskmoteShop.set(true);
  }

  public closeDuskmoteShop() {
    showDuskmoteShop.set(false);
  }
}
