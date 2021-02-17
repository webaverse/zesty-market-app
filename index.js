import * as THREE from 'three';
import {GLTFLoader} from 'GLTFLoader';
// import {BufferGeometryUtils} from 'BufferGeometryUtils';
import {renderer, scene, app, physics, drop} from 'app';
import easing from './easing.js';

(async () => {
  const u = app.files[`./chest.glb`];
  let o = await new Promise((accept, reject) => {
    new GLTFLoader().load(u, accept, function onprogress() {}, reject);
  });
  const {animations} = o;
  o = o.scene;
  app.object.add(o);

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
  app.addEventListener('activate', e => {
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
        drop.drop(app.object);
        dropped = true;
      }
      if (timeAcc >= endOffset) {
        // mixer.stopAllAction();
        /* timeAcc = 0;
        for (const action of actions) {
          action.time = 0;
        } */
        renderer.setAnimationLoop(null);
      } else {
        mixer.update(timeDiff);
      }
    }
    renderer.setAnimationLoop(animate);
  });
})();