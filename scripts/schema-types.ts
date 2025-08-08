/**
 * Content Type Definitions for JSON Schema Generation
 * 
 * This file contains TypeScript type definitions that are used to automatically
 * generate JSON schemas for all game content YAML files. The schemas provide
 * IDE support, validation, and ensure consistency with the actual TypeScript
 * interfaces used in the application.
 * 
 * IMPORTANT: These types should be kept in sync with the actual interfaces
 * in src/app/interfaces/. When you modify interfaces, update these types
 * accordingly and run `npm run schemas:generate` to update the schemas.
 * 
 * WHY SEPARATE TYPES?
 * - The actual interfaces use complex imports and branded types that cause
 *   issues with typescript-json-schema
 * - These simplified types capture the essential structure for validation
 * - They avoid import resolution problems while maintaining type safety
 * 
 * MAINTENANCE WORKFLOW:
 * 1. When modifying src/app/interfaces/content-*.ts, also update this file
 * 2. Ensure new required fields are marked as required
 * 3. Update enum values to match the actual interface definitions
 * 4. Run `npm run schemas:generate` to regenerate schemas
 * 5. Test YAML validation in VSCode to ensure schemas work correctly
 */

// Basic types that mirror the actual interfaces
type DropRarity = 'Common' | 'Uncommon' | 'Rare' | 'Mystical' | 'Legendary' | 'Unique';
type GameElement = 'Fire' | 'Water' | 'Air' | 'Earth' | 'Holy';
type GameStat = 'Force' | 'Health' | 'Speed' | 'Aura';
type StatBlock = Record<GameStat, number>;

/**
 * Base Equipment Item Type
 * Mirrors: src/app/interfaces/content-equipment.ts -> EquipmentItemContent
 */
interface BaseEquipmentItem {
  /** Unique identifier for the equipment item */
  id: string;
  /** Display name of the equipment item */
  name: string;
  /** Sprite identifier for the item icon */
  sprite: string;
  /** Rarity level of the equipment */
  rarity: DropRarity;
  /** Minimum level for this item to drop */
  dropLevel: number;
  /** Base stats provided by this equipment */
  baseStats?: StatBlock;
  /** Talent boosts provided by this equipment */
  talentBoosts?: Array<{
    /** ID or name of the talent to boost */
    talentId: string;
    /** Amount to boost the talent by */
    value: number;
  }>;
  /** Element multipliers for this equipment */
  elementMultipliers?: Array<{
    element: GameElement;
    multiplier: number;
  }>;
  /** Enchantment level of the equipment */
  enchantLevel?: number;
  /** Trait IDs associated with this equipment */
  traitIds?: string[];
  /** Skill IDs associated with this equipment */
  skillIds?: string[];
  /** Whether this item can be upgraded */
  unableToUpgrade?: string[];
  /** Whether this item should not drop */
  preventDrop?: boolean;
  /** Whether this item can be modified */
  preventModification?: boolean;
  /** Whether this item is favorited */
  isFavorite?: boolean;
}

/**
 * Skill-related types
 * Mirror: src/app/interfaces/content-skill.ts
 */
type EquipmentSkillTargetBehavior = 'Always' | 'NotZeroHealth' | 'NotMaxHealth' | 'IfStatusEffect' | 'IfNotStatusEffect';
type EquipmentSkillAttribute = 'BypassDefense' | 'DamagesTarget' | 'AllowPlink' | 'HealsTarget';
type EquipmentSkillTargetType = 'Allies' | 'Enemies' | 'Self' | 'All';

interface EquipmentSkillTargetBehaviorData {
  behavior: EquipmentSkillTargetBehavior;
  statusEffectId?: string;
}

interface EquipmentSkillTechniqueStatusEffectApplication {
  statusEffectId: string;
  chance: number;
  duration: number;
}

interface EquipmentSkillContentTechnique {
  targets: number;
  targetType: EquipmentSkillTargetType;
  targetBehaviors: EquipmentSkillTargetBehaviorData[];
  damageScaling: StatBlock;
  elements: GameElement[];
  attributes: EquipmentSkillAttribute[];
  statusEffects?: EquipmentSkillTechniqueStatusEffectApplication[];
  combatMessage: string;
}

/**
 * Base Skill Item Type
 * Mirrors: src/app/interfaces/content-skill.ts -> EquipmentSkillContent
 */
interface BaseSkillItem {
  /** Unique identifier for the skill */
  id: string;
  /** Display name of the skill */
  name: string;
  /** Sprite identifier for the skill icon */
  sprite: string;
  /** Number of animation frames */
  frames?: number;
  /** Rarity level of the skill */
  rarity: DropRarity;
  /** Minimum level for this skill to drop */
  dropLevel: number;
  /** Number of uses per combat (-1 for unlimited) */
  usesPerCombat: number;
  /** Combat techniques this skill provides */
  techniques: EquipmentSkillContentTechnique[];
  /** Enchantment level of the skill */
  enchantLevel?: number;
  /** Status effect duration boosts */
  statusEffectDurationBoost?: Record<string, number>;
  /** Status effect chance boosts */
  statusEffectChanceBoost?: Record<string, number>;
  /** Whether upgrades are disabled */
  disableUpgrades?: boolean;
  /** Upgrades that cannot be applied */
  unableToUpgrade?: string[];
  /** Whether this item should not drop */
  preventDrop?: boolean;
  /** Whether this item can be modified */
  preventModification?: boolean;
  /** Whether this item is favorited */
  isFavorite?: boolean;
}

