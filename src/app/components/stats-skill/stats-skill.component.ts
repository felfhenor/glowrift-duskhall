import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { getEntry, rarityItemTextColor } from '@helpers';
import {
  EquipmentSkillContent,
  GameStat,
  StatusEffectContent,
} from '@interfaces';
import { uniq } from 'lodash';

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
        .filter((d) => t.damageScaling[d as GameStat])
        .map((d) => `${d} (${t.damageScaling[d as GameStat]}x)`)
        .join(', ');

      const statusString = t.statusEffects
        .map(
          (s) =>
            `${getEntry<StatusEffectContent>(s.statusEffectId)!.name} (${s.chance}% - ${s.duration} turns)`,
        )
        .join(', ');

      const endString = [statString, statusString].filter(Boolean).join(' + ');

      return `${t.targetType} (${t.targets}x): ${endString}`;
    });
  });
}
