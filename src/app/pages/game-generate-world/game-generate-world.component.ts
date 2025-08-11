import type { AfterViewInit, OnDestroy } from '@angular/core';
import { Component, computed, inject } from '@angular/core';
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

  ngAfterViewInit() {
    setTimeout(async () => {
      await gameStart();

      if (isSetup()) {
        this.router.navigate(['/game']);
      }
    }, 100);
  }

  ngOnDestroy() {
    cancelWorldGeneration();
  }
}
