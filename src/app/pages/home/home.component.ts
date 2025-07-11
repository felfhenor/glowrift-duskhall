import { Component, computed, inject, OnInit, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SwalComponent, SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ConnectButtonsComponent } from '@components/connect-buttons/connect-buttons.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { SFXDirective } from '@directives/sfx.directive';
import { isSetup, resetGame, setDiscordStatus } from '@helpers';
import { MetaService } from '@services/meta.service';

@Component({
  selector: 'app-home',
  imports: [
    SweetAlert2Module,
    ConnectButtonsComponent,
    AnalyticsClickDirective,
    SFXDirective,
  ],
  providers: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  public meta = inject(MetaService);
  private router = inject(Router);

  public resetGameSwal = viewChild<SwalComponent>('newGameSwal');

  public hasStartedGame = computed(() => isSetup());

  ngOnInit() {
    setDiscordStatus({
      state: 'In Main Menu',
    });
  }

  async newGame() {
    if (isSetup()) {
      const res = await this.resetGameSwal()?.fire();
      if (!res) return;

      if (res.isConfirmed) {
        resetGame();
        this.router.navigate(['/setup']);
      }
      return;
    }

    this.router.navigate(['/setup']);
  }

  resumeGame() {
    this.router.navigate(['/game']);
  }
}
