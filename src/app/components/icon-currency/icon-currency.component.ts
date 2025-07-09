import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { GameCurrency, Icon } from '../../interfaces';
import { IconComponent } from '../icon/icon.component';

const icons: Record<GameCurrency, Icon> = {
  'Air Core': 'gameGlassBall',
  'Air Crystal': 'gameEmerald',
  'Air Shard': 'gameStonePile',
  'Air Sliver': 'gameEarthWorm',
  'Earth Core': 'gameGlassBall',
  'Earth Crystal': 'gameEmerald',
  'Earth Shard': 'gameStonePile',
  'Earth Sliver': 'gameEarthWorm',
  'Fire Core': 'gameGlassBall',
  'Fire Crystal': 'gameEmerald',
  'Fire Shard': 'gameStonePile',
  'Fire Sliver': 'gameEarthWorm',
  'Water Core': 'gameGlassBall',
  'Water Crystal': 'gameEmerald',
  'Water Shard': 'gameStonePile',
  'Water Sliver': 'gameEarthWorm',
  'Soul Essence': 'gameDoubleRingedOrb',
  'Common Dust': 'gameDustCloud',
  'Uncommon Dust': 'gameDustCloud',
  'Rare Dust': 'gameDustCloud',
  'Mystical Dust': 'gameDustCloud',
  'Legendary Dust': 'gameDustCloud',
  'Unique Dust': 'gameDustCloud',
  Mana: 'gameBallGlow',
};

const colors: Record<GameCurrency, string> = {
  'Air Core': 'text-green-500',
  'Air Crystal': 'text-green-500',
  'Air Shard': 'text-green-500',
  'Air Sliver': 'text-green-500',
  'Earth Core': 'text-amber-700',
  'Earth Crystal': 'text-amber-700',
  'Earth Shard': 'text-amber-700',
  'Earth Sliver': 'text-amber-700',
  'Fire Core': 'text-red-600',
  'Fire Crystal': 'text-red-600',
  'Fire Shard': 'text-red-600',
  'Fire Sliver': 'text-red-600',
  'Water Core': 'text-sky-500',
  'Water Crystal': 'text-sky-500',
  'Water Shard': 'text-sky-500',
  'Water Sliver': 'text-sky-500',
  'Soul Essence': 'text-indigo-500',
  'Common Dust': 'text-white-900',
  'Uncommon Dust': 'text-green-400',
  'Rare Dust': 'text-blue-400',
  'Mystical Dust': 'text-purple-400',
  'Legendary Dust': 'text-yellow-400',
  'Unique Dust': 'text-rose-400',
  Mana: 'text-fuchsia-500',
};

@Component({
  selector: 'app-icon-currency',
  imports: [IconComponent, NgClass],
  templateUrl: './icon-currency.component.html',
  styleUrl: './icon-currency.component.scss',
})
export class IconItemComponent {
  public currency = input.required<GameCurrency>();

  public icon = computed(() => icons[this.currency()]);
  public color = computed(() => `${colors[this.currency()]}`);
}
