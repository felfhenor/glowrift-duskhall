import type { Signal } from '@angular/core';
import { Component, computed } from '@angular/core';
import { IconHeroComponent } from '@components/icon-hero/icon-hero.component';
import { MarkerHeroNameComponent } from '@components/marker-hero-name/marker-hero-name.component';
import { allHeroes } from '@helpers/hero';
import { heroRemainingTalentPoints } from '@helpers/hero-talent';
import {
  riftglowConvertFromHeroTalents,
  riftglowConvertToHeroTalents,
  riftglowTalentPointsForHero,
  riftglowTotalUnspent,
  riftglowUpgradeAddPoints,
  riftglowUpgradeGet,
  riftglowUpgradeGetValue,
} from '@helpers/riftglow';
import type { Hero } from '@interfaces/hero';
import type { RiftglowUpgrade } from '@interfaces/riftglow';
import { debounce } from 'typescript-debounce-decorator';

@Component({
  selector: 'app-panel-world-riftglow',
  imports: [IconHeroComponent, MarkerHeroNameComponent],
  templateUrl: './panel-world-riftglow.component.html',
  styleUrl: './panel-world-riftglow.component.scss',
})
export class PanelWorldRiftglowComponent {
  public availableRiftglowPoints = computed(() => riftglowTotalUnspent());
  public allHeroes = computed(() =>
    allHeroes().map((h) => ({
      ...h,
      totalPoints: heroRemainingTalentPoints(h),
      convertedRiftglow: riftglowTalentPointsForHero(h),
    })),
  );

  public upgrades: Signal<
    Array<{
      name: string;
      upgrade: RiftglowUpgrade;
      description: string;
      upgradeLevel: number;
    }>
  > = computed(() => {
    const names: Record<RiftglowUpgrade, string> = {
      BonusXP: 'Experience Gain',
      BonusExploreSpeed: 'Location Explore Speed',
      BonusLootLevel: 'Location Loot Level',
      BonusWorldMovementSpeed: 'World Movement Speed',
    };

    const descriptions: Record<RiftglowUpgrade, string> = {
      BonusXP: 'Increases experience gain by {value}% from all sources.',
      BonusExploreSpeed:
        'Increases the speed of exploring new locations by {value} ticks.',
      BonusLootLevel:
        'Increases the loot level of explored locations by +{value}.',
      BonusWorldMovementSpeed:
        'Increases the speed of world travel by {value} ticks.',
    };

    const upgradeOrder = [
      'BonusXP',
      'BonusExploreSpeed',
      'BonusLootLevel',
      'BonusWorldMovementSpeed',
    ] as RiftglowUpgrade[];

    return upgradeOrder.map((upgrade) => {
      const upgradeLevel = riftglowUpgradeGet(upgrade);
      return {
        name: names[upgrade],
        description: descriptions[upgrade].replace(
          '{value}',
          riftglowUpgradeGetValue(upgrade).toString(),
        ),
        upgrade,
        upgradeLevel,
      };
    });
  });

  @debounce(10)
  gainRiftglow(hero: Hero, points = 1) {
    if (heroRemainingTalentPoints(hero) <= 0) return;
    riftglowConvertFromHeroTalents(hero, points);
  }

  @debounce(10)
  loseRiftglow(hero: Hero, points = 1) {
    riftglowConvertToHeroTalents(hero, points);
  }

  @debounce(10)
  upgradeRiftglow(upgrade: RiftglowUpgrade, points = 1) {
    if (this.availableRiftglowPoints() <= 0) return;
    riftglowUpgradeAddPoints(upgrade, points);
  }

  @debounce(10)
  downgradeRiftglow(upgrade: RiftglowUpgrade, points = 1) {
    riftglowUpgradeAddPoints(upgrade, -points);
  }
}
