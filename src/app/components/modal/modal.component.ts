import { NgClass } from '@angular/common';
import type { ElementRef } from '@angular/core';
import {
  Component,
  effect,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { ButtonCloseComponent } from '@components/button-close/button-close.component';

@Component({
  selector: 'app-modal',
  imports: [ButtonCloseComponent, NgClass],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  public visible = model<boolean>(false);

  public allowEscToClose = input<boolean>(true);
  public showCloseButton = input<boolean>(false);
  public widthClass = input<string>('max-w-3xl');

  public modalClose = output<void>();

  public modal = viewChild<ElementRef<HTMLDialogElement>>('modal');

  constructor() {
    effect(() => {
      const visible = this.visible();
      if (!visible) {
        this.closeModal();
        return;
      }

      this.modal()?.nativeElement.show();
    });
  }

  public closeModal() {
    this.modal()?.nativeElement.close();
    this.visible.set(false);
    this.modalClose.emit();
  }
}
