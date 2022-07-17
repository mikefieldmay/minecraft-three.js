import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const gltfLoader = new GLTFLoader();

export class Dancer {
  constructor(x, y, z, scene, camera) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.model = null;
    this.mixer = null;
    this.animationActions = [];
    this.activeAction = null;
    this.activeActionIndex = 0;
    this.lastAction = null;
    this.scene = scene;
    this.ready = false;
    this.status = undefined;
    this.ySpeed = 0;
    this.jumpSpeed = 1.3;
    this.acc = 0.08;
    this.camera = camera;
    console.log(x, y, z);
  }

  async loadGltfModel(src) {
    return new Promise((resolve) => {
      gltfLoader.load(src, (gltf) => resolve(gltf));
    });
  }

  async loadModel() {
    const gltf = await this.loadGltfModel("public/models/girl.glb");
    gltf.scene.scale.set(5, 5, 5);

    // gltf.scene.traverse(function (node) {
    //   if (node.isMesh) {
    //     node.castShadow = true;
    //   }
    // });

    this.model = gltf.scene;
    // this.model.castShadow = true;
    this.mixer = new THREE.AnimationMixer(this.model);
    const animationAction = this.mixer.clipAction(gltf.animations[0]);
    this.animationActions.push(animationAction);
    this.activeAction = this.animationActions[0];
    this.scene.add(gltf.scene);
    this.model.position.set(this.x, this.y, this.z);
    this.model.rotation.set(0, 0, 0);
    await this.loadDances();
  }

  async loadDances() {
    const run = await this.loadGltfModel("public/animations/goofy-run.glb");
    console.log("one");
    run.animations[0].tracks.shift();
    const runAnimation = this.mixer.clipAction(run.animations[0]);
    this.animationActions.push(runAnimation);

    const dance = await this.loadGltfModel("public/animations/dance.glb");
    const danceAnimation = this.mixer.clipAction(dance.animations[0]);
    this.animationActions.push(danceAnimation);
    console.log("two");

    const idle = await this.loadGltfModel("public/animations/idle.glb");
    const idleAnimation = this.mixer.clipAction(idle.animations[0]);
    this.animationActions.push(idleAnimation);

    this.animationActions[3].play();
    this.setAction(this.animationActions[3]);
    this.ready = true;
  }

  setAction(toAction) {
    if (toAction != this.activeAction) {
      this.activeActionIndex = this.animationActions.indexOf(toAction);
      this.lastAction = this.activeAction;
      this.activeAction = toAction;
      this.lastAction.fadeOut(0.5);
      this.activeAction.reset();
      this.activeAction.fadeIn(0.5);
      this.activeAction.play();
    }
  }

  updatePosition(x, y, z) {
    this.model.position.set(x, y, z);
  }

  updateRotation(x, y, z) {
    this.model.rotation.set(x, y, z);
  }

  togglePauseAnimation(index, value) {
    this.animationActions[index].pause = value;
  }

  update(delta) {
    this.mixer.update(delta);
  }

  moveCharacter(direction) {
    const moveDistance = 0.1;
    switch (direction) {
      case "UP":
        this.updatePosition(
          this.model.position.x,
          this.model.position.y,
          (this.model.position.z += moveDistance)
        );
        this.updateRotation(0, 0, 0);
        this.togglePauseAnimation(1, false);
        this.setAction(this.animationActions[1]);
        break;
      case "DOWN":
        this.updatePosition(
          this.model.position.x,
          this.model.position.y,
          (this.model.position.z -= moveDistance)
        );
        this.updateRotation(0, THREE.Math.degToRad(180), 0);
        this.togglePauseAnimation(1, false);
        this.setAction(this.animationActions[1]);
        break;
      case "LEFT":
        this.updatePosition(
          (this.model.position.x += moveDistance),
          this.model.position.y,
          this.model.position.z
        );
        this.updateRotation(0, THREE.Math.degToRad(90), 0);
        this.togglePauseAnimation(1, false);
        this.setAction(this.animationActions[1]);
        break;
      case "RIGHT":
        this.updatePosition(
          (this.model.position.x -= moveDistance),
          this.model.position.y,
          this.model.position.z
        );
        this.updateRotation(0, THREE.Math.degToRad(270), 0);
        this.togglePauseAnimation(1, false);
        this.setAction(this.animationActions[1]);
        break;
      case "DANCE":
        this.updateRotation(0, THREE.Math.degToRad(180), 0);
        this.setAction(this.animationActions[2]);
        break;
      case "FALL":
        this.ySpeed += this.acc;
        this.updatePosition(
          this.model.position.x,
          this.model.position.y - this.ySpeed,
          this.model.position.z
        );
        this.togglePauseAnimation(1, true);
        this.setAction(this.animationActions[3]);
        break;
      default:
        this.togglePauseAnimation(1, true);
        this.setAction(this.animationActions[3]);
        break;
    }
    // this.camera.lookAt(this.model.position);
  }

  hasCollidedY = (item) => {
    return (
      this.model.position.y <= item.y + item.height &&
      this.model.position.y >= item.y - item.height
    );
  };
  hasCollidedZ = (item) => {
    return (
      this.model.position.z <= item.z + item.height &&
      this.model.position.z >= item.z
    );
  };
  hasCollidedX = (item) => {
    return (
      this.model.position.x <= item.x + item.height &&
      this.model.position.x >= item.x
    );
  };
}
