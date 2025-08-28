import type { OnDestroy, OnInit } from '@angular/core';
import { Directive, inject, input, TemplateRef } from '@angular/core';
import { TeleportService } from '@services/teleport.service';

@Directive({
  selector: '[appTeleportTo]',
})
export class TeleportToDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<unknown>);
  private teleportService = inject(TeleportService);

  public appTeleportTo = input.required<string>();

  ngOnInit(): void {
    this.teleportService.startTeleportation(
      this.appTeleportTo(),
      this.templateRef,
    );
  }

  ngOnDestroy(): void {
    this.teleportService.finishTeleportation(this.appTeleportTo());
  }
}
