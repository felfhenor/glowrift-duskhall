import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { GameStat, Icon } from '../../interfaces';
import { IconComponent } from '../icon/icon.component';

const icons: Record<GameStat, Icon> = {
  Aura: 'gameVibratingShield',
  Force: 'gameGooeyImpact',
  Health: 'gameGlassHeart',
  Speed: 'gameClockwork',
};

@Component({
  selector: 'app-marker-stat',
  imports: [IconComponent, DecimalPipe, TitleCasePipe],
  templateUrl: './marker-stat.component.html',
  styleUrl: './marker-stat.component.css',
})
export class MarkerStatComponent {
  public stat = input.required<GameStat>();
  public value = input.required<number>();
  public delta = input<number>(0);

  public icon = computed(() => icons[this.stat()]);

  public displayDelta = computed(() => {
    const deltaValue = this.delta();
    if (deltaValue === 0) return null;

    const displayValue = deltaValue.toFixed(1);

    return deltaValue > 0 ? `(+${displayValue})` : `(${displayValue})`;
  });

  public deltaColor = computed(() =>
    this.delta() > 0 ? 'text-green-500' : 'text-red-500',
  );
}
