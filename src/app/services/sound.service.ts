import { computed, effect, Injectable, signal } from '@angular/core';
import { error, getOption, info, sfx$, warn } from '@helpers';
import type { BGM, SFX } from '@interfaces';
import { zip } from 'es-toolkit/compat';

const soundsToLoad: Record<SFX, string> = {
  'ui-click': './audio/sfx/ui-click.mp3',
  'item-get-major': './audio/sfx/item-get-major.mp3',
  'item-get-minor': './audio/sfx/item-get-minor.mp3',
  'ui-error': './audio/sfx/ui-error.mp3',
  'ui-hover': './audio/sfx/ui-hover.mp3',
  'ui-success': './audio/sfx/ui-success.mp3',
  loading: './audio/sfx/loading.mp3',
  victory: './audio/sfx/victory.mp3',
  'festival-start': './audio/sfx/festival-start.mp3',
  'item-equip': './audio/sfx/item-equip.mp3',
  'item-salvage': './audio/sfx/item-salvage.mp3',
  'skill-equip': './audio/sfx/skill-equip.mp3',
  'merchant-reset': './audio/sfx/merchant-reset.mp3',
};

const soundVolumeMixing: Record<SFX, number> = {
  'ui-click': 0.5,
  'item-get-major': 1,
  'item-get-minor': 0.5,
  'ui-error': 1.5,
  'ui-hover': 1,
  'ui-success': 1,
  loading: 0.5,
  victory: 1.5,
  'festival-start': 0.5,
  'item-equip': 0.5,
  'item-salvage': 0.25,
  'skill-equip': 1,
  'merchant-reset': 0.5,
};

const bgmsToLoad: Record<BGM, string> = {
  'game-casual': './audio/bgm/game-casual.mp3',
  'game-threatened': './audio/bgm/game-threatened.mp3',
  'game-recovering': './audio/bgm/game-recovering.mp3',
  'game-explore': './audio/bgm/game-explore.mp3',
  menu: './audio/bgm/menu.mp3',
};

