import * as THREE from "three";
import { noise } from "perlin";
import Stats from "stats-js";

import { Controls } from "./Controls";

import { BlockFactory } from "./BlockFactory";
import { World } from "./World";
import { Player } from "./Player";

export class Game {
  constructor() {
    this.stats = new Stats();
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.camera = null;
    this.controls = null;
    this.loader = new THREE.TextureLoader();
    this.blockBox = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.plane = null;
    this.placedBlocks = [];
    this.chunkMaps = [];
    this.intersection = null;
    this.clock = new THREE.Clock();
    this.canPlaceBlock = true;
    this.player = null;

    this.blockFactory = new BlockFactory(this.scene);
  }

  async setup() {
    noise.seed(Math.random());
    this.stats.showPanel(0);
    this.scene.background = new THREE.Color(0x00ffff);
    this.scene.fog = new THREE.Fog(0x000000, 10, 500);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(this.stats.dom);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.pointer.x = 0.5 * 2 - 1;
    this.pointer.x = -1 * 0.5 * 2 + 1;

    this.controls = new Controls(this.camera);
    this.controls.setup();
    this.world = new World(this.camera, this.blockFactory, this.controls);
    this.world.create();

    this.player = new Player(
      this.pointer,
      this.camera,
      this.blockFactory,
      this.scene
    );

    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });

    const toggleButton = document.getElementById("auto-jump-toggle");
    toggleButton.onclick = () => {
      this.controls.autoJump = !this.controls.autoJump;
    };
    this.animate();
  }

  update() {
    this.player.inputHandler.update();
    this.controls.update(this.blockFactory.chunks);
    this.world.checkCollisions();
  }

  render() {
    this.player.render();
    this.intersection = this.raycaster.intersectObject(
      this.blockFactory.instancedChunk
    );
    if (this.intersection[0] && this.intersection[0].distance < 40) {
      if (!this.scene.children.includes(this.plane)) {
        var planeGeometry = new THREE.PlaneGeometry(5, 5);
        var planeMesh = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide
        });
        planeMesh.transparent = true;
        planeMesh.opacity = 0.5;
        this.plane = new THREE.Mesh(planeGeometry, planeMesh);
        this.scene.add(this.plane);
      } else {
        this.plane.visible = true;
        const materialIndex = this.intersection[0].face.materialIndex;
        const position = this.intersection[0].point;

        const inc = 0.1;
        switch (materialIndex) {
          // right
          case 0:
            this.plane.rotation.set(0, Math.PI / 2, 0);
            this.plane.position.set(
              position.x + inc,
              Math.round(position.y / 5) * 5,
              Math.round(position.z / 5) * 5
            );
            break;
          // left
          case 1:
            this.plane.rotation.set(0, Math.PI / 2, 0);
            this.plane.position.set(
              position.x - inc,
              Math.round(position.y / 5) * 5,
              Math.round(position.z / 5) * 5
            );
            break;
          // top
          case 2:
            this.plane.rotation.set(Math.PI / 2, 0, 0);
            this.plane.position.set(
              Math.round(position.x / 5) * 5,
              position.y + inc,
              Math.round(position.z / 5) * 5
            );
            break;
          // bottom
          case 3:
            this.plane.rotation.set(Math.PI / 2, 0, 0);
            this.plane.position.set(
              Math.round(position.x / 5) * 5,
              position.y - inc,
              Math.round(position.z / 5) * 5
            );
            break;
          // back
          case 4:
            this.plane.rotation.set(0, 0, Math.PI / 2);
            this.plane.position.set(
              Math.round(position.x / 5) * 5,
              Math.round(position.y / 5) * 5,
              position.z + inc
            );
            break;
          // front
          case 5:
            this.plane.rotation.set(0, 0, Math.PI / 2);
            this.plane.position.set(
              Math.round(position.x / 5) * 5,
              Math.round(position.y / 5) * 5,
              position.z - inc
            );
            break;
        }
      }
    } else {
      if (this.plane) {
        this.plane.visible = false;
      }
    }
    this.renderer.render(this.scene, this.camera);
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => {
      this.gameLoop();
    });
  }

  animate() {
    this.stats.begin();
    this.stats.end();
    requestAnimationFrame(() => {
      this.animate();
    });
  }
}
