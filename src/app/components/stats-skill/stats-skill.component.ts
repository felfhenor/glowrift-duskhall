import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { uniq } from 'lodash';
import { rarityItemTextColor } from '@helpers';
import { EquipmentSkillContent, GameStat } from '@interfaces';

@Component({
  selector: 'app-stats-skill',
  imports: [NgClass],
  templateUrl: './stats-skill.component.html',
  styleUrl: './stats-skill.component.scss',
})
export class StatsSkillComponent {
  public skill = input.required<EquipmentSkillContent>();

  public elements = computed(() =>
    uniq(this.skill().techniques.map((t) => t.elements)),
  );

  public skillRarityClass = computed(() =>
    rarityItemTextColor(this.skill().rarity),
  );

  public techniqueTexts = computed(() => {
    return this.skill().techniques.map((t) => {
      const statString = Object.keys(t.damageScaling)
        .map((d) => `${d} (${t.damageScaling[d as GameStat]}x)`)
        .join(', ');

      return `${t.targetType} (${t.targets}x): ${statString}`;
    });
  });
}
