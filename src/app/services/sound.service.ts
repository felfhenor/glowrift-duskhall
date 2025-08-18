import { Injectable } from '@angular/core';
import { getOption, warn } from '@helpers';
import type { SFX } from '@interfaces';
import { zip } from 'es-toolkit/compat';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private context: AudioContext | null = null;
  private soundEffects: Partial<Record<SFX, AudioBuffer>> = {};
  private isInitialized = false;
  private hasUserInteracted = false;

  constructor() {
    // Set up one-time user interaction listeners to enable audio
    this.setupUserInteractionListeners();
  }

  private setupUserInteractionListeners() {
    const enableAudio = () => {
      this.hasUserInteracted = true;
      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };

    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
  }

  private async createAudioContext(): Promise<AudioContext> {
    if (this.context) {
      return this.context;
    }

    // Only create AudioContext after user interaction to avoid policy violations
    if (!this.hasUserInteracted) {
      throw new Error('AudioContext creation requires user interaction');
    }

    try {
      // Create AudioContext only when needed and after user interaction
      const AudioContextClass = window.AudioContext;
      this.context = new AudioContextClass();

      // Handle suspended context (common in modern browsers due to autoplay policy)
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      return this.context;
    } catch (error) {
      warn('Audio', 'Failed to create AudioContext:', error);
      throw new Error('AudioContext creation failed');
    }
  }

  async init() {
    try {
      // Try to initialize AudioContext if user has already interacted
      if (this.hasUserInteracted) {
        await this.createAudioContext();
      }

      const soundsToLoad: Record<SFX, string> = {
        'ui-click': './sfx/ui-click.mp3',
      };

      const sfxToLoad = Object.keys(soundsToLoad).map((sfx) => ({
        sfx: sfx as SFX,
        url: soundsToLoad[sfx as SFX],
      }));

      // Load sound files even if AudioContext isn't ready yet
      const soundNames = sfxToLoad.map((s) => s.sfx);

      if (this.context) {
        const sounds = await this.loadSounds(sfxToLoad.map((s) => s.url));
        const zipped = zip<SFX, AudioBuffer>(soundNames, sounds);
        zipped.forEach(([name, buffer]) => {
          this.soundEffects[name as SFX] = buffer;
        });
      }

      this.isInitialized = true;
    } catch (error) {
      warn('Audio', 'Failed to initialize SoundService:', error);
      this.isInitialized = true;
    }
  }

  private async ensureSoundsLoaded() {
    // If sounds aren't loaded yet and we have an AudioContext, load them now
    if (this.context && Object.keys(this.soundEffects).length === 0) {
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
  }

  private async loadSound(url: string) {
    if (!this.context) {
      throw new Error('AudioContext not initialized');
    }
    return fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => this.context!.decodeAudioData(b));
  }

  private async loadSounds(urls: string[]) {
    return Promise.all(urls)
      .then((urls) => urls.map((url) => url))
      .then((urls) => Promise.all(urls.map((url) => this.loadSound(url))));
  }

  public async playSound(soundName: SFX, rate: number) {
    if (!getOption('audioPlay')) return;
    if (!this.isInitialized) {
      warn('Audio', 'SoundService not initialized, skipping sound playback');
      return;
    }

    try {
      // Create AudioContext if it doesn't exist and user has interacted
      if (!this.context && this.hasUserInteracted) {
        await this.createAudioContext();
        await this.ensureSoundsLoaded();
      }

      if (!this.context) {
        // AudioContext not available yet, skip silently
        return;
      }

      // Ensure context is resumed (in case it was suspended)
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      const sound = this.soundEffects[soundName];
      if (!sound) {
        warn('Audio', `Sound effect '${soundName}' not found`);
        return;
      }

      const source = this.context.createBufferSource();
      source.buffer = sound;
      source.detune.value = rate;

      const gain = this.context.createGain();
      gain.gain.value = getOption<'volume'>('volume');
      source.connect(gain);
      gain.connect(this.context.destination);

      source.start(0);
    } catch (error) {
      warn('Audio', 'Failed to play sound:', error);
    }
  }

  public async cleanup() {
    if (this.context) {
      try {
        await this.context.close();
        this.context = null;
      } catch (error) {
        warn('Audio', 'Failed to close AudioContext:', error);
      }
    }
    this.soundEffects = {};
    this.isInitialized = false;
  }
}
