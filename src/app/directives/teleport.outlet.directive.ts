import type { OnDestroy, OnInit } from '@angular/core';
import { Directive, inject, input, ViewContainerRef } from '@angular/core';
import { TeleportService } from '@services/teleport.service';

@Directive({
  selector: '[appTeleportOutlet]',
})
export class TeleportOutletDirective implements OnInit, OnDestroy {
  private viewContainerRef = inject(ViewContainerRef);
  private teleportService = inject(TeleportService);

  public appTeleportOutlet = input.required<string>();

  ngOnInit(): void {
    this.teleportService.registerPortalOutlet(
      this.appTeleportOutlet(),
      this.viewContainerRef,
    );
  }

  ngOnDestroy(): void {
    this.teleportService.unregisterPortalOutlet(this.appTeleportOutlet());
  }
}