/**
 * Base Talent Item Type
 * Mirrors: src/app/interfaces/content-talent.ts -> TalentContent
 */
interface BaseTalentItem {
  /** Unique identifier for the talent */
  id: string;
  /** Display name of the talent */
  name: string;
  /** Description of the talent */
  description?: string;
  /** Sprite identifier for the talent icon */
  sprite?: string;
  /** Required talent ID to unlock this talent */
  requireTalentId?: string;
  /** Whether this talent applies to all skills */
  applyToAllSkills?: boolean;
  /** Whether this talent applies to all status effects */
  applyToAllStatusEffects?: boolean;
  /** Elements this talent applies to */
  applyToElements?: GameElement[];
  /** Skill IDs this talent applies to */
  applyToSkillIds?: string[];
  /** Status effect IDs this talent applies to */
  applyToStatusEffectIds?: string[];
  /** Attributes this talent applies to */
  applyToAttributes?: EquipmentSkillAttribute[];
  /** Stat boosts provided by this talent */
  boostStats?: StatBlock;
  /** Boosted status effect chance */
  boostedStatusEffectChance?: number;
  /** Boosted status effect duration */
  boostedStatusEffectDuration?: number;
  /** Status effect stat boosts */
  boostStatusEffectStats?: StatBlock;
  /** Additional targets provided */
  additionalTargets?: number;
  /** Chance to ignore consume */
  chanceToIgnoreConsume?: number;
  /** Status effects applied by this talent */
  applyStatusEffects?: EquipmentSkillTechniqueStatusEffectApplication[];
  /** Additional techniques provided */
  addTechniques?: EquipmentSkillContentTechnique[];
}

/**
 * Status Effect types
 * Mirror: src/app/interfaces/content-statuseffect.ts
 */
type StatusEffectTrigger = 'TurnStart' | 'TurnEnd';
type StatusEffectBehaviorType = 'ModifyStatusEffectData' | 'AddDamageToStat' | 'TakeDamageFromStat' | 
  'AddCombatStatElement' | 'TakeCombatStatElement' | 'AddCombatStatNumber' | 'TakeCombatStatNumber' | 
  'HealDamage' | 'TakeDamage' | 'SendMessage';

interface StatusEffectBehavior {
  type: StatusEffectBehaviorType;
  combatMessage?: string;
  [key: string]: any; // Allow additional properties for different behavior types
}

/**
 * Base Status Effect Item Type
 * Mirrors: src/app/interfaces/content-statuseffect.ts -> StatusEffectContent
 */
interface BaseStatusEffectItem {
  /** Unique identifier for the status effect */
  id: string;
  /** Display name of the status effect */
  name: string;
  /** Effect type (buff or debuff) */
  effectType: 'Buff' | 'Debuff';
  /** Elements associated with this status effect */
  elements: GameElement[];
  /** When this effect triggers */
  trigger: StatusEffectTrigger;
  /** Behaviors when applied */
  onApply: StatusEffectBehavior[];
  /** Behaviors when ticking */
  onTick: StatusEffectBehavior[];
  /** Behaviors when unapplied */
  onUnapply: StatusEffectBehavior[];
  /** Stat scaling for this effect */
  statScaling: StatBlock;
  /** Whether to use target stats */
  useTargetStats: boolean;
}

/**
 * Basic content item for other types that don't have specific interfaces yet
 */
interface BasicContentItem {
  /** Unique identifier for the content item */
  id: string;
  /** Display name of the content item */
  name: string;
  /** Additional properties allowed for extensibility */
  [key: string]: any;
}

// Content arrays as they appear in YAML files (arrays of content items)
// These are the types that typescript-json-schema uses to generate schemas

/** Equipment content types */
export type ArmorContent = BaseEquipmentItem[];
export type AccessoryContent = BaseEquipmentItem[];
export type TrinketContent = BaseEquipmentItem[];
export type WeaponContent = BaseEquipmentItem[];

/** Skill content type */
export type SkillContent = BaseSkillItem[];

/** Talent content type */
export type TalentArrayContent = BaseTalentItem[];

/** Status effect content type */
export type StatusEffectArrayContent = BaseStatusEffectItem[];

/** Basic content types (to be expanded as interfaces are created) */
export type GuardianContent = BasicContentItem[];
export type CurrencyContent = BasicContentItem[];
export type FestivalContent = BasicContentItem[];
export type TalentTreeContent = BasicContentItem[];
export type TraitEquipmentContent = BasicContentItem[];
export type TraitLocationContent = BasicContentItem[];
export type WorldConfigContent = BasicContentItem[];