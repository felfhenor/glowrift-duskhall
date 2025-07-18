const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');

// Helper to infer a JSON schema from a JS value
function inferSchema(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return { type: 'array', items: {} };
    // Assume homogeneous arrays
    return { type: 'array', items: inferSchema(value[0]) };
  }
  if (typeof value === 'object' && value !== null) {
    const properties = {};
    for (const key of Object.keys(value)) {
      properties[key] = inferSchema(value[key]);
    }
    return {
      type: 'object',
      properties,
      required: Object.keys(properties),
      additionalProperties: false,
    };
  }
  if (typeof value === 'string') return { type: 'string' };
  if (typeof value === 'number') return { type: 'number' };
  if (typeof value === 'boolean') return { type: 'boolean' };
  return {};
}

function generateSchemaForFile(yamlPath, schemaPath) {
  const doc = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
  if (!Array.isArray(doc) || doc.length === 0) {
    console.warn(`Skipping ${yamlPath}: not an array or empty.`);
    return;
  }
  // Use the first entry as the sample
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'array',
    items: inferSchema(doc[0]),
    title: path.basename(yamlPath, '.yml'),
    description: `Auto-generated schema for ${yamlPath}`,
  };
  fs.writeJsonSync(schemaPath, schema, { spaces: 2 });
  console.log(`Generated schema: ${schemaPath}`);
}

function main() {
  const gamedataDir = path.join(__dirname, '../gamedata');
  const schemaDir = path.join(__dirname, '../.vscode/schemas');
  fs.ensureDirSync(schemaDir);
  const types = fs.readdirSync(gamedataDir).filter(function(f) { return fs.statSync(path.join(gamedataDir, f)).isDirectory(); });
  for (const type of types) {
    const typeDir = path.join(gamedataDir, type);
    const files = fs.readdirSync(typeDir).filter(function(f) { return f.endsWith('.yml'); });
    if (files.length === 0) continue;
    // Use the first file as the sample
    const sampleFile = path.join(typeDir, files[0]);
    const schemaFile = path.join(schemaDir, `${type}.schema.json`);
    generateSchemaForFile(sampleFile, schemaFile);
  }
}

main(); 