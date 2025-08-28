import { DecimalPipe, NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MarkerSymmetryComponent } from '@components/marker-symmetry/marker-symmetry.component';
import {
  allHeroes,
  getEntry,
  heroTotalStat,
  skillCreateForHero,
  skillCreateWithSymmetry,
  skillDisplayElement,
  skillEnchantLevel,
  skillTechniqueDamageScalingStat,
  skillTechniqueNumTargets,
  skillTechniqueStatusEffectChance,
  skillTechniqueStatusEffectDuration,
  skillUses,
  symmetryCopiesRequired,
  symmetryLevel,
  symmetryLevelDescription,
  symmetryLevelRarity,
  symmetrySkillBonusDescription,
  talentsForHero,
} from '@helpers';
import type {
  EquipmentSkill,
  EquipmentSkillContent,
  GameStat,
  Hero,
  StatusEffectContent,
  SymmetryLevel,
} from '@interfaces';
import { sumBy } from 'es-toolkit/compat';

@Component({
  selector: 'app-stats-skill',
  imports: [NgClass, MarkerSymmetryComponent, DecimalPipe],
  templateUrl: './stats-skill.component.html',
  styleUrl: './stats-skill.component.scss',
})
export class StatsSkillComponent {
  public skill = input.required<EquipmentSkillContent>();
  public equippingHero = input<Hero>();
  public showEquippedBy = input<boolean>(false);

  public equippedByText = computed(() => {
    if (!this.showEquippedBy()) return '';

    return allHeroes().find((h) => h.skills.includes(this.skill()))?.name ?? '';
  });

  private skillWithSymmetry = computed(() =>
    skillCreateWithSymmetry(this.skill()),
  );

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

  public symmetryLevel = computed(() => {
    const skill = this.skill() as EquipmentSkill;
    return symmetryLevel(skill);
  });

  public enchantLevel = computed(() =>
    skillEnchantLevel(this.skill() as EquipmentSkill),
  );

  public skillUses = computed(() => skillUses(this.skill() as EquipmentSkill));

  public element = computed(() => skillDisplayElement(this.skill()));

  public techniqueTexts = computed(() => {
    const skillRef = this.skillRef() ?? this.skillWithSymmetry();

    return skillRef.techniques.map((t) => {
      const statScalars = Object.keys(t.damageScaling)
        .filter((d) => t.damageScaling[d as GameStat])
        .map((d) => {
          const statMult = skillTechniqueDamageScalingStat(
            skillRef,
            t,
            d as GameStat,
          );

          return { stat: d, multiplier: statMult };
        });

      const totalValue = this.equippingHero()
        ? sumBy(
            statScalars,
            (s) =>
              s.multiplier *
              heroTotalStat(this.equippingHero()!, s.stat as GameStat),
          )
        : 0;

      const statString = statScalars
        .map((d) => {
          return `${d.stat} (${d.multiplier.toFixed(2)}x)`;
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
        calculatedTotal: totalValue,
      };
    });
  });

  public symmetryTextRarity = computed(() =>
    symmetryLevelRarity(this.symmetryLevel()),
  );

  public symmetryText = computed(() => {
    const skill = this.skill() as EquipmentSkill;
    const skillSymmetryLevel = this.symmetryLevel();
    const desc = symmetryLevelDescription(skillSymmetryLevel);
    const skillSymmetryCount = skill.mods?.symmetryCount ?? 0;
    const copiesRequiredForNextLevel = symmetryCopiesRequired(
      (skillSymmetryLevel + 1) as SymmetryLevel,
    );

    if (skillSymmetryLevel === 0)
      return `${desc} (${skillSymmetryCount}/${copiesRequiredForNextLevel})`;

    const bonusDesc = symmetrySkillBonusDescription(skillSymmetryLevel);
    if (skillSymmetryLevel >= 5) return `${desc}: ${bonusDesc}`;

    const adjuster = symmetryCopiesRequired(skillSymmetryLevel);
    return `${desc} (${skillSymmetryCount - adjuster}/${copiesRequiredForNextLevel - adjuster}): ${bonusDesc}`;
  });
}
