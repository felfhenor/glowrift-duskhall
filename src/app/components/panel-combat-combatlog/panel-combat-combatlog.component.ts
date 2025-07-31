import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { marked } from 'marked';
import {
  combatLog,
  rarityItemTextColor,
  gamestate,
  getEntry,
  createGuardianForLocation,
} from '@helpers';
import { getHealthColor } from '@helpers/combat-log';
import type { DropRarity } from '@interfaces/droppable';
import type { Guardian, Hero } from '@interfaces';
import { IconHeroCombatComponent } from '@components/icon-hero-combat/icon-hero-combat.component';
import { IconGuardianCombatComponent } from '@components/icon-guardian-combat/icon-guardian-combat.component';

@Component({
  selector: 'app-panel-combat-combatlog',
  imports: [CommonModule, IconHeroCombatComponent, IconGuardianCombatComponent],
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

  public getHeroById(actorId: string): Hero | null {
    return gamestate().hero.heroes.find((h) => h.id === actorId) || null;
  }

  public getGuardianById(actorId: string): Guardian | null {
    const guardianContent = getEntry<Guardian>(actorId);
    if (!guardianContent) return null;

    const combat = gamestate().hero.combat;
    if (!combat) return guardianContent;

    const currentLocation = Object.values(gamestate().world.nodes).find(
      (node) =>
        node.x === combat.locationPosition.x &&
        node.y === combat.locationPosition.y,
    );

    if (!currentLocation) return guardianContent;

    return createGuardianForLocation(currentLocation, guardianContent);
  }
}
