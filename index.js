import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, useActivate, useDomRenderer, useCleanup} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default e => {
  const app = useApp();
  app.name = 'zesty-ad';

  // handle activation
  let activateCb = null;
  useActivate(() => {
    activateCb && activateCb();
  });

  let live = true;
  let reactApp = null;

  // Load model
  e.waitUntil((async () => {
    // Set up banner
    {
      const u = `${baseUrl}banner.react`;
      reactApp = await metaversefile.createAppAsync({
        start_url: u,
      });
      if (!live) {
        reactApp.destroy();
        return;
      }

      app.add(reactApp);
      reactApp.updateMatrixWorld();
    }
  })());

  useCleanup(() => {
    live = false;
    reactApp && reactApp.destroy();
  });

  return app;
};
