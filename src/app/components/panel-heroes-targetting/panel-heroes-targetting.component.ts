import { Component, input, OnChanges, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { updateHeroData } from '@helpers/hero';
import { CombatantTargettingType } from '@interfaces/combat';
import { Hero } from '@interfaces/hero';

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
    updateHeroData(this.hero().id, { targettingType: type });
  }
}
