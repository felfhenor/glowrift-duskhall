export const environment = {
  production: true,
  platform: 'web',
  gameanalytics: {
    game: 'dc6960521b58c28870dd6ea35fffbe19',
    secret: 'c6aea2724bc6189c7fce16ef6525f82b2417ca9f',
  },
  rollbar: {
    accessToken: 'df3dc3d60da744e397ed7037a36a3ce8',
    hostBlockList: ['netlify.app'],
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: 'production',
      client: {
        javascript: {
          code_version: '1.0',
          source_map_enabled: true,
          guess_uncaught_frames: true,
        },
      },
    },
    recorder: {
      enabled: true,
    },
  },
};
