import * as THREE from "three";
import { noise } from "perlin";
import Stats from "stats-js";

import {
  generateInitialChunks,
  createInstanceChunks
} from "../utils/generateChunks";
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
    this.stats = new Stats();
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.camera = null;
    this.controls = null;
    this.chunks = [];
    this.loader = new THREE.TextureLoader();
    this.instancedChunk = null;
    this.blockBox = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.plane = null;

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
    this.stats.showPanel(0);
    this.scene.background = new THREE.Color(0x00ffff);
    this.scene.fog = new THREE.Fog(0x000000, 10, 200);
    noise.seed(Math.random());
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

    const { chunks, instancedChunk, blockBox } = generateInitialChunks(
      this.scene,
      this.camera
    );

    this.chunks = chunks;
    this.instancedChunk = instancedChunk;
    this.blockBox = blockBox;

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

  checkCollisions() {
    this.chunks.forEach((blockArray) => {
      blockArray.forEach((item) => {
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
    this.controls.update(this.chunks);
    this.checkCollisions();
  }

  render() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersection = this.raycaster.intersectObject(this.instancedChunk);
    if (intersection[0] && intersection[0].distance < 40) {
      // console.log(intersection);
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
        const materialIndex = intersection[0].face.materialIndex;
        const position = intersection[0].point;
        console.log("WHAT ARE YOU?", materialIndex);
        console.log("HELLo", position, materialIndex);

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
              position.x + inc,
              Math.round(position.y / 5) * 5,
              Math.round(position.z / 5) * 5
            );
            break;
          // top
          case 2:
            console.log("IN HETE");
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
              Math.round(position.y / 5) * 5,
              position.y + inc,
              Math.round(position.y / 5) * 5
            );
            break;
          case 4:
            this.plane.rotation.set(0, 0, 0);
            this.plane.position.set(
              Math.round(position.x / 5) * 5,
              Math.round(position.y / 5) * 5,
              position.z + inc
            );
            break;
          case 5:
            this.plane.rotation.set(0, 0, 0);
            this.plane.position.set(
              Math.round(position.x / 5) * 5,
              Math.round(position.y / 5) * 5,
              position.z + inc
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
    this.scene.remove(this.instancedChunk);

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

    this.instancedChunk = createInstanceChunks(this.chunks, this.blockBox);
    this.scene.add(this.instancedChunk);
  }

  handleTopZEdge() {
    // remove blocks
    this.scene.remove(this.instancedChunk);

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

    this.instancedChunk = createInstanceChunks(this.chunks, this.blockBox);
    this.scene.add(this.instancedChunk);
  }
  handleBottomXEdge() {
    // remove blocks
    this.scene.remove(this.instancedChunk);

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
    this.instancedChunk = createInstanceChunks(this.chunks, this.blockBox);
    this.scene.add(this.instancedChunk);
  }
  handleTopXEdge() {
    // remove blocks
    this.scene.remove(this.instancedChunk);

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
    this.instancedChunk = createInstanceChunks(this.chunks, this.blockBox);
    this.scene.add(this.instancedChunk);
  }
}
