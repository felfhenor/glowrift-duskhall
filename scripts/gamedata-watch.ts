/* eslint-disable @typescript-eslint/no-var-requires */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const chokidar = require('chokidar');
const { uniq, intersection } = require('es-toolkit/compat');

let allUsedSpritesheetKeys: string[] = [];

const runCommand = (command: string) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(error);
  }
};

const getAllUsedSprites = () => {
  try {
    const allJsons = fs.readJsonSync('public/json/all.json');

    const allUsedSprites = uniq(
      Object.keys(allJsons)
        .flatMap((key) =>
          allJsons[key].map((entry: any) =>
            entry.sprite ? `gameassets/${key}/${entry.sprite}.png` : undefined,
          ),
        )
        .filter(Boolean),
    );

    return allUsedSprites;
  } catch {
    return [];
  }
};

const startWatch = async () => {
  console.info(`[helpers] Watching gamedata changes...`);
  allUsedSpritesheetKeys = getAllUsedSprites();

  chokidar.watch('gamedata').on('change', (name: string) => {
    console.info(`[helpers] ${name} changed. Rebuilding gamedata...`);

    runCommand('npm run gamedata:build');
    console.info('[helpers] Rebuilt.');

    const allUsedSprites = getAllUsedSprites();

    if (
      intersection(allUsedSprites, allUsedSpritesheetKeys).length !==
        allUsedSpritesheetKeys.length ||
      allUsedSprites.length !== allUsedSpritesheetKeys.length
    ) {
      console.info('[helpers] Rebuilding art due to new assets...');
      runCommand('npm run gamedata:art:spritesheets');
      console.info('[helpers] Rebuilt.');
    }

    allUsedSpritesheetKeys = allUsedSprites;
  });
};

startWatch();
