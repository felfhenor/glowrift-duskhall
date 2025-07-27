/* eslint-disable @typescript-eslint/no-explicit-any */
const rec = require('recursive-readdir');
const fs = require('fs-extra');
const path = require('path');
const spritesmith = require('spritesmith');

const assetsToCopy: string[] = [];

fs.ensureDirSync('public/art/spritesheets');

const build = async () => {
  const folders = fs.readdirSync('./gameassets');

  for (const sheet of folders) {
    console.log(`Generating spritesheet for ${sheet}...`);

    const files = await rec(`./gameassets/${sheet}`);

    let copyFiles: string[] = files;

    const unfilterableSpritesheets = ['hero', 'world-object', 'world-terrain'];

    if (!unfilterableSpritesheets.includes(sheet)) {
      const content = await fs.readJSON(`./public/json/${sheet}.json`, 'utf-8');

      const usedSprites = [
        ...new Set([
          ...content.flatMap((c: any) =>
            c.frames
              ? Array(c.frames)
                  .fill(undefined)
                  .map((_, i) => {
                    const baseSprite = parseInt(c.sprite, 10) + i;
                    return baseSprite.toString().padStart(4, '0');
                  })
              : [c.sprite],
          ),
        ]),
      ];

      copyFiles = copyFiles.filter((f) =>
        usedSprites.find((s) => f.includes(s)),
      );
    }

    console.log(`Found ${copyFiles.length} files for ${sheet} spritesheet.`);

    spritesmith.run({ src: copyFiles }, (e: any, res: any) => {
      const newCoords: Record<string, any> = {};
      Object.keys(res.coordinates).forEach((key: string) => {
        newCoords[key.replaceAll('\\', '/')] = res.coordinates[key];
      });

      fs.writeJsonSync(`public/art/spritesheets/${sheet}.json`, newCoords);
      fs.writeFileSync(`public/art/spritesheets/${sheet}.png`, res.image);
    });
  }
};

const copy = async () => {
  for (const assetGroup of assetsToCopy) {
    const files = await rec(`./gameassets/${assetGroup}`);
    fs.ensureDirSync(`public/art/${assetGroup}`);

    files.forEach((file: any) => {
      fs.copySync(file, `public/art/${assetGroup}/${path.basename(file)}`);
    });
  }
};

build();
copy();
