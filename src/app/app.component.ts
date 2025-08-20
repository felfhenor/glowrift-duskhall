import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { hideContextMenuStats } from '@helpers/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  @HostListener('document:contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): boolean {
    // Allow context menu for our custom stats comparison
    const target = event.target as Element;
    if (target?.closest('.context-menu-enabled')) {
      return true;
    }
    return false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    hideContextMenuStats();
  }
}
