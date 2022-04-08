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
  }

  display = () => {
    const blockBox = new THREE.BoxBufferGeometry(
      this.width,
      this.height,
      this.depth
    );
    const blockMesh = new THREE.MeshBasicMaterial({ color: "#96f97b" });
    this.mesh = new THREE.Mesh(blockBox, this.materialArray || blockMesh);
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
