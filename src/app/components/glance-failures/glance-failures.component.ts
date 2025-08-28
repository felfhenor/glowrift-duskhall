import { DecimalPipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { IconComponent } from '@components/icon/icon.component';
import { gamestate } from '@helpers/state-game';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-glance-failures',
  imports: [DecimalPipe, IconComponent, TippyDirective],
  templateUrl: './glance-failures.component.html',
  styleUrl: './glance-failures.component.scss',
})
export class GlanceFailuresComponent {
  public failures = computed(() => gamestate().hero.failuresSinceLastSuccess);
}
