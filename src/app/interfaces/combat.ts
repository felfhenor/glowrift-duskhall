import { Animatable } from './artable';
import { ElementBlock } from './element';
import { Branded } from './identifiable';
import { EquipmentSkill } from './skill';
import { StatBlock } from './stat';
import { WorldPosition } from './world';

export type CombatId = Branded<string, 'CombatId'>;

export interface CombatLog {
  combatId: CombatId;
  messageId: string;
  timestamp: number;
  locationName: string;
  message: string;
}

export type Combatant = Animatable & {
  id: string;
  name: string;

  isEnemy: boolean;

  level: number;
  hp: number;

  baseStats: StatBlock;
  totalStats: StatBlock;

  resistance: ElementBlock;
  affinity: ElementBlock;

  skillIds: string[];
  skillRefs: EquipmentSkill[];
};

export interface Combat {
  id: CombatId;
  locationName: string;
  locationPosition: WorldPosition;
  rounds: number;
  heroes: Combatant[];
  guardians: Combatant[];
}
