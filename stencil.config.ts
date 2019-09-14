import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'auth0-webcomponent',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    },

    {
      type: 'www',
      serviceWorker: null // disable service workers
    }
  ]
};
