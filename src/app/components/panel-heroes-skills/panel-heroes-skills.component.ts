import { Component, computed, input, output } from '@angular/core';
import { RepeatPipe } from 'ngxtension/repeat-pipe';
import { maxSkillsForHero } from '@helpers';
import type { Hero } from '@interfaces';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconSkillComponent } from '@components/icon-skill/icon-skill.component';

@Component({
  selector: 'app-panel-heroes-skills',
  imports: [IconSkillComponent, RepeatPipe, IconBlankSlotComponent],
  templateUrl: './panel-heroes-skills.component.html',
  styleUrl: './panel-heroes-skills.component.css',
})
export class PanelHeroesSkillsComponent {
  public hero = input.required<Hero>();
  public highlightSlot = input<number>();

  public slotClick = output<number>();
  public slotRightClick = output<number>();

  public maxSkills = computed(() => maxSkillsForHero());
}
