import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import {
  getEntry,
  getSkillEnchantLevel,
  getSkillTechniqueDamageScalingStat,
  getSkillTechniqueNumTargets,
  getSkillTechniqueStatusEffectChance,
  getSkillTechniqueStatusEffectDuration,
  getSkillUses,
  rarityItemTextColor,
} from '@helpers';
import type {
  EquipmentSkill,
  EquipmentSkillContent,
  GameStat,
  StatusEffectContent,
} from '@interfaces';
import { uniq } from 'es-toolkit/compat';

@Component({
  selector: 'app-stats-skill',
  imports: [NgClass],
  templateUrl: './stats-skill.component.html',
  styleUrl: './stats-skill.component.scss',
})
export class StatsSkillComponent {
  public skill = input.required<EquipmentSkillContent>();

  public enchantLevel = computed(() =>
    getSkillEnchantLevel(this.skill() as EquipmentSkill),
  );

  public skillUses = computed(() =>
    getSkillUses(this.skill() as EquipmentSkill),
  );

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
        .map(
          (d) =>
            `${d} (${getSkillTechniqueDamageScalingStat(this.skill() as EquipmentSkill, t, d as GameStat).toFixed(2)}x)`,
        )
        .join(', ');

      const statusString = t.statusEffects
        .map(
          (s) =>
            `${getEntry<StatusEffectContent>(s.statusEffectId)!.name} (${getSkillTechniqueStatusEffectChance(this.skill() as EquipmentSkill, s)}% - ${getSkillTechniqueStatusEffectDuration(this.skill() as EquipmentSkill, s)} turns)`,
        )
        .join(', ');

      const endString = [statString, statusString].filter(Boolean).join(' + ');

      return `${t.targetType} (${getSkillTechniqueNumTargets(this.skill() as EquipmentSkill, t)}x): ${endString}`;
    });
  });
}
