import { Component, computed } from '@angular/core';
import { gamestate, getActiveFestivals } from '@helpers';
import { BlankSlateComponent } from '@components/blank-slate/blank-slate.component';
import { CountdownComponent } from '@components/countdown/countdown.component';

@Component({
  selector: 'app-panel-town-festivals',
  imports: [CountdownComponent, BlankSlateComponent],
  templateUrl: './panel-town-festivals.component.html',
  styleUrl: './panel-town-festivals.component.scss',
})
export class PanelTownFestivalsComponent {
  public allFestivals = computed(() =>
    getActiveFestivals().map((festival) => ({
      festival,
      timeLeft:
        gamestate().festival.festivals[festival.id] -
        gamestate().actionClock.numTicks,
    })),
  );
}
