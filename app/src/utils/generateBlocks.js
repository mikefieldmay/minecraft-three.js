import { noise } from "perlin";
import * as THREE from "three";

import GrassBottom from "../../assets/texture/grass/bottom.jpeg";
import GrassTop from "../../assets/texture/grass/top.jpeg";
import GrassSide from "../../assets/texture/grass/side.jpeg";
import { Block } from "../components/Block";

export const generateBlocks = (scene, camera) => {
  const loader = new THREE.TextureLoader();
  const materialArray = [
    new THREE.MeshBasicMaterial({ map: loader.load(GrassSide) }),
    new THREE.MeshBasicMaterial({ map: loader.load(GrassSide) }),
    new THREE.MeshBasicMaterial({ map: loader.load(GrassTop) }),
    new THREE.MeshBasicMaterial({ map: loader.load(GrassBottom) }),
    new THREE.MeshBasicMaterial({ map: loader.load(GrassSide) }),
    new THREE.MeshBasicMaterial({ map: loader.load(GrassSide) })
  ];

  var chunks = [];
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

  chunks.forEach((chunkArray) => {
    chunkArray.forEach((chunk) => {
      chunk.display();
    });
  });

  return chunks;
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
  return Math.mimaxn.apply(null, zPosArray);
};
