import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import {
  allHeroTalents,
  getEntry,
  getSkillEnchantLevel,
  getSkillTechniqueDamageScalingStat,
  getSkillTechniqueNumTargets,
  getSkillTechniqueStatusEffectChance,
  getSkillTechniqueStatusEffectDuration,
  getSkillUses,
  rarityItemTextColor,
  talentAddedStatusEffects,
  talentStatBoost,
  talentStatusEffectChanceBoost,
  talentStatusEffectDurationBoost,
  talentTargetCountBoost,
} from '@helpers';
import type {
  EquipmentSkill,
  EquipmentSkillContent,
  EquipmentSkillTechniqueStatusEffectApplication,
  GameStat,
  Hero,
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
  public equippingHero = input<Hero>();

  public heroTalents = computed(() => {
    const hero = this.equippingHero();
    if (!hero) return [];

    return allHeroTalents(hero);
  });

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
    const talents = this.heroTalents();
    const skillRef = this.skill() as EquipmentSkill;

    return this.skill().techniques.map((t) => {
      const statString = Object.keys(t.damageScaling)
        .filter((d) => t.damageScaling[d as GameStat])
        .map((d) => {
          const statMult = getSkillTechniqueDamageScalingStat(
            skillRef,
            t,
            d as GameStat,
          );

          const talentBoost = talentStatBoost(talents, skillRef, d as GameStat);

          const totalStatMult = statMult + talentBoost;

          return `${d} (${totalStatMult.toFixed(2)}x)`;
        })
        .join(', ');

      const allStatusEffects: EquipmentSkillTechniqueStatusEffectApplication[] =
        [...t.statusEffects, ...talentAddedStatusEffects(talents, skillRef)];

      const statusString = allStatusEffects
        .map((s) => {
          const statusEffect = getEntry<StatusEffectContent>(s.statusEffectId);
          if (!statusEffect) return '';

          const defaultChance = getSkillTechniqueStatusEffectChance(
            skillRef,
            s,
          );
          const talentChance = talentStatusEffectChanceBoost(
            talents,
            skillRef,
            statusEffect,
          );
          const totalChance = defaultChance + talentChance;

          const defaultDuration = getSkillTechniqueStatusEffectDuration(
            skillRef,
            s,
          );
          const talentDuration = talentStatusEffectDurationBoost(
            talents,
            skillRef,
            statusEffect,
          );
          const totalDuration = defaultDuration + talentDuration;

          return `${statusEffect.name} (${totalChance}% - ${totalDuration} turns)`;
        })
        .join(', ');

      const endString = [statString, statusString].filter(Boolean).join(' + ');

      const baseTargets = getSkillTechniqueNumTargets(skillRef, t);
      const talentTargets = talentTargetCountBoost(talents, skillRef);
      const totalTargets = baseTargets + talentTargets;

      return `${t.targetType} (${totalTargets}x): ${endString}`;
    });
  });
}
