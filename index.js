import * as THREE from 'three';
import easing from './easing.js';
import metaversefile from 'metaversefile';
const {useApp, useFrame, useActivate, useLoaders, usePhysics} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default () => {
  const {gltfLoader} = useLoaders();

  const app = useApp();
  
  let activateCb = null;
  let frameCb = null;
  useActivate(() => {
    activateCb && activateCb();
  });
  useFrame(() => {
    frameCb && frameCb();
  });

  const physics = usePhysics();
  (async () => {
    const u = `${baseUrl}chest.glb`;
    let o = await new Promise((accept, reject) => {
      gltfLoader.load(u, accept, function onprogress() {}, reject);
    });
    const {animations} = o;
    o = o.scene;
    app.add(o);
    
    const dropObject = new THREE.Object3D();
    dropObject.position.y = 0.5;
    app.add(dropObject);

    o.updateMatrixWorld();

    let baseMesh = null;
    o.traverse(o => {
      if (!baseMesh && o.isMesh && /base_container/i.test(o.name)) {
        baseMesh = o;
      }
    });
    const physicsId = physics.addGeometry(baseMesh);
    
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
          drop.drop(dropObject, {
            count: 10,
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
        }
      }
      frameCb = animate;
    };
  })();

  return app;
};