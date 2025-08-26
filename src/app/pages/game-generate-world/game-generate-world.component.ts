import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { gameStart } from '@helpers/game-init';
import { isSetup } from '@helpers/setup';
import {
  cancelWorldGeneration,
  currentWorldGenStatus,
} from '@helpers/worldgen';
import { SoundService } from '@services/sound.service';

@Component({
  selector: 'app-game-generate-world',
  imports: [],
  templateUrl: './game-generate-world.component.html',
  styleUrl: './game-generate-world.component.scss',
})
export class GameGenerateWorldComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);
  private soundService = inject(SoundService);

  public worldGenStatus = computed(() => currentWorldGenStatus());

  constructor() {
    effect(() => {
      const isReady = isSetup();
      if (isReady) {
        this.router.navigate(['/game']);
        this.soundService.stopSFX();
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(async () => {
      this.soundService.playSound('loading', 1);
      await gameStart();
    }, 100);
  }

  ngOnDestroy() {
    cancelWorldGeneration();
  }
}
