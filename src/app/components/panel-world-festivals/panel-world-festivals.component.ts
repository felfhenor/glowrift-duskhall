import { Component, computed } from '@angular/core';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { CountdownComponent } from '@components/countdown/countdown.component';
import { festivalGetActive, gamestate } from '@helpers';

@Component({
  selector: 'app-panel-world-festivals',
  imports: [CountdownComponent, BlankSlateComponent],
  templateUrl: './panel-world-festivals.component.html',
  styleUrl: './panel-world-festivals.component.scss',
})
export class PanelWorldFestivalsComponent {
  public allFestivals = computed(() =>
    festivalGetActive().map((festival) => ({
      festival,
      timeLeft:
        gamestate().festival.festivals[festival.id] -
        gamestate().actionClock.numTicks,
    })),
  );
}
