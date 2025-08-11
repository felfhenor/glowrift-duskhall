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
  makeSkillForHero,
  skillDisplayElement,
} from '@helpers';
import type {
  EquipmentSkill,
  EquipmentSkillContent,
  GameStat,
  Hero,
  StatusEffectContent,
} from '@interfaces';

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

  public skillRef = computed(() => {
    const hero = this.equippingHero();
    if (!hero) return undefined;

    return makeSkillForHero(hero, this.skill() as EquipmentSkill);
  });

  public enchantLevel = computed(() =>
    getSkillEnchantLevel(this.skill() as EquipmentSkill),
  );

  public skillUses = computed(() =>
    getSkillUses(this.skill() as EquipmentSkill),
  );

  public element = computed(() => skillDisplayElement(this.skill()));

  public techniqueTexts = computed(() => {
    const skillRef = this.skillRef() ?? this.skill();

    return skillRef.techniques.map((t) => {
      const statString = Object.keys(t.damageScaling)
        .filter((d) => t.damageScaling[d as GameStat])
        .map((d) => {
          const statMult = getSkillTechniqueDamageScalingStat(
            skillRef,
            t,
            d as GameStat,
          );

          return `${d} (${statMult.toFixed(2)}x)`;
        })
        .join(' + ');

      const statusString = t.statusEffects
        .map((s) => {
          const statusEffect = getEntry<StatusEffectContent>(s.statusEffectId);
          if (!statusEffect) return '';

          const defaultChance = getSkillTechniqueStatusEffectChance(
            skillRef,
            s,
          );

          const defaultDuration = getSkillTechniqueStatusEffectDuration(
            skillRef,
            s,
          );

          return `${statusEffect.name} (${defaultChance}% - ${defaultDuration} turns)`;
        })
        .join(' + ');

      const baseTargets = getSkillTechniqueNumTargets(skillRef, t);

      return {
        targetType: t.targetType,
        totalTargets: baseTargets,
        attributes: t.attributes,
        statString,
        statusString,
      };
    });
  });
}
