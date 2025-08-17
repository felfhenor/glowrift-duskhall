import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { AtlasImageComponent } from '@components/atlas-image/atlas-image.component';
import { claimLog, spriteGetFromNodeType } from '@helpers';
import { marked } from 'marked';

@Component({
  selector: 'app-panel-world-claimlog',
  imports: [CommonModule, AtlasImageComponent],
  templateUrl: './panel-world-claimlog.component.html',
  styleUrl: './panel-world-claimlog.component.scss',
})
export class PanelWorldClaimlogComponent {
  public allClaimLogs = computed(() =>
    claimLog().map((log) => ({
      ...log,
      message: marked.parse(log.message),
      sprite: spriteGetFromNodeType(log.locationType),
    })),
  );
}
