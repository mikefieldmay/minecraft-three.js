import { lowestXBlock, lowestZBlock } from "./generateChunks";

export const identifyChunk = (chunks, x, z) => {
  const diffX = x - lowestXBlock(chunks);
  const diffZ = z - lowestZBlock(chunks);
  const divX = Math.floor(diffX / (10 * 5));
  const divZ = Math.floor(diffZ / (10 * 5));
  const chunkMap = [];
  for (let x = 0; x < 3; x++) {
    for (let z = 0; z < 3; z++) {
      chunkMap.push({ x, z });
    }
  }
  let index;
  chunkMap.forEach(({ x, z }, i) => {
    if (x === divX && z === divZ) {
      index = i;
    }
  });
  return index;
};
