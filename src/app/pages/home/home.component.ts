import type { OnInit } from '@angular/core';
import { Component, computed, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonQuitComponent } from '@components/button-quit/button-quit.component';
import { ButtonSettingsComponent } from '@components/button-settings/button-settings.component';
import { ButtonUpdateComponent } from '@components/button-update/button-update.component';
import { ConnectButtonsComponent } from '@components/connect-buttons/connect-buttons.component';
import { AnalyticsClickDirective } from '@directives/analytics-click.directive';
import { SFXDirective } from '@directives/sfx.directive';
import { TeleportOutletDirective } from '@directives/teleport.outlet.directive';
import { discordSetStatus, gameReset, isSetup } from '@helpers';
import { MetaService } from '@services/meta.service';
import type { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-home',
  imports: [
    SweetAlert2Module,
    ConnectButtonsComponent,
    AnalyticsClickDirective,
    SFXDirective,
    ButtonUpdateComponent,
    ButtonQuitComponent,
    TeleportOutletDirective,
    ButtonSettingsComponent,
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
    discordSetStatus({
      state: 'In Main Menu',
    });
  }

  async newGame() {
    if (isSetup()) {
      const res = await this.resetGameSwal()?.fire();
      if (!res) return;

      if (res.isConfirmed) {
        gameReset();
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
