import {
  lowestXBlock,
  lowestZBlock,
  highestZBlock,
  highestXBlock
} from "../utils/generateChunks";

export class World {
  constructor(camera, blockFactory, controls) {
    this.camera = camera;
    this.blockFactory = blockFactory;
    this.controls = controls;
  }

  create() {
    this.blockFactory.generateInitialChunks();

    this.camera.position.set(
      ((this.blockFactory.renderDistance * this.blockFactory.chunkSize) / 2) *
        5,
      ((this.blockFactory.renderDistance * this.blockFactory.chunkSize) / 2) *
        5,
      ((this.blockFactory.renderDistance * this.blockFactory.chunkSize) / 2) * 5
    );
  }

  checkCollisions() {
    this.blockFactory.chunks.forEach((blockArray) => {
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

  handleEdges() {
    /*
        [0], [3], [6],
        [1], [4], [7],
        [2], [5], [8]
    */
    if (this.camera.position.z <= lowestZBlock(this.blockFactory.chunks) + 15) {
      this.blockFactory.handleBottomZEdge();
    }
    if (
      this.camera.position.z >=
      highestZBlock(this.blockFactory.chunks) - 15
    ) {
      this.blockFactory.handleTopZEdge();
    }
    if (this.camera.position.x <= lowestXBlock(this.blockFactory.chunks) + 15) {
      this.blockFactory.handleBottomXEdge();
    }
    if (
      this.camera.position.x >=
      highestXBlock(this.blockFactory.chunks) - 15
    ) {
      this.blockFactory.handleTopXEdge();
    }
  }
}
