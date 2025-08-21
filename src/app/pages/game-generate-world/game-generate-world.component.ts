import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { gameStart } from '@helpers/game-init';
import { isSetup } from '@helpers/setup';
import {
  cancelWorldGeneration,
  currentWorldGenStatus,
} from '@helpers/worldgen';

@Component({
  selector: 'app-game-generate-world',
  imports: [],
  templateUrl: './game-generate-world.component.html',
  styleUrl: './game-generate-world.component.scss',
})
export class GameGenerateWorldComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);

  public worldGenStatus = computed(() => currentWorldGenStatus());

  constructor() {
    effect(() => {
      const isReady = isSetup();
      if (isReady) {
        this.router.navigate(['/game']);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(async () => {
      await gameStart();
    }, 100);
  }

  ngOnDestroy() {
    cancelWorldGeneration();
  }
}
