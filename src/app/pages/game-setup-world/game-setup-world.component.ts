import type { OnInit } from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { AtlasAnimationComponent } from '@components/atlas-animation/atlas-animation.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { SFXDirective } from '@directives/sfx.directive';
import {
  closeAllMenus,
  gamestate,
  getEntriesByType,
  pickSpriteForHeroName,
  resetGame,
  setDiscordStatus,
  setWorldSeed,
  startGame,
  updateHeroData,
} from '@helpers';
import type { WorldConfigContent } from '@interfaces';

@Component({
  selector: 'app-game-setup-world',
  imports: [
    AnalyticsClickDirective,
    SweetAlert2Module,
    AtlasAnimationComponent,
    SFXDirective,
    FormsModule,
  ],
  templateUrl: './game-setup-world.component.html',
  styleUrl: './game-setup-world.component.scss',
})
export class GameSetupWorldComponent implements OnInit {
  private router = inject(Router);

  public readonly allWorldSizes =
    getEntriesByType<WorldConfigContent>('worldconfig');

  public heroNames = [
    signal<string>('Ignatius'),
    signal<string>('Aquara'),
    signal<string>('Terrus'),
    signal<string>('Zephyra'),
  ];

  public readonly heroSprites = [
    computed(() => pickSpriteForHeroName(this.heroNames[0]())),
    computed(() => pickSpriteForHeroName(this.heroNames[1]())),
    computed(() => pickSpriteForHeroName(this.heroNames[2]())),
    computed(() => pickSpriteForHeroName(this.heroNames[3]())),
  ];

  public selectedWorldSize = signal<WorldConfigContent>(this.allWorldSizes[0]);
  public isGeneratingWorld = signal<boolean>(false);
  public worldSeed = signal<string | null>(null);

  ngOnInit() {
    setDiscordStatus({
      state: 'Starting a new game...',
    });
  }

  public createWorld(): void {
    this.isGeneratingWorld.set(true);
    closeAllMenus();

    resetGame();
    setWorldSeed(this.worldSeed());

    for (let h = 0; h < 4; h++) {
      const heroId = gamestate().hero.heroes[h].id;
      updateHeroData(heroId, {
        name: this.heroNames[h](),
        sprite: this.heroSprites[h](),
      });
    }

    startGame(this.selectedWorldSize());

    this.router.navigate(['/game']);

    this.isGeneratingWorld.set(false);
  }

  public renameHero(index: number, name: string): void {
    this.heroNames[index].set(name);
  }
}
