import { Component, computed, input, output } from '@angular/core';
import { IconBlankSlotComponent } from '@components/icon-blank-slot/icon-blank-slot.component';
import { IconSkillComponent } from '@components/icon-skill/icon-skill.component';
import { maxSkillsForHero } from '@helpers';
import type { Hero } from '@interfaces';
import { RepeatPipe } from 'ngxtension/repeat-pipe';

@Component({
  selector: 'app-panel-heroes-skills',
  imports: [IconSkillComponent, RepeatPipe, IconBlankSlotComponent],
  templateUrl: './panel-heroes-skills.component.html',
  styleUrl: './panel-heroes-skills.component.scss',
})
export class PanelHeroesSkillsComponent {
  public hero = input.required<Hero>();
  public highlightSlot = input<number>();

  public slotClick = output<number>();
  public slotRightClick = output<number>();

  public maxSkills = computed(() => maxSkillsForHero());
}
