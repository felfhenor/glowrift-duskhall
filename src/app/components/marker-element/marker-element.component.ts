import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IconElementComponent } from '@components/icon-element/icon-element.component';
import type { GameElement } from '@interfaces';

@Component({
  selector: 'app-marker-element',
  imports: [DecimalPipe, TitleCasePipe, IconElementComponent],
  templateUrl: './marker-element.component.html',
  styleUrl: './marker-element.component.scss',
})
export class MarkerElementComponent {
  public element = input.required<GameElement>();
  public value = input.required<number>();
  public delta = input<number>(0);

  public displayDelta = computed(() => {
    const deltaValue = this.delta() * 100;
    if (deltaValue === 0) return null;

    const displayValue = deltaValue.toFixed(1);

    return deltaValue > 0 ? `(+${displayValue})` : `(${displayValue})`;
  });

  public deltaColor = computed(() =>
    this.delta() > 0 ? 'text-green-500' : 'text-red-500',
  );
}
