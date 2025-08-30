import { computed, effect, inject, Injectable, signal } from '@angular/core';
import type { Event } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';
import { gameloopShouldRun, getOption, locationGetCurrent } from '@helpers';
import type { BGM } from '@interfaces/sfx';
import { SoundService } from '@services/sound.service';

@Injectable({
  providedIn: 'root',
})
export class BGMService {
  private router = inject(Router);
  private soundService = inject(SoundService);

  private lastPlace = signal<'menu' | 'game' | ''>('');
  private currentPlace = signal<'menu' | 'game' | ''>('');
  private lastBGM = signal<BGM | undefined>(undefined);

  private lastBGMPlaySetting = signal<boolean>(getOption('bgmPlay'));
  private curBGMPlaySetting = computed(() => getOption('bgmPlay'));

  constructor() {
    effect(() => {
      this.currentPlace();
      locationGetCurrent();
      this.soundService.allowAudioInteractions();
      this.curBGMPlaySetting();

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

    let nextBGM: BGM | undefined;

    if (!gameloopShouldRun()) {
      nextBGM = 'menu';
    } else {
      const currentNode = locationGetCurrent();

      if (currentNode) {
        if (currentNode.captureType === 'time') {
          nextBGM = 'game-explore';
        }

        if (currentNode.nodeType === 'town') {
          nextBGM = 'game-recovering';
        }
      }

      if (!nextBGM) nextBGM = 'game-casual';
    }

    if (
      this.currentPlace() === this.lastPlace() &&
      this.curBGMPlaySetting() === this.lastBGMPlaySetting() &&
      this.lastBGM() === nextBGM
    )
      return;

    this.lastPlace.set(this.currentPlace());
    this.lastBGMPlaySetting.set(this.curBGMPlaySetting());

    this.lastBGM.set(nextBGM);

    this.soundService.playBGM(nextBGM);
  }
}
