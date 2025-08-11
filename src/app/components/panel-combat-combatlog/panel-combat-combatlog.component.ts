import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { IconSpriteCombatComponent } from '@components/icon-combat-sprite/icon-combat-sprite.component';
import { combatLog } from '@helpers';
import { combatLogHealthColor } from '@helpers/combat-log';
import { marked } from 'marked';

@Component({
  selector: 'app-panel-combat-combatlog',
  imports: [CommonModule, IconSpriteCombatComponent],
  templateUrl: './panel-combat-combatlog.component.html',
  styleUrl: './panel-combat-combatlog.component.scss',
})
export class PanelCombatCombatlogComponent {
  private createCustomRenderer() {
    const renderer = new marked.Renderer();
    const regex: RegExp = /\((\d+)\/(\d+) HP remaining\)/;

    renderer.codespan = ({ text }: { text: string }) => {
      if (text.startsWith('rarity:')) {
        const [, rarity, itemName] = text.split(':');
        return `<span class="text-${rarity} font-bold">${itemName}</span>`;
      }
      return `<code>${text}</code>`;
    };
    renderer.text = ({ text }: { text: string }) => {
      return text.replace(regex, (match, currentHp, maxHp) => {
        const current = parseInt(currentHp);
        const max = parseInt(maxHp);
        const colorClass = combatLogHealthColor(current, max);
        return `<span class="${colorClass}">${match}</span>`;
      });
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
