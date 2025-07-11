import { Component, computed, input } from '@angular/core';
import {
  ContentType,
  DroppableEquippable,
  EquipmentItem,
  EquipmentSkill,
} from '@interfaces';
import { IconItemComponent } from '@components/icon-item/icon-item.component';
import { IconSkillComponent } from '@components/icon-skill/icon-skill.component';

@Component({
  selector: 'app-location-loot-display',
  imports: [IconItemComponent, IconSkillComponent],
  templateUrl: './location-loot-display.component.html',
  styleUrl: './location-loot-display.component.scss',
})
export class LocationLootDisplayComponent {
  public loot = input.required<DroppableEquippable>();

  public isSkill = computed(() => this.loot().__type === 'skill');
  public isItem = computed(() =>
    (['weapon', 'armor', 'trinket', 'accessory'] as ContentType[]).includes(
      this.loot().__type,
    ),
  );

  public lootAsSkill = computed(() => this.loot() as EquipmentSkill);
  public lootAsItem = computed(() => this.loot() as EquipmentItem);
}
