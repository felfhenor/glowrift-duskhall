import {
  allContentById,
  allIdsByName,
  getEntriesByType,
  getEntry,
  setAllContentById,
  setAllIdsByName,
} from '@helpers/content';
import type { ContentType, IsContentItem } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Angular core to avoid dependencies
vi.mock('@angular/core', () => ({
  signal: vi.fn((initialValue) => {
    let value = initialValue;
    const signalFn = vi.fn(() => value) as unknown as {
      (): typeof initialValue;
      set: (newValue: typeof initialValue) => void;
      asReadonly: () => unknown;
    };
    signalFn.set = vi.fn((newValue: typeof initialValue) => {
      value = newValue;
    });
    signalFn.asReadonly = vi.fn(() => signalFn);
    return signalFn;
  }),
}));

describe('Content Functions', () => {
  // Mock content data for testing
  const mockWeapon: IsContentItem = {
    id: 'sword-1',
    name: 'Iron Sword',
    __type: 'weapon',
  };

  const mockArmor: IsContentItem = {
    id: 'armor-1',
    name: 'Leather Armor',
    __type: 'armor',
  };

  const mockSkill: IsContentItem = {
    id: 'skill-1',
    name: 'Fireball',
    __type: 'skill',
  };

  const mockSkill2: IsContentItem = {
    id: 'skill-2',
    name: 'Ice Bolt',
    __type: 'skill',
  };

  const mockGuardian: IsContentItem = {
    id: 'guardian-1',
    name: 'Fire Elemental',
    __type: 'guardian',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the content state before each test
    setAllIdsByName(new Map());
    setAllContentById(new Map());
  });

  describe('setAllIdsByName', () => {
    it('should set the name-to-id mapping', () => {
      const nameToIdMap = new Map([
        ['Iron Sword', 'sword-1'],
        ['Fireball', 'skill-1'],
      ]);

      setAllIdsByName(nameToIdMap);

      const result = allIdsByName();
      expect(result.get('Iron Sword')).toBe('sword-1');
      expect(result.get('Fireball')).toBe('skill-1');
    });

    it('should create a new Map instance (not reference)', () => {
      const originalMap = new Map([['Test Item', 'test-1']]);

      setAllIdsByName(originalMap);

      const storedMap = allIdsByName();
      expect(storedMap).not.toBe(originalMap);
      expect(storedMap.get('Test Item')).toBe('test-1');
    });

    it('should handle empty map', () => {
      setAllIdsByName(new Map());

      const result = allIdsByName();
      expect(result.size).toBe(0);
    });

    it('should replace existing mapping', () => {
      const firstMap = new Map([['Item A', 'id-1']]);
      const secondMap = new Map([['Item B', 'id-2']]);

      setAllIdsByName(firstMap);
      expect(allIdsByName().get('Item A')).toBe('id-1');

      setAllIdsByName(secondMap);
      expect(allIdsByName().get('Item A')).toBeUndefined();
      expect(allIdsByName().get('Item B')).toBe('id-2');
    });
  });

  describe('setAllContentById', () => {
    it('should set the id-to-content mapping', () => {
      const contentMap = new Map([
        ['sword-1', mockWeapon],
        ['skill-1', mockSkill],
      ]);

      setAllContentById(contentMap);

      const result = allContentById();
      expect(result.get('sword-1')).toEqual(mockWeapon);
      expect(result.get('skill-1')).toEqual(mockSkill);
    });

    it('should create a new Map instance (not reference)', () => {
      const originalMap = new Map([['test-1', mockWeapon]]);

      setAllContentById(originalMap);

      const storedMap = allContentById();
      expect(storedMap).not.toBe(originalMap);
      expect(storedMap.get('test-1')).toEqual(mockWeapon);
    });

    it('should handle empty map', () => {
      setAllContentById(new Map());

      const result = allContentById();
      expect(result.size).toBe(0);
    });

    it('should replace existing content', () => {
      const firstMap = new Map([['item-1', mockWeapon]]);
      const secondMap = new Map([['item-2', mockArmor]]);

      setAllContentById(firstMap);
      expect(allContentById().get('item-1')).toEqual(mockWeapon);

      setAllContentById(secondMap);
      expect(allContentById().get('item-1')).toBeUndefined();
      expect(allContentById().get('item-2')).toEqual(mockArmor);
    });
  });

  describe('getEntriesByType', () => {
    beforeEach(() => {
      // Set up test data
      const contentMap = new Map([
        ['sword-1', mockWeapon],
        ['armor-1', mockArmor],
        ['skill-1', mockSkill],
        ['skill-2', mockSkill2],
        ['guardian-1', mockGuardian],
      ]);
      setAllContentById(contentMap);
    });

    it('should return all entries of a specific type', () => {
      const skills = getEntriesByType<IsContentItem>('skill');

      expect(skills).toHaveLength(2);
      expect(skills).toContain(mockSkill);
      expect(skills).toContain(mockSkill2);
    });

    it('should return empty array for non-existent type', () => {
      const currency = getEntriesByType<IsContentItem>('currency');

      expect(currency).toHaveLength(0);
      expect(Array.isArray(currency)).toBe(true);
    });

    it('should return only weapons when filtering by weapon type', () => {
      const weapons = getEntriesByType<IsContentItem>('weapon');

      expect(weapons).toHaveLength(1);
      expect(weapons[0]).toEqual(mockWeapon);
    });

    it('should return only armor when filtering by armor type', () => {
      const armor = getEntriesByType<IsContentItem>('armor');

      expect(armor).toHaveLength(1);
      expect(armor[0]).toEqual(mockArmor);
    });

    it('should return only guardians when filtering by guardian type', () => {
      const guardians = getEntriesByType<IsContentItem>('guardian');

      expect(guardians).toHaveLength(1);
      expect(guardians[0]).toEqual(mockGuardian);
    });

    it('should handle all content types', () => {
      const allTypes: ContentType[] = [
        'worldconfig',
        'currency',
        'guardian',
        'skill',
        'weapon',
        'accessory',
        'trinket',
        'armor',
        'festival',
        'statuseffect',
        'talent',
        'talenttree',
        'traitequipment',
        'traitlocation',
        'townupgrade',
        'locationupgrade',
      ];

      // Should not throw for any content type
      allTypes.forEach((type) => {
        expect(() => getEntriesByType<IsContentItem>(type)).not.toThrow();
      });
    });

    it('should return empty array when no content is loaded', () => {
      setAllContentById(new Map());

      const skills = getEntriesByType<IsContentItem>('skill');
      expect(skills).toHaveLength(0);
    });
  });

  describe('getEntry', () => {
    beforeEach(() => {
      // Set up test data
      const nameToIdMap = new Map([
        ['Iron Sword', 'sword-1'],
        ['Fireball', 'skill-1'],
        ['Leather Armor', 'armor-1'],
      ]);

      const contentMap = new Map([
        ['sword-1', mockWeapon],
        ['armor-1', mockArmor],
        ['skill-1', mockSkill],
        ['guardian-1', mockGuardian],
      ]);

      setAllIdsByName(nameToIdMap);
      setAllContentById(contentMap);
    });

    it('should return entry when queried by id', () => {
      const result = getEntry<IsContentItem>('sword-1');
      expect(result).toEqual(mockWeapon);
    });

    it('should return entry when queried by name', () => {
      const result = getEntry<IsContentItem>('Iron Sword');
      expect(result).toEqual(mockWeapon);
    });

    it('should return undefined for non-existent id', () => {
      const result = getEntry<IsContentItem>('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-existent name', () => {
      const result = getEntry<IsContentItem>('Non-existent Item');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = getEntry<IsContentItem>('');
      expect(result).toBeUndefined();
    });

    it('should return undefined for null input', () => {
      const result = getEntry<IsContentItem>(null as unknown as string);
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined input', () => {
      const result = getEntry<IsContentItem>(undefined as unknown as string);
      expect(result).toBeUndefined();
    });

    it('should prioritize name lookup over direct id lookup', () => {
      // Add a content item with id that matches another item's name
      const conflictItem: IsContentItem = {
        id: 'Iron Sword',
        name: 'Conflicting Item',
        __type: 'armor',
      };

      const contentMap = new Map([
        ['sword-1', mockWeapon],
        ['Iron Sword', conflictItem],
      ]);
      setAllContentById(contentMap);

      const result = getEntry<IsContentItem>('Iron Sword');
      expect(result).toEqual(mockWeapon); // Should return the name lookup result, not direct id
    });

    it('should handle name lookup when id lookup fails', () => {
      const result = getEntry<IsContentItem>('Fireball');
      expect(result).toEqual(mockSkill);
    });

    it('should handle multiple entries of same type correctly', () => {
      const skillResult = getEntry<IsContentItem>('skill-1');
      expect(skillResult).toEqual(mockSkill);
      expect(skillResult?.__type).toBe('skill');
    });

    it('should handle case-sensitive lookups', () => {
      const lowerCase = getEntry<IsContentItem>('iron sword');
      const upperCase = getEntry<IsContentItem>('IRON SWORD');
      const correctCase = getEntry<IsContentItem>('Iron Sword');

      expect(lowerCase).toBeUndefined();
      expect(upperCase).toBeUndefined();
      expect(correctCase).toEqual(mockWeapon);
    });

    it('should work with generic type parameter', () => {
      interface MockWeaponItem extends IsContentItem {
        damage: number;
      }

      const typedWeapon: MockWeaponItem = {
        ...mockWeapon,
        damage: 10,
      };

      const contentMap = new Map([['sword-1', typedWeapon]]);
      setAllContentById(contentMap);

      const result = getEntry<MockWeaponItem>('sword-1');
      expect(result).toEqual(typedWeapon);
      expect(result?.damage).toBe(10);
    });
  });

  describe('Integration tests', () => {
    it('should work with complete content workflow', () => {
      // Set up both mappings
      const nameToIdMap = new Map([
        ['Magic Sword', 'magic-sword-1'],
        ['Lightning Bolt', 'lightning-skill-1'],
      ]);

      const magicSword: IsContentItem = {
        id: 'magic-sword-1',
        name: 'Magic Sword',
        __type: 'weapon',
      };

      const lightningBolt: IsContentItem = {
        id: 'lightning-skill-1',
        name: 'Lightning Bolt',
        __type: 'skill',
      };

      const contentMap = new Map([
        ['magic-sword-1', magicSword],
        ['lightning-skill-1', lightningBolt],
      ]);

      setAllIdsByName(nameToIdMap);
      setAllContentById(contentMap);

      // Test filtering by type
      const weapons = getEntriesByType<IsContentItem>('weapon');
      const skills = getEntriesByType<IsContentItem>('skill');

      expect(weapons).toHaveLength(1);
      expect(weapons[0]).toEqual(magicSword);
      expect(skills).toHaveLength(1);
      expect(skills[0]).toEqual(lightningBolt);

      // Test getting by name and id
      expect(getEntry<IsContentItem>('Magic Sword')).toEqual(magicSword);
      expect(getEntry<IsContentItem>('magic-sword-1')).toEqual(magicSword);
      expect(getEntry<IsContentItem>('Lightning Bolt')).toEqual(lightningBolt);
      expect(getEntry<IsContentItem>('lightning-skill-1')).toEqual(
        lightningBolt,
      );
    });

    it('should handle content updates correctly', () => {
      // Initial setup
      const initialNameMap = new Map([['Item A', 'item-1']]);
      const initialContentMap = new Map([['item-1', mockWeapon]]);

      setAllIdsByName(initialNameMap);
      setAllContentById(initialContentMap);

      expect(getEntry<IsContentItem>('Item A')).toEqual(mockWeapon);

      // Update content
      const updatedNameMap = new Map([['Item B', 'item-2']]);
      const updatedContentMap = new Map([['item-2', mockArmor]]);

      setAllIdsByName(updatedNameMap);
      setAllContentById(updatedContentMap);

      expect(getEntry<IsContentItem>('Item A')).toBeUndefined();
      expect(getEntry<IsContentItem>('Item B')).toEqual(mockArmor);
    });

    it('should maintain data integrity across multiple operations', () => {
      const largeNameMap = new Map();
      const largeContentMap = new Map();

      // Create a larger dataset
      for (let i = 1; i <= 100; i++) {
        const item: IsContentItem = {
          id: `item-${i}`,
          name: `Item ${i}`,
          __type: i % 2 === 0 ? 'weapon' : 'armor',
        };
        largeNameMap.set(`Item ${i}`, `item-${i}`);
        largeContentMap.set(`item-${i}`, item);
      }

      setAllIdsByName(largeNameMap);
      setAllContentById(largeContentMap);

      // Test random access
      expect(getEntry<IsContentItem>('Item 50')).toBeDefined();
      expect(getEntry<IsContentItem>('item-75')).toBeDefined();

      // Test filtering
      const weapons = getEntriesByType<IsContentItem>('weapon');
      const armor = getEntriesByType<IsContentItem>('armor');

      expect(weapons.length).toBe(50);
      expect(armor.length).toBe(50);
      expect(weapons.length + armor.length).toBe(100);
    });
  });
});
