/* eslint-disable @typescript-eslint/no-explicit-any */
const rec = require('recursive-readdir');
const fs = require('fs-extra');
const path = require('path');
const spritesmith = require('spritesmith');
const { Jimp } = require('jimp');
const { maxBy, uniqBy } = require('lodash');
const imagemin = require('imagemin');
const webp = require('imagemin-webp');

const assetsToCopy: string[] = [];

fs.ensureDirSync('public/art/spritesheets');

const allSpritesheetAtlases: Record<string, any> = {};

const generateSpriteArray = (start: string, frames: number): string[] => {
  return Array(frames)
    .fill(undefined)
    .map((_, i) => (parseInt(start, 10) + i).toString().padStart(4, '0'));
};

const build = async () => {
  const folders = fs.readdirSync('./gameassets');

  for (const sheet of folders) {
    console.log(`Generating spritesheet for ${sheet}...`);

    const files = await rec(`./gameassets/${sheet}`);

    let animateContent = undefined;
    let copyFiles: string[] = files;

    const unfilterableSpritesheets = ['hero', 'world-object', 'world-terrain'];

    if (!unfilterableSpritesheets.includes(sheet)) {
      const content = await fs.readJSON(`./public/json/${sheet}.json`, 'utf-8');
      const isAnimated = !!content.find((c: any) => c.frames > 0);
      if (isAnimated) {
        animateContent = content;
      }

      const usedSprites = [
        ...new Set([
          ...content.flatMap((c: any) =>
            c.frames ? generateSpriteArray(c.sprite, c.frames) : [c.sprite],
          ),
        ]),
      ];

      copyFiles = copyFiles.filter((f) =>
        usedSprites.find((s) => f.includes(s)),
      );
    }

    console.log(
      `Found ${copyFiles.length} files for ${sheet} spritesheet (animated=${!!animateContent}).`,
    );

    // since heroes are not like other french girls, we shim the data in
    if (sheet === 'hero') {
      animateContent = Array(files.length / 4)
        .fill(undefined)
        .map((_, i) => ({ sprite: i * 4, frames: 4 }));
    }

    // if it's not animated, we generate a normal atlas using spritesmith (realistically, we could use jimp, but meh)
    if (!animateContent) {
      await new Promise<void>((resolve) => {
        spritesmith.run({ src: copyFiles }, (e: any, res: any) => {
          const newCoords: Record<string, any> = {};
          Object.keys(res.coordinates).forEach((key: string) => {
            newCoords[key.replaceAll('\\', '/')] = res.coordinates[key];
          });

          fs.writeJsonSync(`public/art/spritesheets/${sheet}.json`, newCoords);
          fs.writeFileSync(`public/art/spritesheets/${sheet}.png`, res.image);

          allSpritesheetAtlases[sheet] = newCoords;

          resolve();
        });
      });

      // otherwise, we do a lot of extra work to make sure they operate as expected
    } else {
      await new Promise<void>(async (resolve) => {
        const atlas: Record<
          string,
          { x: number; y: number; width: number; height: number }
        > = {};

        const maxFrames = maxBy(animateContent, (c: any) => c.frames).frames;
        const uniqueAnimations = uniqBy(animateContent, (c: any) => c.sprite);

        const widthTiles = maxFrames;
        const heightTiles = uniqueAnimations.length;

        const spritesheet = new Jimp({
          width: 64 * widthTiles,
          height: 64 * heightTiles,
        });

        for (const anim of uniqueAnimations) {
          const { sprite, frames } = anim;
          const allSprites = generateSpriteArray(sprite, frames);

          for (const spriteName of allSprites) {
            const x = allSprites.indexOf(spriteName) * 64;
            const y = uniqueAnimations.indexOf(anim) * 64;

            const spriteRef = await Jimp.read(
              `./gameassets/${sheet}/${spriteName}.png`,
            );

            spritesheet.blit({ src: spriteRef, x, y });

            atlas[`gameassets/${sheet}/${spriteName}.png`] = {
              x,
              y,
              width: 64,
              height: 64,
            };
          }
        }

        await spritesheet.write(`public/art/spritesheets/${sheet}.png`);
        await fs.writeJson(`public/art/spritesheets/${sheet}.json`, atlas);

        allSpritesheetAtlases[sheet] = atlas;

        resolve();
      });
    }
  }

  console.log(`Generating all.json spritesheet atlas.`);
  fs.writeJsonSync('public/art/spritesheets/all.json', allSpritesheetAtlases);
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

const compressImages = async () => {
  await imagemin([`./public/art/spritesheets/*.png`], {
    destination: `./public/art/spritesheets/`,
    plugins: [
      webp({
        lossless: true,
      }),
    ],
  });

  console.log('Done compressing images.');
};

const doBuild = async () => {
  await build();
  await copy();
  await compressImages();
};

doBuild();
