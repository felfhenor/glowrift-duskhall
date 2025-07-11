import { Animatable } from '@interfaces/artable';
import { ElementBlock } from '@interfaces/element';
import { Branded } from '@interfaces/identifiable';
import { EquipmentSkill, EquipmentSkillId } from '@interfaces/skill';
import { StatBlock } from '@interfaces/stat';
import { TalentId } from '@interfaces/talent';
import { WorldPosition } from '@interfaces/world';

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

  skillIds: EquipmentSkillId[];
  skillRefs: EquipmentSkill[];

  talents: Record<TalentId, number>;
};

export interface Combat {
  id: CombatId;
  locationName: string;
  locationPosition: WorldPosition;
  rounds: number;
  heroes: Combatant[];
  guardians: Combatant[];
}
