import * as THREE from "three";
import { noise } from "perlin";
import { Block } from "./Block";

import GrassBottom from "../../assets/texture/grass/bottom.jpeg";
import GrassTop from "../../assets/texture/grass/top.jpeg";
import GrassSide from "../../assets/texture/grass/side.jpeg";

import {
  generateInitialChunks,
  createInstanceChunks
} from "../utils/generateChunks";
import { identifyChunk } from "../utils/identifyChunk";

import {
  lowestXBlock,
  lowestZBlock,
  highestZBlock,
  highestXBlock
} from "../utils/generateChunks";

export class BlockFactory {
  constructor(scene, renderDistance, chunkSize) {
    this.scene = scene;
    this.renderDistance = renderDistance || 10;
    this.chunkSize = chunkSize || 10;
    this.placedBlocks = [];
    this.chunks = [];
    this.blockBox = null;
    this.loader = new THREE.TextureLoader();
    this.blockSize = new Block().getSize();
    this.amplitude = 50;
    this.inc = 0.05;

    this.materialArray = [
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassSide) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassSide) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassTop) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassBottom) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassSide) }),
      new THREE.MeshBasicMaterial({ map: this.loader.load(GrassSide) })
    ];
  }

  generateInitialChunks() {
    const { chunks, blockBox, instancedChunk } = generateInitialChunks(
      this.scene,
      this.renderDistance,
      this.chunkSize,
      this.inc,
      this.amplitude
    );

    this.chunks = chunks;
    this.blockBox = blockBox;
    this.instancedChunk = instancedChunk;
  }

  createInstanceChunks() {
    const instancedChunk = createInstanceChunks(
      this.chunks,
      this.blockBox,
      this.placedBlocks.length,
      this.renderDistance,
      this.chunkSize
    );

    this.instancedChunk = instancedChunk;
    this.scene.add(instancedChunk);
  }

  handleBottomZEdge() {
    this.scene.remove(this.instancedChunk);

    const newChunks = [];
    this.chunks.forEach((blockArray, index) => {
      if ((index + 1) % this.renderDistance !== 0) {
        newChunks.push(blockArray);
      }
    });

    let xOff = 0;
    let zOff = 0;

    const lowestX = lowestXBlock(this.chunks);
    const lowestZ = lowestZBlock(this.chunks);

    for (let i = 0; i < this.renderDistance; i++) {
      const chunk = [];
      for (
        let x = lowestX + i * this.chunkSize * this.blockSize.x;
        x <
        lowestX +
          i * this.chunkSize * this.blockSize.x +
          this.chunkSize * this.blockSize.x;
        x = x + this.blockSize.x
      ) {
        for (
          let z = lowestZ - this.chunkSize * this.blockSize.x;
          z < lowestZ;
          z = z + this.blockSize.x
        ) {
          xOff = (this.inc * x) / this.blockSize.x;
          zOff = (this.inc * z) / this.blockSize.x;
          const v =
            Math.round(
              (noise.perlin2(xOff, zOff) * this.amplitude) / this.blockSize.x
            ) * this.blockSize.x;
          chunk.push(new Block(x, v, z, this.scene, this.materialArray));
        }
      }
      newChunks.splice(i * this.renderDistance, 0, chunk);
    }

    this.chunks = newChunks;

    this.createInstanceChunks();
  }

  handleTopZEdge() {
    this.scene.remove(this.instancedChunk);

    const newChunks = [];
    this.chunks.forEach((blockArray, index) => {
      if (index % this.renderDistance !== 0) {
        newChunks.push(blockArray);
      }
    });

    let xOff = 0;
    let zOff = 0;

    const lowestX = lowestXBlock(this.chunks);
    const highestZ = highestZBlock(this.chunks);

    for (let i = 0; i < this.renderDistance; i++) {
      const chunk = [];
      for (
        let x = lowestX + i * this.chunkSize * this.blockSize.x;
        x <
        lowestX +
          i * this.chunkSize * this.blockSize.x +
          this.chunkSize * this.blockSize.x;
        x = x + this.blockSize.x
      ) {
        for (
          let z = highestZ + this.chunkSize / 2;
          z < highestZ + this.blockSize.x + this.chunkSize * this.blockSize.x;
          z = z + this.blockSize.x
        ) {
          xOff = (this.inc * x) / this.blockSize.x;
          zOff = (this.inc * z) / this.blockSize.x;
          const v =
            Math.round(
              (noise.perlin2(xOff, zOff) * this.amplitude) / this.blockSize.y
            ) * this.blockSize.y;
          chunk.push(new Block(x, v, z, this.scene, this.materialArray));
        }
      }
      newChunks.splice(i * this.renderDistance + 2, 0, chunk);
    }

    this.chunks = newChunks;

    this.createInstanceChunks();
  }
  handleBottomXEdge() {
    // remove blocks
    this.scene.remove(this.instancedChunk);

    const newChunks = [];
    this.chunks.forEach((blockArray, index) => {
      // render Distance
      if (index < this.chunks.length - this.renderDistance) {
        newChunks.push(blockArray);
      }
    });

    let xOff = 0;
    let zOff = 0;

    const lowestZ = lowestZBlock(this.chunks);
    const lowestX = lowestXBlock(this.chunks);

    for (let i = 0; i < this.renderDistance; i++) {
      const chunk = [];
      for (
        let z = lowestZ + i * this.chunkSize * this.blockSize.x;
        z <
        lowestZ +
          i * this.chunkSize * this.blockSize.x +
          this.chunkSize * this.blockSize.x;
        z = z + this.blockSize.x
      ) {
        for (
          let x = lowestX - this.chunkSize * this.blockSize.x;
          x < lowestX;
          x = x + this.blockSize.x
        ) {
          xOff = (this.inc * x) / this.blockSize.x;
          zOff = (this.inc * z) / this.blockSize.x;
          const v =
            Math.round(
              (noise.perlin2(xOff, zOff) * this.amplitude) / this.blockSize.x
            ) * this.blockSize.x;
          chunk.push(new Block(x, v, z, this.scene, this.materialArray));
        }
      }
      newChunks.splice(i, 0, chunk);
    }

    this.chunks = newChunks;
    this.createInstanceChunks();
  }
  handleTopXEdge() {
    // remove blocks
    this.scene.remove(this.instancedChunk);

    const newChunks = [];
    this.chunks.forEach((blockArray, index) => {
      // render Distance
      if (index >= this.renderDistance) {
        newChunks.push(blockArray);
      }
    });

    let xOff = 0;
    let zOff = 0;

    const lowestZ = lowestZBlock(this.chunks);
    const highestX = highestXBlock(this.chunks);

    for (let i = 0; i < this.renderDistance; i++) {
      const chunk = [];
      for (
        let z = lowestZ + i * this.chunkSize * this.blockSize.z;
        z <
        lowestZ +
          i * this.chunkSize * this.blockSize.z +
          this.chunkSize * this.blockSize.z;
        z = z + this.blockSize.z
      ) {
        for (
          let x = highestX + this.blockSize.z;
          x < highestX + this.blockSize.z + this.chunkSize * this.blockSize.z;
          x = x + this.blockSize.z
        ) {
          xOff = (this.inc * x) / this.blockSize.z;
          zOff = (this.inc * z) / this.blockSize.z;
          const v =
            Math.round(
              (noise.perlin2(xOff, zOff) * this.amplitude) / this.blockSize.z
            ) * this.blockSize.z;
          chunk.push(new Block(x, v, z, this.scene, this.materialArray));
        }
      }
      newChunks.splice(
        this.chunks.length - (this.renderDistance - i),
        0,
        chunk
      );
    }

    this.chunks = newChunks;
    this.createInstanceChunks();
  }

  handlePlaceBlock(intersection) {
    if (intersection[0] && intersection[0].distance < 40) {
      const materialIndex = intersection[0].face.materialIndex;
      const position = intersection[0].point;
      console.log("POSITION", position);
      let x = 0;
      let y = 0;
      let z = 0;
      const inc = this.blockSize.x / 2;
      switch (materialIndex) {
        // right
        case 0:
          x = position.x + inc;
          y = Math.round(position.y / this.blockSize.x) * this.blockSize.x;
          z = Math.round(position.z / this.blockSize.x) * this.blockSize.x;
          break;
        // left
        case 1:
          x = position.x - inc;
          y = Math.round(position.y / this.blockSize.x) * this.blockSize.x;
          z = Math.round(position.z / this.blockSize.x) * this.blockSize.x;

          break;
        // top
        case 2:
          x = Math.round(position.x / this.blockSize.x) * this.blockSize.x;
          y = position.y + inc;
          z = Math.round(position.z / this.blockSize.x) * this.blockSize.x;
          break;
        // bottom
        case 3:
          x = Math.round(position.x / this.blockSize.x) * this.blockSize.x;
          y = position.y - inc;
          z = Math.round(position.z / this.blockSize.x) * this.blockSize.x;
          break;
        case 4:
          x = Math.round(position.x / this.blockSize.x) * this.blockSize.x;
          y = Math.round(position.y / this.blockSize.x) * this.blockSize.x;
          z = position.z + inc;
          break;
        case 5:
          x = Math.round(position.x / this.blockSize.x) * this.blockSize.x;
          y = Math.round(position.y / this.blockSize.x) * this.blockSize.x;
          z = position.z - inc;
          break;
      }

      console.log(x, y, z, "BLOCKS");

      const chunk =
        this.chunks[
          identifyChunk(
            this.chunks,
            x,
            z,
            this.chunkSize,
            this.blockSize.x,
            this.renderDistance
          )
        ];
      chunk.push(new Block(x, y, z, this.scene));
      this.placedBlocks.push(new Block(x, y, z, this.scene));

      this.scene.remove(this.instancedChunk);

      this.createInstanceChunks();
    }
  }
}
