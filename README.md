# Glowrift Duskhall

## Setup

1. `npm install`
1. `npm run setup`

## Development

1. ` npm start`

# Editor Support for YAML Content

## Recommended Extensions
- [YAML by Red Hat](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml) is now recommended for this project. It provides validation and autocompletion for YAML files.

## JSON Schema Generation
- JSON schemas for each data type in `gamedata/` are auto-generated from sample YAML files.
- Schemas are output to `.vscode/schemas/`.
- VSCode is configured to use these schemas for YAML validation and autocompletion.

### To Regenerate Schemas
Run:

```
node scripts/generate-schemas.ts
```

This will update all schemas in `.vscode/schemas/` based on the first YAML file in each `gamedata/<type>/` directory.

## VSCode Configuration
- `.vscode/settings.json` is set up to map each schema to its corresponding YAML files.
- `.vscode/extensions.json` recommends the YAML extension.

## Contribution
- When adding new data types or changing YAML structure, rerun the schema generation script and commit the updated schemas.
