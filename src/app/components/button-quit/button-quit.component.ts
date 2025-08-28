import { Component, inject } from '@angular/core';
import { DisableOutsideElectronDirective } from '@directives/disable-outside-electron.directive';
import { SFXDirective } from '@directives/sfx.directive';
import { MetaService } from '@services/meta.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-button-quit',
  imports: [SweetAlert2Module, SFXDirective, DisableOutsideElectronDirective],
  templateUrl: './button-quit.component.html',
  styleUrl: './button-quit.component.scss',
})
export class ButtonQuitComponent {
  public meta = inject(MetaService);
}
