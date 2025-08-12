/**
 * YAML Schema Generation from TypeScript Interfaces
 *
 * This script automatically generates JSON schemas for all game content types
 * using the `typescript-json-schema` library directly from the actual TypeScript
 * interfaces in the codebase. This ensures that schemas stay perfectly in sync
 * with TypeScript type definitions.
 *
 * HOW IT WORKS:
 * 1. Reads TypeScript interfaces directly from `src/app/interfaces/`
 * 2. typescript-json-schema generates JSON schemas from these interfaces
 * 3. Generated schemas provide IDE support and validation for YAML content
 *
 * KEEPING SCHEMAS IN SYNC WITH TYPESCRIPT:
 * - Schemas are automatically generated from actual TypeScript interfaces
 * - Run `npm run schemas:generate` to regenerate schemas after interface changes
 * - Schemas are automatically regenerated during `npm install` (postinstall)
 *
 * BENEFITS:
 * - Real-time validation in VSCode for YAML content files
 * - IntelliSense autocomplete for properties and enum values
 * - Type safety ensures content matches expected TypeScript interfaces
 * - Single source of truth: TypeScript interfaces drive both code and validation
 * - No manual maintenance required - schemas automatically stay in sync
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

const TJS = require('typescript-json-schema');
const fs = require('fs-extra');
const path = require('path');

// Ensure the schemas directory exists
const schemasDir = './schemas';
fs.ensureDirSync(schemasDir);

console.log('Generating JSON schemas from TypeScript interfaces...');

// Post-process schema to fix issues with branded types, StatBlocks, and optional properties
function fixSchema(schema: any): any {
  if (!schema) return schema;

  // Recursively process the schema
  function processSchema(obj: any, parentKey?: string): any {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item: any) => processSchema(item));
    }

    const processed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      let processedValue = processSchema(value as any, key);

      // Fix branded type IDs - convert complex allOf structures to simple strings for ID fields
      if (key === 'id' || key.includes('Id') || key.endsWith('id')) {
        if (processedValue && typeof processedValue === 'object') {
          if (processedValue.allOf || processedValue.type === 'object') {
            // Convert branded types to simple string type
            processedValue = {
              type: 'string',
              title: key,
            };
          }
        }
      }

      // Fix StatBlock objects and similar Record types to make all properties optional
      const statBlockKeys = [
        'baseStats',
        'damageScaling',
        'boostStats',
        'boostStatusEffectStats',
        'statScaling',
      ];
      const elementBlockKeys = [
        'resistance',
        'affinity',
        'repeatActionChance',
        'skillStrikeAgainChance',
        'skillAdditionalUseChance',
        'skillAdditionalUseCount',
        'redirectionChance',
        'missChance',
        'debuffIgnoreChance',
        'damageReflectPercent',
      ];

      if (statBlockKeys.includes(key)) {
        if (
          processedValue &&
          processedValue.properties &&
          processedValue.required
        ) {
          // Make all StatBlock properties optional
          delete processedValue.required;
          processedValue.title = key;
          processedValue.description =
            'Stat block - you can specify any combination of Force, Health, Speed, and Aura values';
        }
      }

      if (elementBlockKeys.includes(key)) {
        if (
          processedValue &&
          processedValue.properties &&
          processedValue.required
        ) {
          // Make all ElementBlock properties optional
          delete processedValue.required;
          processedValue.title = key;
          processedValue.description =
            'Element block - you can specify any combination of Fire, Water, Earth, and Air values';
        }
      }

      // Fix CombatantCombatStats to make all sub-properties optional
      if (key === 'combatStats') {
        if (processedValue && processedValue.properties) {
          // Make the top-level combatStats properties optional
          if (processedValue.required) {
            delete processedValue.required;
          }

          // Make all element block sub-properties optional too
          for (const [subKey, subValue] of Object.entries(
            processedValue.properties,
          )) {
            if (
              subValue &&
              typeof subValue === 'object' &&
              (subValue as any).required
            ) {
              delete (subValue as any).required;
            }
          }

          processedValue.description =
            'Combat stats - all properties are optional';
        }
      }

      // Fix all ID-related arrays to be arrays of strings (run after processing)
      if (
        key.includes('Id') &&
        key.endsWith('s') &&
        processedValue &&
        processedValue.type === 'array'
      ) {
        processedValue = {
          type: 'array',
          items: { type: 'string' },
          title: key,
          description: `Array of ${key.replace('s', '')} IDs`,
        };
      }

      processed[key] = processedValue;
    }

    // Remove certain properties from required arrays
    if (processed.required && Array.isArray(processed.required)) {
      const fieldsToMakeOptional = [
        // Build-time generated fields
        '__type',

        // StatBlock fields should be optional in content
        'baseStats',
        'damageScaling',
        'boostStats',
        'boostStatusEffectStats',
        'statScaling',

        // Equipment-specific optional fields
        'talentBoosts',
        'elementMultipliers',
        'skillIds',
        'traitIds',

        // Guardian-specific optional fields
        'affinity',
        'combatStats',
        'resistance',
        'talents',

        // Skill properties that are filled in at import time
        'enchantLevel',
        'usesPerCombat',
        'numTargets',
        'techniques',
        'statusEffectDurationBoost',
        'statusEffectChanceBoost',
        'disableUpgrades',
        'unableToUpgrade',

        // Technique properties
        'statusEffects',

        // Talent properties that should be optional
        'requireTalentId',
        'applyToAllSkills',
        'applyToAllStatusEffects',
        'applyToElements',
        'applyToSkillIds',
        'applyToStatusEffectIds',
        'applyToAttributes',
        'boostedStatusEffectChance',
        'boostedStatusEffectDuration',
        'additionalTargets',
        'chanceToIgnoreConsume',
        'applyStatusEffects',
        'addTechniques',

        // Status Effect proprties that should be optional
        'effectType',
        'onTick',
        'onUnapply',
        'useTargetStats',

        // Trait properties that should be optional (most trait properties)
        'effects',
        'enchantLevel',
        'baseStats',
        'talentBoosts',
        'elementMultipliers',
        'traitIds',

        // Location trait effects that should be optional
        'combat',
        'currency',
        'worldgen',
        'exploration',

        'townStats',
        'marketTradeBonusPercent',
        'merchantFindItemBonus',
        'breakdownCurrencyBonus',
        'healOverTimeBonus',
      ];

      // Filter out fields that should be optional
      processed.required = processed.required.filter(
        (field: string) => !fieldsToMakeOptional.includes(field),
      );

      // If no required fields left, remove the required array entirely
      if (processed.required.length === 0) {
        delete processed.required;
      }
    }

    return processed;
  }

  return processSchema(schema);
}

// Additional post-processing function to fix complex nested ID arrays
function postProcessIdArrays(schema: any): any {
  if (!schema) return schema;

  function traverse(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(traverse);
    }

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      let processedValue = traverse(value);

      // Fix any array with complex allOf items that should be simple strings
      if (
        key.includes('Id') &&
        key.endsWith('s') &&
        processedValue &&
        processedValue.type === 'array' &&
        processedValue.items &&
        processedValue.items.allOf
      ) {
        // Check if it's a branded type pattern (empty object + string)
        const hasString = processedValue.items.allOf.some(
          (item: any) => item.type === 'string',
        );
        const hasEmptyObject = processedValue.items.allOf.some(
          (item: any) =>
            item.type === 'object' &&
            (!item.properties || Object.keys(item.properties).length === 0),
        );

        if (hasString && hasEmptyObject) {
          processedValue = {
            type: 'array',
            items: { type: 'string' },
            title: key,
            description: `Array of ${key.replace('s', '')} IDs`,
          };
        }
      }

      result[key] = processedValue;
    }

    return result;
  }

  return traverse(schema);
}

// Settings for typescript-json-schema
const settings = {
  required: true,
  strictNullChecks: false, // Disabled to handle complex types
  esModuleInterop: true,
  skipLibCheck: true,
  noImplicitAny: false, // Disabled to handle complex types
  additionalProperties: false,
  titles: true,
  descriptions: true,
  ref: false,
  aliasRef: false,
  topRef: false,
  defaultProps: false,
  ignoreErrors: true, // Ignore TypeScript errors during schema generation
  excludePrivate: true,
  rejectDateType: false,
};

// Create a program from the actual interface files
const program = TJS.getProgramFromFiles(
  [
    path.resolve(__dirname, '../src/app/interfaces/content-equipment.ts'),
    path.resolve(__dirname, '../src/app/interfaces/content-skill.ts'),
    path.resolve(__dirname, '../src/app/interfaces/content-talent.ts'),
    path.resolve(__dirname, '../src/app/interfaces/content-statuseffect.ts'),
    path.resolve(__dirname, '../src/app/interfaces/content-currency.ts'),
    path.resolve(__dirname, '../src/app/interfaces/content-guardian.ts'),
    path.resolve(__dirname, '../src/app/interfaces/content-festival.ts'),
    path.resolve(__dirname, '../src/app/interfaces/content-talenttree.ts'),
    path.resolve(__dirname, '../src/app/interfaces/content-trait-equipment.ts'),
    path.resolve(__dirname, '../src/app/interfaces/content-trait-location.ts'),
    path.resolve(__dirname, '../src/app/interfaces/worldconfig.ts'),
  ],
  {
    strictNullChecks: false, // Disabled to handle complex types
    esModuleInterop: true,
    skipLibCheck: true,
    noImplicitAny: false, // Disabled to handle complex types
    resolveJsonModule: true,
    moduleResolution: 1, // NodeJs
    target: 99, // ESNext
    allowSyntheticDefaultImports: true,
    baseUrl: path.resolve(__dirname, '../'),
    paths: {
      '@interfaces/*': ['src/app/interfaces/*'],
      '@interfaces': ['src/app/interfaces/index.ts'],
      '@helpers/*': ['src/app/helpers/*'],
      '@helpers': ['src/app/helpers/index.ts'],
    },
  },
);

// Content type mappings to actual TypeScript interface names
// Equipment types (armor, accessory, trinket, weapon) all use the same EquipmentItemContent interface
const contentTypeMap = {
  // Individual content types with their specific interfaces
  skill: 'EquipmentSkillContent',
  talent: 'TalentContent',
  statuseffect: 'StatusEffectContent',
  currency: 'CurrencyContent',
  guardian: 'GuardianContent',
  festival: 'FestivalContent',
  talenttree: 'TalentTreeContent',
  traitequipment: 'TraitEquipmentContent',
  traitlocation: 'TraitLocationContent',
  worldconfig: 'WorldConfigContent',
};

// Equipment types that all use the same schema
const equipmentTypes = ['accessory', 'armor', 'trinket', 'weapon'];

// Generate schemas for equipment types (all use the same interface)
console.log(
  'Generating equipment schema from EquipmentItemContent interface...',
);
try {
  let equipmentSchema = TJS.generateSchema(
    program,
    'EquipmentItemContent',
    settings,
  );

  if (equipmentSchema) {
    // Fix schema issues
    equipmentSchema = postProcessIdArrays(fixSchema(equipmentSchema));

    // Convert single item schema to array schema for YAML content files
    const arraySchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Equipment content schema',
      description:
        'JSON schema for equipment YAML content files (armor, accessory, trinket, weapon), automatically generated from TypeScript interfaces',
      type: 'array',
      items: equipmentSchema,
    };

    // Generate the same schema for all equipment types
    for (const equipmentType of equipmentTypes) {
      const customSchema = {
        ...arraySchema,
        title: `${equipmentType.charAt(0).toUpperCase() + equipmentType.slice(1)} content schema`,
        description: `JSON schema for ${equipmentType} YAML content files, automatically generated from TypeScript interfaces`,
      };

      const schemaPath = path.join(schemasDir, `${equipmentType}.schema.json`);
      fs.writeJsonSync(schemaPath, customSchema, { spaces: 2 });
      console.log(`✓ Generated schema: ${schemaPath}`);
    }
  } else {
    console.warn(
      'Could not generate equipment schema from EquipmentItemContent',
    );
  }
} catch (error: any) {
  console.error(
    'Error generating equipment schema:',
    error?.message || 'Unknown error',
  );
}

// Generate schemas for other content types
for (const [contentType, typeName] of Object.entries(contentTypeMap)) {
  try {
    console.log(
      `Generating schema for ${contentType} from TypeScript type ${typeName}...`,
    );

    let schema = TJS.generateSchema(program, typeName, settings);

    if (!schema) {
      console.warn(
        `Could not generate schema for ${contentType} (${typeName})`,
      );
      continue;
    }

    // Fix schema issues
    schema = postProcessIdArrays(fixSchema(schema));

    // For single content items, wrap in array for YAML content files
    const arraySchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} content schema`,
      description: `JSON schema for ${contentType} YAML content files, automatically generated from TypeScript interfaces`,
      type: 'array',
      items: schema,
    };

    const schemaPath = path.join(schemasDir, `${contentType}.schema.json`);
    fs.writeJsonSync(schemaPath, arraySchema, { spaces: 2 });
    console.log(`✓ Generated schema: ${schemaPath}`);
  } catch (error: any) {
    console.error(
      `Error generating schema for ${contentType}:`,
      error?.message || 'Unknown error',
    );
    console.error(error.stack);
  }
}

console.log('TypeScript-based schema generation complete!');
