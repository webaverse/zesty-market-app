import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, useActivate, useLoaders, usePhysics, useCleanup} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default e => {
  const app = useApp();
  const physics = usePhysics();

  app.name = 'duck';

  // handle activation
  let activateCb = null;
  useActivate(() => {
    activateCb && activateCb();
  });

  let live = true;
  let reactApp = null;
  const physicsIds = [];

  // Load model
  e.waitUntil((async () => {
    const u = `${baseUrl}duck.glb`;
    let o = await new Promise((resolve, reject) => {
      const {gltfLoader} = useLoaders();
      gltfLoader.load(u, resolve, function onprogress() { }, reject);
    });
    if (!live) {
      o.destroy();
      return;
    }
    o = o.scene;
    app.add(o);

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
      reactApp.position.y = 1.2;
      app.add(reactApp);
      reactApp.updateMatrixWorld();
    }

    // Set up physics
    const physicsId = physics.addGeometry(o);
    physicsIds.push(physicsId);
    activateCb = () => {
      console.log('got activate');
    };
  })());

  useCleanup(() => {
    live = false;
    reactApp && reactApp.destroy();
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });

  return app;
};
