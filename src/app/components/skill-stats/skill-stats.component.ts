import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { uniq } from 'lodash';
import { rarityItemTextColor } from '../../helpers';
import { EquipmentSkillDefinition } from '../../interfaces';

@Component({
  selector: 'app-skill-stats',
  imports: [NgClass],
  templateUrl: './skill-stats.component.html',
  styleUrl: './skill-stats.component.scss',
})
export class SkillStatsComponent {
  public skill = input.required<EquipmentSkillDefinition>();

  public elements = computed(() =>
    uniq(this.skill().techniques.map((t) => t.elements)),
  );

  public skillRarityClass = computed(() =>
    rarityItemTextColor(this.skill().rarity),
  );
}
