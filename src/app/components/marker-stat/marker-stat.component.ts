import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IconStatComponent } from '@components/icon-stat/icon-stat.component';
import type { GameStat } from '@interfaces';

@Component({
  selector: 'app-marker-stat',
  imports: [DecimalPipe, TitleCasePipe, IconStatComponent],
  templateUrl: './marker-stat.component.html',
  styleUrl: './marker-stat.component.scss',
})
export class MarkerStatComponent {
  public stat = input.required<GameStat>();
  public value = input.required<number>();
  public delta = input<number>(0);

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
