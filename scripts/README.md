# YAML Schema Generation System

This directory contains the TypeScript-based schema generation system that automatically creates JSON schemas for all game content YAML files.

## How It Works

The schema generation system uses the `typescript-json-schema` library to automatically generate JSON schemas from TypeScript type definitions. This ensures that the schemas always stay in sync with the actual TypeScript interfaces used in the application.

### Key Files

- **`schema-generate.js`** - Main script that generates JSON schemas from TypeScript types
- **`schema-types.ts`** - TypeScript type definitions that mirror the actual interfaces
- **`../schemas/*.schema.json`** - Generated JSON schema files (auto-generated, do not edit)

## Keeping Schemas in Sync with TypeScript

The schemas are automatically generated from TypeScript definitions, which ensures they stay in sync with the actual code interfaces. Here's how it works:

1. **Type Definitions**: The `schema-types.ts` file contains simplified TypeScript type definitions that mirror the actual interfaces in `src/app/interfaces/`

2. **Automatic Generation**: The `typescript-json-schema` library reads these type definitions and generates corresponding JSON schemas

3. **VSCode Integration**: The generated schemas are automatically used by VSCode for YAML validation and IntelliSense

### When Interfaces Change

When you modify TypeScript interfaces in `src/app/interfaces/`, follow these steps:

1. **Update Schema Types**: Modify the corresponding types in `scripts/schema-types.ts` to match the interface changes
2. **Regenerate Schemas**: Run `npm run schemas:generate` to update the JSON schemas
3. **Test Integration**: Open a YAML file in VSCode to verify the new validation works

### Automatic Regeneration

Schemas are automatically regenerated in these scenarios:
- During `npm install` (via the `postinstall` script)
- When you run `npm run schemas:generate` manually
- As part of the build process

## Benefits

### For Developers
- **Real-time validation** in VSCode for YAML content files
- **IntelliSense autocomplete** for properties and enum values  
- **Type safety** ensures content matches expected TypeScript interfaces
- **Single source of truth**: TypeScript types drive both code and validation

### For Content Creators
- **Immediate feedback** when editing YAML files
- **Autocomplete suggestions** for valid property names and values
- **Error highlighting** for invalid or missing required fields
- **Documentation tooltips** showing property descriptions

## Supported Content Types

All game content types have schema validation:

### Equipment Types (Detailed validation)
- `armor`, `accessory`, `trinket`, `weapon` - Comprehensive schemas with required fields, stat validation, and rarity enums

### Skills (Advanced validation)  
- Complex schema including combat techniques, elements, attributes, targeting behaviors, and damage scaling

### Other Content Types (Extensible validation)
- `talent`, `statuseffect`, `guardian`, `currency`, `festival`, `talenttree`, `traitequipment`, `traitlocation`, `worldconfig`

## Adding New Content Types

To add a new content type:

1. **Create Interface**: Add the TypeScript interface in `src/app/interfaces/`
2. **Add Schema Type**: Add corresponding type in `scripts/schema-types.ts`
3. **Update Mapping**: Add the content type to `contentTypeMap` in `schema-generate.js`
4. **Add VSCode Mapping**: Add the schema mapping to `.vscode/settings.json`
5. **Generate Schema**: Run `npm run schemas:generate`

## Technical Details

### typescript-json-schema Configuration

The generation uses these settings for optimal schema quality:
- `required: true` - Properly handles required vs optional fields
- `additionalProperties: false` - Strict validation, no unexpected properties
- `titles: true` & `descriptions: true` - Rich documentation in schemas
- `strictNullChecks: true` - Proper null/undefined handling

### Why Separate Schema Types?

The `schema-types.ts` file contains simplified versions of the actual interfaces because:
- The actual interfaces use complex imports and branded types that cause issues with `typescript-json-schema`
- Path resolution problems with the `@interfaces/*` TypeScript path mappings
- Need to avoid circular dependencies and complex type relationships

The schema types capture the essential structure for validation while avoiding these technical issues.

## Troubleshooting

### Schema Generation Fails
- Check that `typescript-json-schema` is installed: `npm list typescript-json-schema`
- Verify TypeScript syntax in `schema-types.ts`
- Check for import errors or missing type definitions

### VSCode Validation Not Working
- Ensure schemas are generated: `ls schemas/`
- Check `.vscode/settings.json` has correct schema mappings
- Restart VSCode if changes aren't recognized
- Verify the `redhat.vscode-yaml` extension is installed

### Schema Out of Sync
- Compare `schema-types.ts` with actual interfaces in `src/app/interfaces/`
- Run `npm run schemas:generate` to regenerate
- Check for TypeScript compilation errors in the schema generation