import * as THREE from "three";

export class Block {
  constructor(x, y, z, scene, materialArray) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.scene = scene;
    this.width = 5;
    this.height = 5;
    this.depth = 5;
    this.materialArray = materialArray;
    this.mesh = null;
    this.line = null;
    this.directions = [];
    this.faces = [
      {
        dir: [-5, 0, 0, "left"]
      },
      {
        dir: [5, 0, 0, "right"]
      },
      {
        dir: [0, -5, 0, "bottom"]
      },
      {
        dir: [0, 5, 0, "top"]
      },
      {
        dir: [0, 0, -5, "back"]
      },
      {
        dir: [0, 0, 5, "front"]
      }
    ];
  }

  getVoxel(chunks, x, y, z) {
    let neighbour = false;
    // if there is a block adjacent to any of our blocks return true
    chunks.forEach((chunk) => {
      chunk.forEach((block) => {
        if (block.x === x && block.y === y && block.z === z) {
          neighbour = true;
        }
      });
    });
    return neighbour;
  }

  adjustFaces(chunks) {
    this.faces.map(({ dir }) => {
      const neighbour = this.getVoxel(
        chunks,
        this.x + dir[0],
        this.y + dir[1],
        this.z + dir[2]
      );
      if (neighbour) {
        this.directions.push(dir[3]);
      }
    });
  }

  display = (chunks) => {
    this.adjustFaces(chunks);
    const blockBox = new THREE.BoxBufferGeometry(
      this.width,
      this.height,
      this.depth
    );
    this.mesh = new THREE.Mesh(blockBox, [
      this.directions.includes("right") ? null : this.materialArray[0],
      this.directions.includes("left") ? null : this.materialArray[1],
      this.directions.includes("top") ? null : this.materialArray[2],
      this.directions.includes("bottom") ? null : this.materialArray[3],
      this.directions.includes("front") ? null : this.materialArray[4],
      this.directions.includes("back") ? null : this.materialArray[5]
    ]);
    this.scene.add(this.mesh);
    this.mesh.position.set(this.x, this.y - 10, this.z);

    const edges = new THREE.EdgesGeometry(blockBox);
    this.line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: "black" })
    );
    this.scene.add(this.line);
    this.line.position.set(this.x, this.y - 10, this.z);
  };
}
