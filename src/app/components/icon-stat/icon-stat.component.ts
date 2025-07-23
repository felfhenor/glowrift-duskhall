import { Component, computed, input } from '@angular/core';
import { IconComponent } from '@components/icon/icon.component';
import type { GameStat, Icon } from '@interfaces';

const icons: Record<GameStat, Icon> = {
  Aura: 'gameVibratingShield',
  Force: 'gameGooeyImpact',
  Health: 'gameGlassHeart',
  Speed: 'gameClockwork',
};

@Component({
  selector: 'app-icon-stat',
  imports: [IconComponent],
  templateUrl: './icon-stat.component.html',
  styleUrl: './icon-stat.component.css',
})
export class IconStatComponent {
  public stat = input.required<GameStat>();

  public icon = computed(() => icons[this.stat()]);
}
