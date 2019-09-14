import { p as patchBrowser, g as globals, b as bootstrapLazy } from './core-bee09b9e.js';

patchBrowser().then(options => {
  globals();
  return bootstrapLazy([["auth0-authenticate",[[0,"auth0-authenticate",{"clientId":[1,"client-id"],"domain":[1],"redirectUri":[1,"redirect-uri"],"popup":[4],"login":[64],"logout":[64],"isAuthenticated":[64],"getUser":[64],"getApiAccessToken":[64]}]]]], options);
});
