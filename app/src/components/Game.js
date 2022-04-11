import * as THREE from "three";
import { noise } from "perlin";

import { generateInitialChunks } from "../utils/generateChunks";
import { Block } from "../components/Block";

import GrassBottom from "../../assets/texture/grass/bottom.jpeg";
import GrassTop from "../../assets/texture/grass/top.jpeg";
import GrassSide from "../../assets/texture/grass/side.jpeg";

import { Controls } from "./Controls";
import {
  lowestXBlock,
  lowestZBlock,
  highestZBlock,
  highestXBlock
} from "../utils/generateChunks";

export class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.camera = null;
    this.controls = null;
    this.chunks = [];
    this.loader = new THREE.TextureLoader();
    this.materialArray = [
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassSide) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassSide) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassTop) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassBottom) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassSide) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassSide) })
    ];
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

    this.chunks = generateInitialChunks(this.scene, this.camera);

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
    this.handleEdges();
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

  handleEdges() {
    /*
        [0], [3], [6],
        [1], [4], [7],
        [2], [5], [8]
    */
    if (this.camera.position.z <= lowestZBlock(this.chunks) + 15) {
      this.handleBottomZEdge();
    }
    if (this.camera.position.z >= highestZBlock(this.chunks) - 15) {
      this.handleTopZEdge();
    }
    if (this.camera.position.x <= lowestXBlock(this.chunks) + 15) {
      this.handleBottomXEdge();
    }
    if (this.camera.position.x >= highestXBlock(this.chunks) - 15) {
      this.handleTopXEdge();
    }
  }

  handleBottomZEdge() {
    // remove blocks
    this.chunks.forEach((blockArray, index) => {
      if ((index + 1) % 3 === 0) {
        blockArray.forEach((block) => {
          this.scene.remove(block.mesh);
          this.scene.remove(block.line);
        });
      }
    });

    const newChunks = [];
    this.chunks.forEach((blockArray, index) => {
      if ((index + 1) % 3 !== 0) {
        newChunks.push(blockArray);
      }
    });

    let xOff = 0;
    let zOff = 0;

    const inc = 0.05;
    const amplitude = 50;
    const renderDistance = 3;
    const chunkSize = 10;

    const lowestX = lowestXBlock(this.chunks);
    const lowestZ = lowestZBlock(this.chunks);

    for (let i = 0; i < renderDistance; i++) {
      const chunk = [];
      for (
        let x = lowestX + i * chunkSize * 5;
        x < lowestX + i * chunkSize * 5 + chunkSize * 5;
        x = x + 5
      ) {
        for (let z = lowestZ - chunkSize * 5; z < lowestZ; z = z + 5) {
          xOff = (inc * x) / 5;
          zOff = (inc * z) / 5;
          const v = Math.round((noise.perlin2(xOff, zOff) * amplitude) / 5) * 5;
          chunk.push(new Block(x, v, z, this.scene, this.materialArray));
        }
      }
      newChunks.splice(i * renderDistance, 0, chunk);
    }

    this.chunks = newChunks;

    this.chunks.forEach((chunkArray, index) => {
      if (index % renderDistance === 0) {
        chunkArray.forEach((block) => {
          block.display();
        });
      }
    });
  }
  handleTopZEdge() {
    // remove blocks
    this.chunks.forEach((blockArray, index) => {
      // i % render distance
      if (index % 3 === 0) {
        blockArray.forEach((block) => {
          this.scene.remove(block.mesh);
          this.scene.remove(block.line);
        });
      }
    });

    const newChunks = [];
    this.chunks.forEach((blockArray, index) => {
      if (index % 3 !== 0) {
        newChunks.push(blockArray);
      }
    });

    let xOff = 0;
    let zOff = 0;

    const inc = 0.05;
    const amplitude = 50;
    const renderDistance = 3;
    const chunkSize = 10;

    const lowestX = lowestXBlock(this.chunks);
    const highestZ = highestZBlock(this.chunks);

    for (let i = 0; i < renderDistance; i++) {
      const chunk = [];
      for (
        let x = lowestX + i * chunkSize * 5;
        x < lowestX + i * chunkSize * 5 + chunkSize * 5;
        x = x + 5
      ) {
        for (
          let z = highestZ + chunkSize / 2;
          z < highestZ + 5 + chunkSize * 5;
          z = z + 5
        ) {
          xOff = (inc * x) / 5;
          zOff = (inc * z) / 5;
          const v = Math.round((noise.perlin2(xOff, zOff) * amplitude) / 5) * 5;
          chunk.push(new Block(x, v, z, this.scene, this.materialArray));
        }
      }
      newChunks.splice(i * renderDistance + 2, 0, chunk);
    }

    this.chunks = newChunks;

    this.chunks.forEach((chunkArray, index) => {
      if ((index + 1) % renderDistance === 0) {
        chunkArray.forEach((block) => {
          block.display();
        });
      }
    });
  }
  handleBottomXEdge() {
    // remove blocks
    this.chunks.forEach((blockArray, index) => {
      // i < render distance
      if (index >= this.chunks.length - 3) {
        blockArray.forEach((block) => {
          this.scene.remove(block.mesh);
          this.scene.remove(block.line);
        });
      }
    });

    const newChunks = [];
    this.chunks.forEach((blockArray, index) => {
      // render Distance
      if (index < this.chunks.length - 3) {
        newChunks.push(blockArray);
      }
    });

    let xOff = 0;
    let zOff = 0;

    const inc = 0.05;
    const amplitude = 50;
    const renderDistance = 3;
    const chunkSize = 10;

    const lowestZ = lowestZBlock(this.chunks);
    const lowestX = lowestXBlock(this.chunks);

    for (let i = 0; i < renderDistance; i++) {
      const chunk = [];
      for (
        let z = lowestZ + i * chunkSize * 5;
        z < lowestZ + i * chunkSize * 5 + chunkSize * 5;
        z = z + 5
      ) {
        for (let x = lowestX - chunkSize * 5; x < lowestX; x = x + 5) {
          xOff = (inc * x) / 5;
          zOff = (inc * z) / 5;
          const v = Math.round((noise.perlin2(xOff, zOff) * amplitude) / 5) * 5;
          chunk.push(new Block(x, v, z, this.scene, this.materialArray));
        }
      }
      newChunks.splice(i, 0, chunk);
    }

    this.chunks = newChunks;
    console.log(this.chunks);

    this.chunks.forEach((chunkArray, index) => {
      if (index < 3) {
        console.log("HERE");
        chunkArray.forEach((block) => {
          block.display();
        });
      }
    });
  }

  handleTopXEdge() {
    // remove blocks
    this.chunks.forEach((blockArray, index) => {
      // i < render distance
      if (index < 3) {
        blockArray.forEach((block) => {
          this.scene.remove(block.mesh);
          this.scene.remove(block.line);
        });
      }
    });

    const newChunks = [];
    this.chunks.forEach((blockArray, index) => {
      // render Distance
      if (index >= 3) {
        newChunks.push(blockArray);
      }
    });

    let xOff = 0;
    let zOff = 0;

    const inc = 0.05;
    const amplitude = 50;
    const renderDistance = 3;
    const chunkSize = 10;

    const lowestZ = lowestZBlock(this.chunks);
    const highestX = highestXBlock(this.chunks);

    for (let i = 0; i < renderDistance; i++) {
      const chunk = [];
      for (
        let z = lowestZ + i * chunkSize * 5;
        z < lowestZ + i * chunkSize * 5 + chunkSize * 5;
        z = z + 5
      ) {
        for (
          let x = highestX + 5;
          x < highestX + 5 + chunkSize * 5;
          x = x + 5
        ) {
          xOff = (inc * x) / 5;
          zOff = (inc * z) / 5;
          const v = Math.round((noise.perlin2(xOff, zOff) * amplitude) / 5) * 5;
          chunk.push(new Block(x, v, z, this.scene, this.materialArray));
        }
      }
      newChunks.splice(this.chunks.length - (renderDistance - i), 0, chunk);
    }

    this.chunks = newChunks;

    this.chunks.forEach((chunkArray, index) => {
      if (index >= this.chunks.length - renderDistance) {
        chunkArray.forEach((block) => {
          block.display();
        });
      }
    });
  }
}
