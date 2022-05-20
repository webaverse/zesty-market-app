import * as THREE from 'three';
// import easing from './easing.js';
import metaversefile from 'metaversefile';
const {useApp, useFrame, useActivate, useLoaders, usePhysics, addTrackedApp, useDropManager, useDefaultModules, useCleanup} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default e => {
  const app = useApp();
  const physics = usePhysics();
  const dropManager = useDropManager();

  app.name = 'chest';

  let activateCb = null;
  let frameCb = null;
  useActivate(() => {
    activateCb && activateCb();
  });
  useFrame(() => {
    frameCb && frameCb();
  });

  let physicsIds = [];
  e.waitUntil((async () => {
    const u = `${baseUrl}chest.glb`;
    let o = await new Promise((accept, reject) => {
      const {gltfLoader} = useLoaders();
      gltfLoader.load(u, accept, function onprogress() {}, reject);
    });
    const {animations} = o;
    o = o.scene;
    app.add(o);

    //

    {
      const u = `${baseUrl}inventory-banner.react`;
      const o = await metaversefile.createAppAsync({
        start_url: u,
      });
      o.position.y = 1.2;
      app.add(o);
      o.updateMatrixWorld();
    }

    //
    
    /* const dropObject = new THREE.Object3D();
    dropObject.position.y = 0.5;
    app.add(dropObject); */

    // app.updateMatrixWorld();

    /* let baseMesh = null;
    o.traverse(o => {
      if (!baseMesh && o.isMesh && /base_container/i.test(o.name)) {
        baseMesh = o;
      }
    }); */
    const physicsId = physics.addGeometry(o);
    physicsIds.push(physicsId);
    
    const mixer = new THREE.AnimationMixer(o);
    const actions = animations.map(animationClip => mixer.clipAction(animationClip));
    /* let maxDuration = -Infinity;
    for (const animation of animations) {
      maxDuration = Math.max(maxDuration, animation.duration);
    } */
    const startOffset = 1;
    const endOffset = 2;
    const dropOffset = 1;
    activateCb = () => {
      // console.log('got activate');
      
      for (const action of actions) {
        action.reset();
        action.play();
        action.time = startOffset;
      }

      let timeAcc = 0;
      let lastUpdateTime = Date.now();
      let dropped = false;
      function animate() {
        const now = Date.now();
        const timeDiff = (now - lastUpdateTime) / 1000;
        lastUpdateTime = now;
        
        timeAcc += timeDiff;
        if (!dropped && timeAcc >= dropOffset) {
          const {moduleUrls} = useDefaultModules();          
          dropManager.createDropApp({
            start_url: moduleUrls.silk,
            position: app.position.clone()
              .add(new THREE.Vector3(0, 0.7, 0)),
              quaternion: app.quaternion,
            scale: app.scale
          });
          dropped = true;
        }
        if (timeAcc >= endOffset) {
          // mixer.stopAllAction();
          /* timeAcc = 0;
          for (const action of actions) {
            action.time = 0;
          } */
          frameCb = null;
        } else {
          mixer.update(timeDiff);
          mixer.getRoot().updateMatrixWorld();
        }
      }
      frameCb = animate;
    };
  })());
  
  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });

  return app;
};