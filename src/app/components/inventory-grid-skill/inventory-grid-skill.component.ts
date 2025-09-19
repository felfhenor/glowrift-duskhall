import { Component, computed, input, output, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconSkillComponent } from '@components/icon-skill/icon-skill.component';
import { MarkerHeroNameComponent } from '@components/marker-hero-name/marker-hero-name.component';
import { OptionsBaseComponent } from '@components/panel-options/option-base-page.component';
import { TeleportToDirective } from '@directives/teleport.to.directive';
import {
  actionSkillSalvage,
  actionSkillSalvageValue,
  allHeroes,
  favoriteToggleSkill,
  skillEquip,
} from '@helpers';
import type {
  EquipmentSkill,
  EquipmentSkillId,
  Hero,
  SkillAction,
  SkillOrganizeSetting,
} from '@interfaces';
import { TippyDirective } from '@ngneat/helipopper';
import { RepeatPipe } from 'ngxtension/repeat-pipe';

const SKILL_SORTS: Record<
  SkillOrganizeSetting,
  (items: EquipmentSkill[]) => EquipmentSkill[]
> = {
  default: (items) => items,

  'element-air': (items) =>
    items.filter((item) =>
      item.techniques.some((t) => t.elements.includes('Air')),
    ),
  'element-earth': (items) =>
    items.filter((item) =>
      item.techniques.some((t) => t.elements.includes('Earth')),
    ),
  'element-fire': (items) =>
    items.filter((item) =>
      item.techniques.some((t) => t.elements.includes('Fire')),
    ),
  'element-water': (items) =>
    items.filter((item) =>
      item.techniques.some((t) => t.elements.includes('Water')),
    ),

  'tech-AllowPlink': (items) =>
    items.filter((item) =>
      item.techniques.some((t) => t.attributes.includes('AllowPlink')),
    ),
  'tech-Buff': (items) =>
    items.filter((item) =>
      item.techniques.some((t) => t.attributes.includes('Buff')),
    ),
  'tech-Debuff': (items) =>
    items.filter((item) =>
      item.techniques.some((t) => t.attributes.includes('Debuff')),
    ),
  'tech-BypassDefense': (items) =>
    items.filter((item) =>
      item.techniques.some((t) => t.attributes.includes('BypassDefense')),
    ),
  'tech-DamagesTarget': (items) =>
    items.filter((item) =>
      item.techniques.some((t) => t.attributes.includes('DamagesTarget')),
    ),
  'tech-HealsTarget': (items) =>
    items.filter((item) =>
      item.techniques.some((t) => t.attributes.includes('HealsTarget')),
    ),
};

@Component({
  selector: 'app-inventory-grid-skill',
  imports: [
    TippyDirective,
    DecimalPipe,
    IconSkillComponent,
    RepeatPipe,
    FormsModule,
    TeleportToDirective,
    MarkerHeroNameComponent,
  ],
  templateUrl: './inventory-grid-skill.component.html',
  styleUrl: './inventory-grid-skill.component.scss',
})
export class InventoryGridSkillComponent extends OptionsBaseComponent {
  public skills = input.required<EquipmentSkill[]>();
  public disabledSkillIds = input<EquipmentSkillId[]>([]);
  public clickableSkills = input<boolean>();
  public compareWithEquippedHero = input<Hero>();
  public compareWithEquippedHeroSlot = input<number>();
  public allowedActions = input<SkillAction[]>([]);
  public showEquippedBy = input<boolean>(false);

  public skillClicked = output<EquipmentSkill>();

  public animateItem = signal<string>('');

  public currentSortFilter = signal<SkillOrganizeSetting>(
    this.getOption('organizeSkills'),
  );

  public sortedFilteredSkills = computed(() => {
    return SKILL_SORTS[this.currentSortFilter()](this.skills());
  });

  public compareSkill = computed(
    () =>
      this.compareWithEquippedHero()?.skills[
        this.compareWithEquippedHeroSlot() ?? 0
      ],
  );

  public allHeroes = computed(() => allHeroes());

  public readonly sortFilters = [
    { setting: 'default', label: 'Default' },
    { setting: 'element-air', label: 'Element: Air' },
    { setting: 'element-earth', label: 'Element: Earth' },
    { setting: 'element-fire', label: 'Element: Fire' },
    { setting: 'element-water', label: 'Element: Water' },
    { setting: 'tech-AllowPlink', label: 'Technique: Allow Plink' },
    { setting: 'tech-Buff', label: 'Technique: Buff' },
    { setting: 'tech-Debuff', label: 'Technique: Debuff' },
    { setting: 'tech-BypassDefense', label: 'Technique: Bypass Defense' },
    { setting: 'tech-DamagesTarget', label: 'Technique: Damages Target' },
    { setting: 'tech-HealsTarget', label: 'Technique: Heals Target' },
  ];

  salvageValue(item: EquipmentSkill) {
    return actionSkillSalvageValue(item);
  }

  salvageItem(item: EquipmentSkill) {
    actionSkillSalvage(item);
  }

  toggleFavorite(item: EquipmentSkill) {
    favoriteToggleSkill(item);
  }

  heroEquippedSkill(hero: Hero, skillSlot: number): EquipmentSkill | undefined {
    return hero.skills[skillSlot];
  }

  equipSkill(item: EquipmentSkill, hero: Hero, slot: number) {
    skillEquip(hero, item, slot);
  }
}
