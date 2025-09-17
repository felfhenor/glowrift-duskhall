import { Component, inject } from '@angular/core';
import { isInElectron } from '@helpers/discord';
import { MetaService } from '@services/meta.service';

@Component({
  selector: 'app-button-update',
  imports: [],
  templateUrl: './button-update.component.html',
  styleUrl: './button-update.component.scss',
})
export class ButtonUpdateComponent {
  public meta = inject(MetaService);

  public shouldShowUpdate = !isInElectron();
}
