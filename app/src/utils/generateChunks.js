import { noise } from "perlin";
import * as THREE from "three";

import GrassBottom from "../../assets/texture/grass/bottom.jpeg";
import GrassTop from "../../assets/texture/grass/top.jpeg";
import GrassSide from "../../assets/texture/grass/side.jpeg";
import { Block } from "../components/Block";

const loader = new THREE.TextureLoader();
const materialArray = [
  new THREE.MeshBasicMaterial({ map: loader.load(GrassSide) }),
  new THREE.MeshBasicMaterial({ map: loader.load(GrassSide) }),
  new THREE.MeshBasicMaterial({ map: loader.load(GrassTop) }),
  new THREE.MeshBasicMaterial({ map: loader.load(GrassBottom) }),
  new THREE.MeshBasicMaterial({ map: loader.load(GrassSide) }),
  new THREE.MeshBasicMaterial({ map: loader.load(GrassSide) })
];

export const createInstanceChunks = (
  chunks,
  blockBox,
  placedBlocksLength = 0
) => {
  const renderDistance = 3;
  const chunkSize = 10;
  let count = 0;
  const instancedChunk = new THREE.InstancedMesh(
    blockBox,
    materialArray,
    chunkSize * chunkSize * renderDistance * renderDistance + placedBlocksLength
  );

  chunks.forEach((chunk) => {
    chunk.forEach((block) => {
      let matrix = new THREE.Matrix4().makeTranslation(
        block.x,
        block.y,
        block.z
      );
      instancedChunk.setMatrixAt(count, matrix);
      count++;
    });
  });
  return instancedChunk;
};

export const generateInitialChunks = (scene, camera) => {
  const chunks = [];
  let xOff = 0;
  let zOff = 0;
  const inc = 0.05;
  const amplitude = 50;
  const renderDistance = 3;
  const chunkSize = 10;
  camera.position.set(
    ((renderDistance * chunkSize) / 2) * 5,
    ((renderDistance * chunkSize) / 2) * 5,
    50
  );

  for (let i = 0; i < renderDistance; i++) {
    for (let j = 0; j < renderDistance; j++) {
      const chunk = [];
      for (let x = i * chunkSize; x < i * chunkSize + chunkSize; x++) {
        for (let z = j * chunkSize; z < j * chunkSize + chunkSize; z++) {
          xOff = inc * x;
          zOff = inc * z;
          const v = Math.round((noise.perlin2(xOff, zOff) * amplitude) / 5) * 5;
          chunk.push(new Block(x * 5, v, z * 5, scene, materialArray));
        }
      }
      chunks.push(chunk);
    }
  }

  var blockBox = new THREE.BoxGeometry(5, 5, 5);
  var instancedChunk = createInstanceChunks(chunks, blockBox);
  scene.add(instancedChunk);

  return { chunks, instancedChunk, blockBox };
};

export const lowestXBlock = (blocks) => {
  var xPosArray = [];
  blocks.forEach((blockArray) => {
    blockArray.forEach((block) => {
      xPosArray.push(block.x);
    });
  });
  return Math.min.apply(null, xPosArray);
};

export const highestXBlock = (blocks) => {
  var xPosArray = [];
  blocks.forEach((blockArray) => {
    blockArray.forEach((block) => {
      xPosArray.push(block.x);
    });
  });
  return Math.max.apply(null, xPosArray);
};

export const lowestZBlock = (blocks) => {
  var zPosArray = [];
  blocks.forEach((blockArray) => {
    blockArray.forEach((block) => {
      zPosArray.push(block.z);
    });
  });
  return Math.min.apply(null, zPosArray);
};

export const highestZBlock = (blocks) => {
  var zPosArray = [];
  blocks.forEach((blockArray) => {
    blockArray.forEach((block) => {
      zPosArray.push(block.z);
    });
  });
  return Math.max.apply(null, zPosArray);
};
