import { Injectable } from '@angular/core';
import { zip } from 'lodash';
import { getOption } from '@helpers';
import { SFX } from '@interfaces';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private context = new AudioContext();
  private soundEffects: Partial<Record<SFX, AudioBuffer>> = {};

  async init() {
    const soundsToLoad: Record<SFX, string> = {
      'ui-click': './sfx/ui-click.mp3',
    };

    const sfxToLoad = Object.keys(soundsToLoad).map((sfx) => ({
      sfx: sfx as SFX,
      url: soundsToLoad[sfx as SFX],
    }));
    const soundNames = sfxToLoad.map((s) => s.sfx);
    const sounds = await this.loadSounds(sfxToLoad.map((s) => s.url));

    const zipped = zip<SFX, AudioBuffer>(soundNames, sounds);
    zipped.forEach(([name, buffer]) => {
      this.soundEffects[name as SFX] = buffer;
    });
  }

  private async loadSound(url: string) {
    return fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => this.context.decodeAudioData(b));
  }

  private async loadSounds(urls: string[]) {
    return Promise.all(urls)
      .then((urls) => urls.map((url) => url))
      .then((urls) => Promise.all(urls.map((url) => this.loadSound(url))));
  }

  public playSound(soundName: SFX, rate: number) {
    if (!getOption('audioPlay')) return;

    const sound = this.soundEffects[soundName]!;

    const source = this.context.createBufferSource();
    source.buffer = sound;
    source.detune.value = rate;

    const gain = this.context.createGain();
    gain.gain.value = getOption<'volume'>('volume');
    source.connect(gain);
    gain.connect(this.context.destination);

    source.start(0);
  }
}
