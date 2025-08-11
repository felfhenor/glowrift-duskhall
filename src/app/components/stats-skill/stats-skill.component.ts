import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import {
  getEntry,
  skillCreateForHero,
  skillDisplayElement,
  skillEnchantLevel,
  skillTechniqueDamageScalingStat,
  skillTechniqueNumTargets,
  skillTechniqueStatusEffectChance,
  skillTechniqueStatusEffectDuration,
  skillUses,
  talentsForHero,
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

    return talentsForHero(hero);
  });

  public skillRef = computed(() => {
    const hero = this.equippingHero();
    if (!hero) return undefined;

    return skillCreateForHero(hero, this.skill() as EquipmentSkill);
  });

  public enchantLevel = computed(() =>
    skillEnchantLevel(this.skill() as EquipmentSkill),
  );

  public skillUses = computed(() => skillUses(this.skill() as EquipmentSkill));

  public element = computed(() => skillDisplayElement(this.skill()));

  public techniqueTexts = computed(() => {
    const skillRef = this.skillRef() ?? this.skill();

    return skillRef.techniques.map((t) => {
      const statString = Object.keys(t.damageScaling)
        .filter((d) => t.damageScaling[d as GameStat])
        .map((d) => {
          const statMult = skillTechniqueDamageScalingStat(
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

          const defaultChance = skillTechniqueStatusEffectChance(skillRef, s);

          const defaultDuration = skillTechniqueStatusEffectDuration(
            skillRef,
            s,
          );

          return `${statusEffect.name} (${defaultChance}% - ${defaultDuration} turns)`;
        })
        .join(' + ');

      const baseTargets = skillTechniqueNumTargets(skillRef, t);

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
