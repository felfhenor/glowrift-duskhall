/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

const { isArray, isString, isObject } = require('es-toolkit/compat');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const path = require('path');

fs.ensureDirSync('./public/json');

const allData: Record<string, any[]> = {};
const trackedIds: Record<string, boolean> = {};
const idToName: Record<string, Record<string, string>> = {};

// preload
const processFiles = () => {
  fs.readdirSync('gamedata').forEach((folder: string) => {
    fs.readdirSync(`gamedata/${folder}`).forEach((file: string) => {
      try {
        const filename = path.basename(file, '.yml');
        const doc = yaml.load(
          fs.readFileSync(`gamedata/${folder}/${filename}.yml`),
        );

        idToName[folder] ??= {};
        allData[folder] ??= [];
        allData[folder].push(...doc);

        doc.forEach((entry: any) => {
          if (!entry.name) {
            console.error(`Entry "${entry.id}" has no name.`);
            return;
          }

          if (idToName[folder][entry.name]) {
            console.error(
              `Name "${entry.name}" already exists somewhere in the content.`,
            );
            process.exit(1);
          }

          if (trackedIds[entry.id]) {
            console.error(
              `Id "${entry.id}" already exists somewhere in the content.`,
            );
            process.exit(1);
          }

          trackedIds[entry.id] = true;
          idToName[folder][entry.name] = entry.id;
        });

        console.log(`Loaded ${folder}/${file} - ${doc.length} entries...`);
      } catch (e) {
        console.error(e);
      }
    });
  });
};

const rewriteDataIds = () => {
  const allIds = Object.keys(allData).reverse();
  console.log(`Valid identifiers: ${allIds.join(', ')}`);

  const getIdForName = (name: string, type: string) => {
    const res = idToName[type][name];
    if (!res) {
      console.error(`Name ${name} (${type}) has no corresponding id.`);
      process.exit(1);
    }

    return res;
  };

  // magically transform any key that requests an id to that id
  const iterateObject = (entry: any) => {
    Object.keys(entry).forEach((entryKey) => {
      // no match, skip
      const keyMatch = allIds.find((id) => entryKey.toLowerCase().includes(id));
      if (!keyMatch) {
        // check deeper, if it's an array we want to check our sub objects
        if (isArray(entry[entryKey])) {
          entry[entryKey].forEach((subObj: any) => {
            iterateObject(subObj);
          });

          // if it's not an array, but an object, we want to dig deeper
        } else if (isObject(entry[entryKey])) {
          iterateObject(entry[entryKey]);
        }

        return;
      }

      // if the property name has id in it, we rewrite it
      if (entryKey.toLowerCase().includes('id')) {
        // match
        // our match key is an array of strings, so we rewrite them all to be ids
        if (isArray(entry[entryKey])) {
          entry[entryKey] = entry[entryKey].map((i: string) =>
            getIdForName(i, keyMatch),
          );
        }

        // our match key is a simple string, so we rewrite it to be an id
        else if (entry[entryKey] !== 'Any') {
          entry[entryKey] = getIdForName(entry[entryKey], keyMatch);
        }

        // otherwise, if it's an array, we go deeper, again
      } else {
        if (isArray(entry[entryKey])) {
          if (isString(entry[entryKey][0])) {
            entry[entryKey] = entry[entryKey].map((i: string) =>
              getIdForName(i, keyMatch),
            );
          } else {
            entry[entryKey].forEach((subObj: any) => {
              iterateObject(subObj);
            });
          }

          // and if it's an object instead of an array, we still want to dive in
        } else if (isObject(entry[entryKey])) {
          iterateObject(entry[entryKey]);
        }
      }
    });
  };

  allIds.forEach((key) => {
    Object.values(allData[key]).forEach((entry) => {
      iterateObject(entry);
    });
  });

  // write
  allIds.forEach((key) => {
    fs.writeJsonSync(`./public/json/${key}.json`, allData[key]);
  });

  fs.writeJsonSync('public/json/all.json', allData);
};

processFiles();
rewriteDataIds();
