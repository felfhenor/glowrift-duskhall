import { Directive, HostListener, inject, input } from '@angular/core';
import { SFX } from '@interfaces';
import { SoundService } from '@services/sound.service';

type SFXTrigger = 'click' | 'hover';

@Directive({
  selector: '[appSfx]',
})
export class SFXDirective {
  private soundService = inject(SoundService);

  public appSfx = input.required<SFX>();
  public sfxOffset = input<number>(0);
  public sfxTrigger = input<SFXTrigger[]>(['click']);

  @HostListener('click')
  click() {
    if (!this.sfxTrigger().includes('click')) return;
    this.soundService.playSound(this.appSfx(), 1 + this.sfxOffset() * 100);
  }

  @HostListener('mouseenter')
  mouseenter() {
    if (!this.sfxTrigger().includes('hover')) return;
    this.soundService.playSound(this.appSfx(), 1 + this.sfxOffset() * 100);
  }
}
