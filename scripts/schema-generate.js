/**
 * YAML Schema Generation from TypeScript Interfaces
 * 
 * This script automatically generates JSON schemas for all game content types
 * using the `typescript-json-schema` library. This ensures that schemas stay
 * in sync with TypeScript type definitions.
 * 
 * HOW IT WORKS:
 * 1. Type definitions are maintained in `scripts/schema-types.ts`
 * 2. These types mirror the actual interfaces in `src/app/interfaces/`
 * 3. typescript-json-schema generates JSON schemas from these types
 * 4. Generated schemas provide IDE support and validation for YAML content
 * 
 * KEEPING SCHEMAS IN SYNC WITH TYPESCRIPT:
 * - The types in `schema-types.ts` should be updated when interfaces change
 * - Run `npm run schemas:generate` to regenerate schemas after type changes
 * - Schemas are automatically regenerated during `npm install` (postinstall)
 * 
 * BENEFITS:
 * - Real-time validation in VSCode for YAML content files
 * - IntelliSense autocomplete for properties and enum values
 * - Type safety ensures content matches expected TypeScript interfaces
 * - Single source of truth: TypeScript types drive both code and validation
 * 
 * MAINTENANCE:
 * When adding new content types or modifying existing ones:
 * 1. Update the TypeScript interfaces in `src/app/interfaces/`
 * 2. Update the corresponding types in `scripts/schema-types.ts`
 * 3. Run `npm run schemas:generate` to update schemas
 * 4. Add new content types to the contentTypeMap below
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

// Settings for typescript-json-schema
const settings = {
  required: true,
  strictNullChecks: true,
  esModuleInterop: true,
  skipLibCheck: true,
  noImplicitAny: true,
  additionalProperties: false,
  titles: true,
  descriptions: true,
  ref: false,
  aliasRef: false,
  topRef: false,
  defaultProps: false
};

// Create a program from the schema types file
const program = TJS.getProgramFromFiles(
  [path.resolve(__dirname, './schema-types.ts')],
  {
    strictNullChecks: true,
    esModuleInterop: true,
    skipLibCheck: true,
    noImplicitAny: true,
    resolveJsonModule: true,
    moduleResolution: 1, // NodeJs
    target: 99, // ESNext
    baseUrl: path.resolve(__dirname, '../'),
    paths: {
      '@interfaces/*': ['src/app/interfaces/*'],
      '@helpers': ['src/app/helpers/index'],
    }
  }
);

// Content type mappings to TypeScript type names
// Add new content types here when adding new game content categories
const contentTypeMap = {
  accessory: 'AccessoryContent',
  armor: 'ArmorContent',
  trinket: 'TrinketContent',
  weapon: 'WeaponContent',
  skill: 'SkillContent',
  talent: 'TalentArrayContent',
  statuseffect: 'StatusEffectArrayContent',
  guardian: 'GuardianContent',
  currency: 'CurrencyContent',
  festival: 'FestivalContent',
  talenttree: 'TalentTreeContent',
  traitequipment: 'TraitEquipmentContent',
  traitlocation: 'TraitLocationContent',
  worldconfig: 'WorldConfigContent'
};

// Generate schemas for each content type
for (const [contentType, typeName] of Object.entries(contentTypeMap)) {
  try {
    console.log(`Generating schema for ${contentType} from TypeScript type ${typeName}...`);
    
    const schema = TJS.generateSchema(program, typeName, settings);
    
    if (!schema) {
      console.warn(`Could not generate schema for ${contentType} (${typeName})`);
      continue;
    }
    
    // Customize the schema with content-specific information
    schema.title = `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} content schema`;
    schema.description = `JSON schema for ${contentType} YAML content files, automatically generated from TypeScript interfaces`;
    
    // Ensure the schema follows JSON Schema Draft 07
    schema.$schema = 'http://json-schema.org/draft-07/schema#';
    
    const schemaPath = path.join(schemasDir, `${contentType}.schema.json`);
    fs.writeJsonSync(schemaPath, schema, { spaces: 2 });
    console.log(`✓ Generated schema: ${schemaPath}`);
    
  } catch (error) {
    console.error(`Error generating schema for ${contentType}:`, error?.message || 'Unknown error');
    console.error(error.stack);
  }
}

console.log('TypeScript-based schema generation complete!');