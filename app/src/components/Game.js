import * as THREE from "three";
import { noise } from "perlin";

import { generateBlocks } from "../utils/generateBlocks";

import { Controls } from "./Controls";
import { lowestZBlock } from "../utils/generateBlocks";
export class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.camera = null;
    this.controls = null;
    this.chunks = [];
  }

  setup() {
    this.scene.background = new THREE.Color(0x00ffff);
    noise.seed(Math.random());
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.controls = new Controls(this.camera);
    this.controls.setup();

    this.chunks = generateBlocks(this.scene, this.camera);

    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });

    const toggleButton = document.getElementById("auto-jump-toggle");
    toggleButton.onclick = () => {
      this.controls.autoJump = !this.controls.autoJump;
    };
  }

  checkCollisions() {
    this.chunks.forEach((blockArray) => {
      blockArray.forEach((item) => {
        if (
          this.controls.hasCollidedX(item) &&
          this.controls.hasCollidedZ(item)
        ) {
          if (this.controls.hasCollidedY(item)) {
            this.camera.position.y = item.y + item.height / 2;
            this.controls.ySpeed = 0;
            this.controls.canJump = true;
          }
        }
      });
    });
    if (this.camera.position.z <= lowestZBlock(this.chunks) + 15) {
      // remove blocks
      console.log("HELO is this working");

      this.chunks.forEach((blockArray, index) => {
        if ((index + 1) % 3 === 0) {
          console.log("remove");
          blockArray.forEach((block) => {
            this.scene.remove(block.mesh);
            this.scene.remove(block.line);
          });
        }
      });

      this.chunks.forEach((blockArray, index) => {
        if ((index + 1) % 3 === 0) {
          console.log("remove");
          blockArray.forEach((block) => {
            this.scene.remove(block.mesh);
            this.scene.remove(block.line);
          });
        }
      });
    }
  }

  update() {
    this.controls.update(this.chunks);
    this.checkCollisions();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  gameLoop() {
    this.update();
    this.render();
    requestAnimationFrame(() => {
      this.gameLoop();
    });
  }
}
