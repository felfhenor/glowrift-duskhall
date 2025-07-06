import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { marked } from 'marked';
import { combatLog, rarityItemColor } from '../../helpers';
import { DropRarity } from '../../interfaces/droppable';

@Component({
  selector: 'app-panel-combat-combatlog',
  imports: [CommonModule],
  templateUrl: './panel-combat-combatlog.component.html',
  styleUrl: './panel-combat-combatlog.component.scss',
})
export class PanelCombatCombatlogComponent {
  private createCustomRenderer() {
    const renderer = new marked.Renderer();

    renderer.codespan = ({ text }: { text: string }) => {
      if (text.startsWith('rarity:')) {
        const [, rarity, itemName] = text.split(':');
        const colorClass = rarityItemColor(rarity as DropRarity);
        return `<span class="text-${colorClass} font-bold">${itemName}</span>`;
      }
      return `<code>${text}</code>`;
    };

    return renderer;
  }

  public allCombatLogs = computed(() =>
    combatLog().map((log) => ({
      ...log,
      message: marked.parse(log.message, {
        renderer: this.createCustomRenderer(),
      }),
    })),
  );
}
