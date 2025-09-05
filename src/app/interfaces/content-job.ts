import type { EquipmentSkillId } from '@interfaces/content-skill';
import type { TalentTreeId } from '@interfaces/content-talenttree';
import type {
  Branded,
  Identifiable,
  IsContentItem,
} from '@interfaces/identifiable';
import type { HasDescription } from '@interfaces/traits';

export type JobId = Branded<string, 'JobId'>;

export type JobContent = Identifiable &
  HasDescription &
  IsContentItem & {
    id: JobId;

    numSkills: number;
    defaultSkillIds: EquipmentSkillId[];
    talentTreeIds: TalentTreeId[];
  };
