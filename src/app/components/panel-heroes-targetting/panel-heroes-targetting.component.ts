import type { OnChanges, OnInit } from '@angular/core';
import { Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { heroUpdateData } from '@helpers/hero';
import type { CombatantTargettingType } from '@interfaces/combat';
import type { Hero } from '@interfaces/hero';

@Component({
  selector: 'app-panel-heroes-targetting',
  imports: [FormsModule],
  templateUrl: './panel-heroes-targetting.component.html',
  styleUrl: './panel-heroes-targetting.component.scss',
})
export class PanelHeroesTargettingComponent implements OnInit, OnChanges {
  public hero = input.required<Hero>();

  public heroTargettingType = signal<CombatantTargettingType>('Random');
  public readonly targettingTypes: CombatantTargettingType[] = [
    'Random',
    'Strongest',
    'Weakest',
  ];

  ngOnInit(): void {
    this.heroTargettingType.set(this.hero().targettingType);
  }

  ngOnChanges(): void {
    this.heroTargettingType.set(this.hero().targettingType);
  }

  public setTargettingType(type: CombatantTargettingType): void {
    heroUpdateData(this.hero().id, { targettingType: type });
  }
}
