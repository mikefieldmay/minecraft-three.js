import { lowestXBlock, lowestZBlock } from "./generateChunks";

export const identifyChunk = (
  chunks,
  x,
  z,
  chunkSize,
  blockSize,
  renderDistance
) => {
  console.log(x, z);
  const diffX = x - lowestXBlock(chunks);
  const diffZ = z - lowestZBlock(chunks);
  console.log(
    "FUCKIN HELL",
    "chunkSize",
    chunkSize,
    "blockSize",
    blockSize,
    diffX,
    diffZ
  );

  const divX = Math.floor(diffX / (chunkSize * blockSize));
  const divZ = Math.floor(diffZ / (chunkSize * blockSize));
  const chunkMap = [];
  for (let x = 0; x < renderDistance; x++) {
    for (let z = 0; z < renderDistance; z++) {
      chunkMap.push({ x, z });
    }
  }

  console.log(chunkMap, divX, divZ);
  let index;
  chunkMap.forEach(({ x, z }, i) => {
    if (x === divX && z === divZ) {
      index = i;
    }
  });
  return index;
};
