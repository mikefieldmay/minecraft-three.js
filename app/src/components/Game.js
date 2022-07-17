import * as THREE from "three";
import { noise } from "perlin";
import Stats from "stats-js";
import { identifyChunk } from "../utils/identifyChunk";

import { Block } from "../components/Block";

import GrassBottom from "../../assets/texture/grass/bottom.jpeg";
import GrassTop from "../../assets/texture/grass/top.jpeg";
import GrassSide from "../../assets/texture/grass/side.jpeg";

import { Controls } from "./Controls";
import { Dancer, Dancer as Model } from "./Model";
import {
  lowestXBlock,
  lowestZBlock,
  highestZBlock,
  highestXBlock
} from "../utils/generateChunks";
import { BlockFactory } from "./BlockFactory";
import { InputHandler } from "./InputHandler";

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
    this.dancer = null;
    this.clock = new THREE.Clock();
    this.canPlaceBlock = true;

    this.inputHandler = null;

    this.blockFactory = new BlockFactory(this.scene);

    this.materialArray = [
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassSide) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassSide) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassTop) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassBottom) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassSide) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassSide) })
    ];
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

    this.blockFactory.generateInitialChunks();

    this.camera.position.set(
      ((this.blockFactory.renderDistance * this.blockFactory.chunkSize) / 2) *
        5,
      ((this.blockFactory.renderDistance * this.blockFactory.chunkSize) / 2) *
        5,
      ((this.blockFactory.renderDistance * this.blockFactory.chunkSize) / 2) * 5
    );

    this.dancer = new Dancer(
      ((this.blockFactory.renderDistance * this.blockFactory.chunkSize) / 2) *
        5,
      ((this.blockFactory.renderDistance * this.blockFactory.chunkSize) / 2) *
        5,
      ((this.blockFactory.renderDistance * this.blockFactory.chunkSize) / 2) *
        5 -
        10,
      this.scene,
      this.camera
    );

    this.inputHandler = new InputHandler([
      {
        label: "place",
        key: "q",
        handleKeyPress: (chunks) => {
          this.handleBlockPlace(chunks);
        }
      }
    ]);

    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });

    const toggleButton = document.getElementById("auto-jump-toggle");
    toggleButton.onclick = () => {
      // this.controls.autoJump = !this.controls.autoJump;
    };
    await this.dancer.loadModel();
    this.animate();
  }

  checkCollisions() {
    this.blockFactory.chunks.forEach((blockArray) => {
      blockArray.forEach((item) => {
        if (
          this.dancer.ready &&
          this.dancer.hasCollidedX(item) &&
          this.dancer.hasCollidedZ(item)
        ) {
          if (this.dancer.hasCollidedY(item)) {
            this.dancer.model.position.y = item.y + item.height / 2;
            this.dancer.ySpeed = 0;
            // console.log("HERE", item, this.dancer.model.position);
            // throw new Error();
          }
        }
        if (
          this.controls.hasCollidedX(item) &&
          this.controls.hasCollidedZ(item)
        ) {
          if (this.controls.hasCollidedY(item)) {
            this.camera.position.y = item.y + item.height * 2;
            this.controls.ySpeed = 0;
            this.controls.canJump = true;
          }
        }
      });
    });
    this.handleEdges();
  }

  update() {
    this.inputHandler.update();
    this.controls.update(this.blockFactory.chunks);
    console.log("IS THE DANCER READY", this.dancer.ready);
    if (this.dancer.ready) {
      // this.dancer.updatePosition(0, this.dancer.model.x - 1, 0);
      this.dancer.update(this.clock.getDelta());
      this.dancer.moveCharacter("FALL");
      // this.dancer.moveCharacter("FALL");
    }
    this.checkCollisions();
  }

  render() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
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

  handleEdges() {
    /*
        [0], [3], [6],
        [1], [4], [7],
        [2], [5], [8]
    */
    if (this.camera.position.z <= lowestZBlock(this.blockFactory.chunks) + 15) {
      this.blockFactory.handleBottomZEdge();
    }
    if (
      this.camera.position.z >=
      highestZBlock(this.blockFactory.chunks) - 15
    ) {
      this.blockFactory.handleTopZEdge();
    }
    if (this.camera.position.x <= lowestXBlock(this.blockFactory.chunks) + 15) {
      this.blockFactory.handleBottomXEdge();
    }
    if (
      this.camera.position.x >=
      highestXBlock(this.blockFactory.chunks) - 15
    ) {
      this.blockFactory.handleTopXEdge();
    }
  }

  handleBlockPlace() {
    if (this.canPlaceBlock) {
      this.canPlaceBlock = false;
      this.blockFactory.handlePlaceBlock(this.intersection);
      setTimeout(() => {
        this.canPlaceBlock = true;
      }, 250);
    }
  }
}