const CROSSFADE_TIME = 2; // seconds

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private context: AudioContext | null = null;
  private audioRefs: Partial<Record<SFX | BGM, AudioBuffer>> = {};

  private bgmGain: GainNode | undefined;
  private bgm: AudioBufferSourceNode | undefined;

  private lastSFX: AudioBufferSourceNode | undefined;

  private hasInteracted = signal<boolean>(false);
  public allowAudioInteractions = this.hasInteracted.asReadonly();

  private lastBGMVolume = signal<number>(0);

  private bgmVolume = computed(() =>
    getOption<'bgmPlay'>('bgmPlay') ? getOption<'bgmVolume'>('bgmVolume') : 0,
  );

  private sfxVolume = computed(() => 0.5 * getOption<'sfxVolume'>('sfxVolume'));

  constructor() {
    effect(() => {
      const bgmVolume = this.bgmVolume();
      if (bgmVolume !== this.lastBGMVolume()) {
        this.changeBGMVolume(bgmVolume);
        this.lastBGMVolume.set(bgmVolume);
      }
    });
  }

  async init() {
    this.createAudioContext();

    this.lastBGMVolume.set(getOption<'bgmVolume'>('bgmVolume'));
    this.setupUserInteractionListeners();
    await this.loadSFX();
    await this.loadBGM();

    sfx$.subscribe((sfxData) => {
      const { sfx, rate } = sfxData;

      this.playSound(sfx, rate);
    });
  }

  private isAudioContextValid(): boolean {
    return !!this.context && this.context.state !== 'closed';
  }

  private createAudioContext(): void {
    try {
      if (this.context && this.context.state !== 'closed') {
        this.context
          .close()
          .catch((err) =>
            warn('SoundService', 'Error closing AudioContext:', err),
          );
      }

      this.context = new AudioContext({
        latencyHint: 'interactive',
        sampleRate: 44100,
      });

      // Add error handling for suspended context
      this.context.addEventListener('error', (event) => {
        error('SoundService', 'AudioContext error:', event);
        this.handleAudioContextError();
      });
    } catch (err) {
      error('SoundService', 'Failed to create AudioContext:', err);
    }
  }

  private async handleAudioContextError(): Promise<void> {
    try {
      this.createAudioContext();

      if (this.context && this.context.state !== 'closed') {
        info('SoundService', 'Recovering AudioContext...');
        await this.resumeContext();
        await this.reloadAudioResources();
      }

      info('SoundService', 'Recovered AudioContext...');
    } catch (err) {
      error('SoundService', 'AudioContext recovery failed:', err);
    }
  }

  private async resumeContext(): Promise<void> {
    if (!this.context || this.context.state === 'closed') {
      this.createAudioContext();
      return;
    }

    if (this.context.state === 'suspended') {
      this.resumeAudioContext();
    }
  }

  private async reloadAudioResources(): Promise<void> {
    try {
      this.audioRefs = {};

      await Promise.all([this.loadSFX(), this.loadBGM()]);

      info('SoundService', 'Reloaded audio resources.');
    } catch (err) {
      error('SoundService', 'Failed to reload audio resources:', err);
    }
  }

  private setupUserInteractionListeners() {
    const enableAudio = () => {
      this.hasInteracted.set(true);
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('mousemove', enableAudio);
    };

    const reenableAudio = async () => {
      if (!this.context || this.context.state === 'closed') {
        this.createAudioContext();
      }

      if (this.context && this.context.state === 'suspended') {
        this.resumeAudioContext();
      }
    };

    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
    document.addEventListener('mousemove', enableAudio, { once: true });

    document.addEventListener('click', reenableAudio);
    document.addEventListener('keydown', reenableAudio);
    document.addEventListener('touchstart', reenableAudio);
    document.addEventListener('mousemove', reenableAudio);

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;

      this.resumeAudioContext();
    });
  }

  private async resumeAudioContext() {
    if (!this.isAudioContextValid()) return;

    try {
      await this.context!.resume();
    } catch (err) {
      error('SoundService', 'Failed to resume AudioContext:', err);
    }
  }

  private async loadSFX() {
    const sfxToLoad = Object.keys(soundsToLoad).map((sfx) => ({
      sfx: sfx as SFX,
      url: soundsToLoad[sfx as SFX],
    }));

    const soundNames = sfxToLoad.map((s) => s.sfx);
    const sounds = (await this.loadSounds(
      sfxToLoad.map((s) => s.url),
    )) as AudioBuffer[];

    const zipped = zip<SFX, AudioBuffer>(soundNames, sounds);
    zipped.forEach(([name, buffer]) => {
      this.audioRefs[name as SFX] = buffer;
    });
  }

  private async loadBGM() {
    const bgmToLoad = Object.keys(bgmsToLoad).map((bgm) => ({
      bgm: bgm as BGM,
      url: bgmsToLoad[bgm as BGM],
    }));

    const soundNames = bgmToLoad.map((b) => b.bgm);
    const sounds = (await this.loadSounds(
      bgmToLoad.map((b) => b.url),
    )) as AudioBuffer[];

    const zipped = zip<BGM, AudioBuffer>(soundNames, sounds);
    zipped.forEach(([name, buffer]) => {
      this.audioRefs[name as BGM] = buffer;
    });
  }

  private async loadSound(url: string) {
    return fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => this.context!.decodeAudioData(b));
  }

  private async loadSounds(urls: string[]) {
    return Promise.all(urls.map((url) => this.loadSound(url)));
  }

  public playSound(soundName: SFX, rate: number) {
    if (!getOption('sfxPlay') || !this.isAudioContextValid()) return;

    const sound = this.audioRefs[soundName]!;

    const source = this.context!.createBufferSource();
    source.buffer = sound;
    source.detune.value = rate;

    const gain = this.context!.createGain();
    gain.gain.value = this.sfxVolume() * soundVolumeMixing[soundName];
    source.connect(gain);
    gain.connect(this.context!.destination);

    source.start(0);

    this.lastSFX = source;
  }

  public stopSFX() {
    this.lastSFX?.stop();
  }

  public playBGM(bgmName: BGM) {
    if (!getOption('bgmPlay') || !this.isAudioContextValid()) return;

    if (this.context!.state === 'suspended') {
      this.resumeContext();
      return;
    }

    this.stopBGM();

    const volume = this.bgmVolume();

    const bgm = this.audioRefs[bgmName]!;

    const source = this.context!.createBufferSource();
    source.buffer = bgm;
    source.loop = true;

    const gainNode = this.context!.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode);
    gainNode.connect(this.context!.destination);

    if (this.bgm) {
      gainNode.gain.linearRampToValueAtTime(0, 0);
      gainNode.gain.linearRampToValueAtTime(this.bgmVolume(), CROSSFADE_TIME);
    }

    source.start(0);

    this.bgm = source;
    this.bgmGain = gainNode;
  }

  public stopBGM() {
    if (!this.bgm || !this.bgmGain || !this.isAudioContextValid()) return;

    const currTime = this.context!.currentTime;
    const bgm = this.bgm;
    const bgmGain = this.bgmGain;

    bgmGain.gain.linearRampToValueAtTime(this.bgmVolume(), currTime);
    bgmGain.gain.linearRampToValueAtTime(0, currTime + CROSSFADE_TIME);

    setTimeout(() => {
      bgm.stop();
    }, CROSSFADE_TIME * 1000);
  }

  public changeBGMVolume(newVolume: number) {
    if (!this.bgmGain || !this.context) return;

    this.bgmGain.gain.setValueAtTime(newVolume, this.context.currentTime);
  }
}
