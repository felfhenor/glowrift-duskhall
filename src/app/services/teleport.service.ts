import type { TemplateRef, ViewContainerRef } from '@angular/core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TeleportService {
  private portalOutlets: Record<string, ViewContainerRef> = {};

  registerPortalOutlet(key: string, viewContainerRef: ViewContainerRef): void {
    this.portalOutlets[key] = viewContainerRef;
  }

  unregisterPortalOutlet(key: string): void {
    delete this.portalOutlets[key];
  }

  startTeleportation(key: string, templateRef: TemplateRef<unknown>): void {
    this.portalOutlets[key]?.createEmbeddedView(templateRef);
  }

  finishTeleportation(key: string): void {
    this.portalOutlets[key]?.clear();
  }
}
