import * as THREE from "three";

import { InputHandler } from "./InputHandler";

export class Player {
  constructor(pointer, camera, blockFactory, scene) {
    this.raycaster = new THREE.Raycaster();
    this.pointer = pointer;
    this.camera = camera;
    this.blockFactory = blockFactory;
    this.scene = scene;
    this.canPlaceBlock = true;

    this.inputHandler = new InputHandler([
      {
        label: "place",
        key: "q",
        handleKeyPress: (chunks) => {
          this.handleBlockPlace(chunks);
        }
      }
    ]);
  }

  render() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.intersection = this.raycaster.intersectObject(
      this.blockFactory.instancedChunk
    );
    if (this.intersection[0] && this.intersection[0].distance < 40) {
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
        const materialIndex = this.intersection[0].face.materialIndex;
        const position = this.intersection[0].point;

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
              position.x - inc,
              Math.round(position.y / 5) * 5,
              Math.round(position.z / 5) * 5
            );
            break;
          // top
          case 2:
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
              Math.round(position.x / 5) * 5,
              position.y - inc,
              Math.round(position.z / 5) * 5
            );
            break;
          // back
          case 4:
            this.plane.rotation.set(0, 0, Math.PI / 2);
            this.plane.position.set(
              Math.round(position.x / 5) * 5,
              Math.round(position.y / 5) * 5,
              position.z + inc
            );
            break;
          // front
          case 5:
            this.plane.rotation.set(0, 0, Math.PI / 2);
            this.plane.position.set(
              Math.round(position.x / 5) * 5,
              Math.round(position.y / 5) * 5,
              position.z - inc
            );
            break;
        }
      }
    } else {
      if (this.plane) {
        this.plane.visible = false;
      }
    }
  }

  handleBlockPlace() {
    if (this.canPlaceBlock) {
      this.canPlaceBlock = false;
      this.blockFactory.handlePlaceBlock(this.intersection);
      setTimeout(() => {
        this.canPlaceBlock = true;
      }, 250);
    }
  }
}
