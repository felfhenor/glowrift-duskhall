import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { GameElement, Icon } from '@interfaces';
import { IconComponent } from '@components/icon/icon.component';

const icons: Record<GameElement, Icon> = {
  Fire: 'gameSmallFire',
  Water: 'gameIceCube',
  Air: 'gameSwanBreeze',
  Earth: 'gameStonePile',
};

const colors: Record<GameElement, string> = {
  Fire: 'text-red-600',
  Water: 'text-sky-500',
  Air: 'text-green-500',
  Earth: 'text-amber-700',
};

@Component({
  selector: 'app-icon-element',
  imports: [IconComponent, NgClass],
  templateUrl: './icon-element.component.html',
  styleUrl: './icon-element.component.css',
})
export class IconElementComponent {
  public element = input.required<GameElement>();

  public icon = computed(() => icons[this.element()]);
  public color = computed(() => `${colors[this.element()]}`);
}
