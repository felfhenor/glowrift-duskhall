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

// Settings for typescript-json-schema
const settings = {
  required: true,
  strictNullChecks: false,  // Disabled to handle complex types
  esModuleInterop: true,
  skipLibCheck: true,
  noImplicitAny: false,     // Disabled to handle complex types
  additionalProperties: false,
  titles: true,
  descriptions: true,
  ref: false,
  aliasRef: false,
  topRef: false,
  defaultProps: false,
  ignoreErrors: true        // Ignore TypeScript errors during schema generation
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
    strictNullChecks: false,    // Disabled to handle complex types
    esModuleInterop: true,
    skipLibCheck: true,
    noImplicitAny: false,       // Disabled to handle complex types
    resolveJsonModule: true,
    moduleResolution: 1,        // NodeJs
    target: 99,                 // ESNext
    allowSyntheticDefaultImports: true,
    baseUrl: path.resolve(__dirname, '../'),
    paths: {
      '@interfaces/*': ['src/app/interfaces/*'],
      '@interfaces': ['src/app/interfaces/index.ts'],
      '@helpers/*': ['src/app/helpers/*'],
      '@helpers': ['src/app/helpers/index.ts'],
    }
  }
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
  worldconfig: 'WorldConfigContent'
};

// Equipment types that all use the same schema
const equipmentTypes = ['accessory', 'armor', 'trinket', 'weapon'];

// Generate schemas for equipment types (all use the same interface)
console.log('Generating equipment schema from EquipmentItemContent interface...');
try {
  const equipmentSchema = TJS.generateSchema(program, 'EquipmentItemContent', settings);
  
  if (equipmentSchema) {
    // Convert single item schema to array schema for YAML content files
    const arraySchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'Equipment content schema',
      description: 'JSON schema for equipment YAML content files (armor, accessory, trinket, weapon), automatically generated from TypeScript interfaces',
      type: 'array',
      items: equipmentSchema
    };
    
    // Generate the same schema for all equipment types
    for (const equipmentType of equipmentTypes) {
      const customSchema = {
        ...arraySchema,
        title: `${equipmentType.charAt(0).toUpperCase() + equipmentType.slice(1)} content schema`,
        description: `JSON schema for ${equipmentType} YAML content files, automatically generated from TypeScript interfaces`
      };
      
      const schemaPath = path.join(schemasDir, `${equipmentType}.schema.json`);
      fs.writeJsonSync(schemaPath, customSchema, { spaces: 2 });
      console.log(`✓ Generated schema: ${schemaPath}`);
    }
  } else {
    console.warn('Could not generate equipment schema from EquipmentItemContent');
  }
} catch (error) {
  console.error('Error generating equipment schema:', error?.message || 'Unknown error');
}

// Generate schemas for other content types
for (const [contentType, typeName] of Object.entries(contentTypeMap)) {  
  try {
    console.log(`Generating schema for ${contentType} from TypeScript type ${typeName}...`);
    
    const schema = TJS.generateSchema(program, typeName, settings);
    
    if (!schema) {
      console.warn(`Could not generate schema for ${contentType} (${typeName})`);
      continue;
    }
    
    // For single content items, wrap in array for YAML content files
    const arraySchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} content schema`,
      description: `JSON schema for ${contentType} YAML content files, automatically generated from TypeScript interfaces`,
      type: 'array',
      items: schema
    };
    
    const schemaPath = path.join(schemasDir, `${contentType}.schema.json`);
    fs.writeJsonSync(schemaPath, arraySchema, { spaces: 2 });
    console.log(`✓ Generated schema: ${schemaPath}`);
    
  } catch (error) {
    console.error(`Error generating schema for ${contentType}:`, error?.message || 'Unknown error');
    console.error(error.stack);
  }
}

console.log('TypeScript-based schema generation complete!');