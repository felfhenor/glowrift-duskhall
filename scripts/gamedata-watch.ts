/* eslint-disable @typescript-eslint/no-var-requires */

const { execSync } = require('child_process');
const chokidar = require('chokidar');

const runCommand = (command: string) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(error);
  }
};

const startWatch = async () => {
  console.info(`[helpers] Watching gamedata changes...`);

  chokidar.watch('gamedata').on('change', (name: string) => {
    console.info(`[helpers] ${name} changed. Rebuilding gamedata...`);

    runCommand('npm run gamedata:build');
    runCommand('npm run gamedata:art:spritesheets');
    console.info('[helpers] Rebuilt.');
  });
};

startWatch();
