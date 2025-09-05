import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { IconComponent } from '@components/icon/icon.component';
import type { GameElement, GameElementExtended, Icon } from '@interfaces';

const icons: Record<GameElement | GameElementExtended, Icon> = {
  Fire: 'gameSmallFire',
  Water: 'gameIceCube',
  Air: 'gameSwanBreeze',
  Earth: 'gameStonePile',
  Sand: 'gameSandstorm',
  Molten: 'gameLava',
  Mist: 'gameDustCloud',
  Heat: 'gameHeatHaze',
  Steam: 'gameSteam',
  Mud: 'gamePowder',
  Holy: 'gameHolyGrail',
};

const colors: Record<GameElement | GameElementExtended, string> = {
  Fire: 'text-red-600',
  Water: 'text-sky-500',
  Air: 'text-green-500',
  Earth: 'text-amber-700',
  Sand: 'text-orange-400',
  Molten: 'text-red-800',
  Mist: 'text-sky-300',
  Heat: 'text-red-400',
  Steam: 'text-teal-500',
  Mud: 'text-amber-900',
  Holy: 'text-amber-200',
};

@Component({
  selector: 'app-icon-element',
  imports: [IconComponent, NgClass],
  templateUrl: './icon-element.component.html',
  styleUrl: './icon-element.component.scss',
})
export class IconElementComponent {
  public element = input.required<GameElement | GameElementExtended>();

  public icon = computed(() => icons[this.element()]);
  public color = computed(() => `${colors[this.element()]}`);
}
