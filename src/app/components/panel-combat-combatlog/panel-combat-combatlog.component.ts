import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { marked } from 'marked';
import { combatLog, rarityItemTextColor, gamestate } from '@helpers';
import { getHealthColor } from '@helpers/combat-log';
import type { DropRarity } from '@interfaces/droppable';
import { IconHeroComponent } from '@components/icon-hero/icon-hero.component';
import type { Hero } from '@interfaces';

@Component({
  selector: 'app-panel-combat-combatlog',
  imports: [CommonModule, IconHeroComponent],
  templateUrl: './panel-combat-combatlog.component.html',
  styleUrl: './panel-combat-combatlog.component.scss',
})
export class PanelCombatCombatlogComponent {
  public allHeroes = computed(() => {
    const heroes = gamestate().hero.heroes;
    console.log(
      'All hero names:',
      heroes.map((h) => h.name),
    ); // Add this
    return heroes;
  });
  private createCustomRenderer() {
    const renderer = new marked.Renderer();
    const regex: RegExp = /\((\d+)\/(\d+) HP remaining\)/;

    renderer.codespan = ({ text }: { text: string }) => {
      if (text.startsWith('rarity:')) {
        const [, rarity, itemName] = text.split(':');
        const colorClass = rarityItemTextColor(rarity as DropRarity);
        return `<span class="${colorClass} font-bold">${itemName}</span>`;
      }
      return `<code>${text}</code>`;
    };
    renderer.text = ({ text }: { text: string }) => {
      return text.replace(regex, (match, currentHp, maxHp) => {
        const current = parseInt(currentHp);
        const max = parseInt(maxHp);
        const colorClass = getHealthColor(current, max);
        return `<span class="${colorClass}">${match}</span>`;
      });
    };

    return renderer;
  }

  public allCombatLogs = computed(() =>
    combatLog().map((log) => ({
      ...log,
      rawMessage: log.message,
      message: marked.parse(log.message, {
        renderer: this.createCustomRenderer(),
      }),
    })),
  );

  public getActorFromMessage(message: string): Hero | null {
    const firstWord = message.split(' ')[0];
    const cleanName = firstWord.replace(/\*+/g, '');
    return this.allHeroes().find((h) => h.name === cleanName) || null;
  }
}
