import { effect, inject, Injectable, signal } from '@angular/core';
import type { Event } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';
import { gameloopShouldRun } from '@helpers';
import { SoundService } from '@services/sound.service';

@Injectable({
  providedIn: 'root',
})
export class BGMService {
  private router = inject(Router);
  private soundService = inject(SoundService);

  private lastPlace = signal<'menu' | 'game' | ''>('');
  private currentPlace = signal<'menu' | 'game' | ''>('');

  constructor() {
    effect(() => {
      this.currentPlace();
      this.soundService.allowAudioInteractions();

      this.playAppropriateBGM();
    });
  }

  init() {
    this.router.events.subscribe((event: Event) => {
      if (!(event instanceof NavigationEnd)) return;

      const isInGame = event.url.includes('/game');
      this.currentPlace.set(isInGame ? 'game' : 'menu');
    });
  }

  private playAppropriateBGM() {
    if (
      !this.currentPlace() ||
      !this.soundService.allowAudioInteractions() ||
      this.currentPlace() === this.lastPlace()
    )
      return;

    this.lastPlace.set(this.currentPlace());

    if (!gameloopShouldRun()) {
      this.soundService.playBGM('menu');
      return;
    }

    this.soundService.playBGM('game-casual');
  }
}
