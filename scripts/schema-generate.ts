/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require('fs-extra');
const path = require('path');

// Ensure the schemas directory exists
const schemasDir = './schemas';
fs.ensureDirSync(schemasDir);

console.log('Generating JSON schemas from gamedata structure...');

// Basic schema structures based on the YAML content we've seen
const schemaTemplates: Record<string, any> = {
  equipment: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'array',
    title: 'Equipment content schema',
    description: 'JSON schema for equipment YAML content files (armor, accessory, trinket, weapon)',
    items: {
      type: 'object',
      required: ['id', 'name', 'sprite', 'rarity', 'dropLevel'],
      properties: {
        id: { type: 'string', description: 'Unique identifier for the equipment item' },
        name: { type: 'string', description: 'Display name of the equipment item' },
        sprite: { type: 'string', description: 'Sprite identifier for the item icon' },
        rarity: { 
          type: 'string', 
          enum: ['Common', 'Uncommon', 'Rare', 'Mystical', 'Legendary'],
          description: 'Rarity level of the equipment'
        },
        dropLevel: { type: 'integer', minimum: 1, description: 'Minimum level for this item to drop' },
        baseStats: {
          type: 'object',
          description: 'Base stats provided by this equipment',
          properties: {
            Health: { type: 'number' },
            Force: { type: 'number' },
            Speed: { type: 'number' },
            Aura: { type: 'number' }
          },
          additionalProperties: false
        },
        talentBoosts: {
          type: 'array',
          description: 'Talent boosts provided by this equipment',
          items: {
            type: 'object',
            required: ['talentId', 'value'],
            properties: {
              talentId: { type: 'string', description: 'ID or name of the talent to boost' },
              value: { type: 'number', description: 'Amount to boost the talent by' }
            },
            additionalProperties: false
          }
        }
      },
      additionalProperties: false
    }
  },

  skill: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'array',
    title: 'Skill content schema',
    description: 'JSON schema for skill YAML content files',
    items: {
      type: 'object',
      required: ['id', 'name', 'sprite', 'rarity', 'dropLevel', 'usesPerCombat', 'techniques'],
      properties: {
        id: { type: 'string', description: 'Unique identifier for the skill' },
        name: { type: 'string', description: 'Display name of the skill' },
        sprite: { type: 'string', description: 'Sprite identifier for the skill icon' },
        frames: { type: 'integer', minimum: 1, description: 'Number of animation frames' },
        rarity: { 
          type: 'string', 
          enum: ['Common', 'Uncommon', 'Rare', 'Mystical', 'Legendary'],
          description: 'Rarity level of the skill'
        },
        dropLevel: { type: 'integer', minimum: 1, description: 'Minimum level for this skill to drop' },
        usesPerCombat: { type: 'integer', minimum: -1, description: 'Number of uses per combat (-1 for unlimited)' },
        techniques: {
          type: 'array',
          description: 'Combat techniques this skill provides',
          items: {
            type: 'object',
            required: ['elements', 'attributes', 'targets', 'targetType', 'targetBehaviors', 'combatMessage'],
            properties: {
              elements: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['Fire', 'Water', 'Air', 'Earth', 'Holy']
                }
              },
              attributes: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['DamagesTarget', 'AllowPlink', 'HealsTarget', 'BypassDefense']
                }
              },
              targets: { type: 'integer', minimum: 1 },
              targetType: {
                type: 'string',
                enum: ['Allies', 'Enemies', 'Self', 'All']
              },
              targetBehaviors: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['behavior'],
                  properties: {
                    behavior: {
                      type: 'string',
                      enum: ['Always', 'NotZeroHealth', 'NotMaxHealth', 'IfStatusEffect', 'IfNotStatusEffect']
                    },
                    statusEffectId: { type: 'string' }
                  }
                }
              },
              damageScaling: {
                type: 'object',
                description: 'Damage scaling stats',
                properties: {
                  Health: { type: 'number' },
                  Force: { type: 'number' },
                  Speed: { type: 'number' },
                  Aura: { type: 'number' }
                },
                additionalProperties: false
              },
              combatMessage: { type: 'string', description: 'Message template for combat log' }
            },
            additionalProperties: false
          }
        }
      },
      additionalProperties: false
    }
  },

  basic: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'array',
    title: 'Basic content schema',
    description: 'JSON schema for basic content YAML files',
    items: {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: { type: 'string', description: 'Unique identifier' },
        name: { type: 'string', description: 'Display name' }
      },
      additionalProperties: true
    }
  }
};

// Content type mappings to schema templates
const contentSchemas: Record<string, string> = {
  accessory: 'equipment',
  armor: 'equipment', 
  trinket: 'equipment',
  weapon: 'equipment',
  skill: 'skill',
  talent: 'basic',
  statuseffect: 'basic',
  guardian: 'basic',
  currency: 'basic',
  festival: 'basic',
  talenttree: 'basic',
  traitequipment: 'basic',
  traitlocation: 'basic',
  worldconfig: 'basic'
};

// Generate schemas for each content type
for (const [contentType, templateType] of Object.entries(contentSchemas)) {
  try {
    console.log(`Generating schema for ${contentType}...`);
    
    const schemaPath = path.join(schemasDir, `${contentType}.schema.json`);
    const schema = schemaTemplates[templateType];
    
    // Update title and description for specific content type
    const customizedSchema = {
      ...schema,
      title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} content schema`,
      description: `JSON schema for ${contentType} YAML content files`
    };
    
    fs.writeJsonSync(schemaPath, customizedSchema, { spaces: 2 });
    console.log(`✓ Generated schema: ${schemaPath}`);
    
  } catch (error: any) {
    console.error(`Error generating schema for ${contentType}:`, error?.message || 'Unknown error');
  }
}

console.log('Schema generation complete!');