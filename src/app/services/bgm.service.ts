import { computed, effect, inject, Injectable, signal } from '@angular/core';
import type { Event } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';
import { gameloopShouldRun, getOption } from '@helpers';
import { SoundService } from '@services/sound.service';

@Injectable({
  providedIn: 'root',
})
export class BGMService {
  private router = inject(Router);
  private soundService = inject(SoundService);

  private lastPlace = signal<'menu' | 'game' | ''>('');
  private currentPlace = signal<'menu' | 'game' | ''>('');

  private lastBGM = signal<boolean>(getOption('bgmPlay'));
  private curBGM = computed(() => getOption('bgmPlay'));

  constructor() {
    effect(() => {
      this.currentPlace();
      this.soundService.allowAudioInteractions();
      this.curBGM();

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
    if (!this.currentPlace() || !this.soundService.allowAudioInteractions())
      return;

    if (
      this.currentPlace() === this.lastPlace() &&
      this.curBGM() === this.lastBGM()
    )
      return;

    this.lastPlace.set(this.currentPlace());
    this.lastBGM.set(this.curBGM());

    if (!gameloopShouldRun()) {
      this.soundService.playBGM('menu');
      return;
    }

    this.soundService.playBGM('game-casual');
  }
}
