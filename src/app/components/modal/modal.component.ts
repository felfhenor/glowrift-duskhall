import type { ElementRef } from '@angular/core';
import {
  Component,
  effect,
  HostListener,
  input,
  model,
  viewChild,
} from '@angular/core';
import { ButtonCloseComponent } from '@components/button-close/button-close.component';

@Component({
  selector: 'app-modal',
  imports: [ButtonCloseComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  public visible = model<boolean>(false);
  public allowEscToClose = input<boolean>(true);
  public showCloseButton = input<boolean>(false);

  public modal = viewChild<ElementRef<HTMLDialogElement>>('modal');

  @HostListener('document:keydown.escape', ['$event'])
  public onEscapeKeyDown($event: KeyboardEvent): void {
    if (this.allowEscToClose()) {
      this.visible.set(false);
      $event.preventDefault();
      $event.stopPropagation();
      $event.stopImmediatePropagation();
    }
  }

  constructor() {
    effect(() => {
      const visible = this.visible();
      if (!visible) {
        this.closeModal();
        return;
      }

      this.modal()?.nativeElement.showModal();
    });
  }

  public closeModal() {
    this.modal()?.nativeElement.close();
  }
}
