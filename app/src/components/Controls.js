import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { identifyChunk } from "../utils/identifyChunk";
import { createInstanceChunks } from "../utils/generateChunks";
import { Block } from "./Block";
import { InputHandler } from "./InputHandler";

export class Controls {
  constructor(camera) {
    this.camera = camera;
    this.controls = new PointerLockControls(camera, document.body);
    this.keys = [];
    this.movingSpeed = 0.7;
    this.ySpeed = 0;
    this.jumpSpeed = 1.3;
    this.acc = 0.08;
    this.canJump = true;
    this.autoJump = true;
    this.controlOptions = {
      forward: "w",
      backward: "s",
      right: "d",
      left: "a",
      jump: " "
    };

    this.inputHandler = null;
  }

  setup = () => {
    document.body.addEventListener("click", () => {
      this.controls.lock();
    });
    this.inputHandler = new InputHandler([
      {
        label: "forward",
        key: "w",
        handleKeyPress: (chunks) => {
          this.moveForwards(chunks);
        }
      },
      {
        label: "backward",
        key: "s",
        handleKeyPress: (chunks) => this.moveBack(chunks)
      },
      {
        label: "right",
        key: "d",
        handleKeyPress: (chunks) => this.moveRight(chunks)
      },
      {
        label: "left",
        key: "a",
        handleKeyPress: (chunks) => this.moveLeft(chunks)
      },
      {
        label: "jump",
        key: " ",
        handleKeyPress: (chunks) => this.jump(chunks)
      }
    ]);
  };

  jump() {
    if (this.canJump) {
      this.ySpeed = -this.jumpSpeed;
      this.canJump = false;
    }
  }

  moveForwards(chunks) {
    this.controls.moveForward(this.movingSpeed);
    chunks.forEach((items) => {
      items.forEach((item) => {
        if (!this.autoJump) {
          if (this.hasCollidedX(item) && this.hasCollidedZ(item)) {
            if (this.camera.position.y === item.y - item.height / 2) {
              this.controls.moveForward(-1 * this.movingSpeed);
            }
          }
        }
      });
    });
  }

  moveBack(chunks) {
    this.controls.moveForward(-1 * this.movingSpeed);
    chunks.forEach((items) => {
      items.forEach((item) => {
        if (!this.autoJump) {
          if (this.hasCollidedX(item) && this.hasCollidedZ(item)) {
            if (this.camera.position.y === item.y - item.height / 2) {
              this.controls.moveForward(this.movingSpeed);
            }
          }
        }
      });
    });
  }

  moveLeft(chunks) {
    this.controls.moveRight(-1 * this.movingSpeed);
    chunks.forEach((items) => {
      items.forEach((item) => {
        if (!this.autoJump) {
          if (this.hasCollidedX(item) && this.hasCollidedZ(item)) {
            if (this.camera.position.y === item.y - item.height / 2) {
              this.controls.moveRight(this.movingSpeed);
            }
          }
        }
      });
    });
  }

  moveRight(chunks) {
    this.controls.moveRight(this.movingSpeed);
    chunks.forEach((items) => {
      items.forEach((item) => {
        if (!this.autoJump) {
          if (this.hasCollidedX(item) && this.hasCollidedZ(item)) {
            if (this.camera.position.y === item.y - item.height / 2) {
              this.controls.moveRight(-1 * this.movingSpeed);
            }
          }
        }
      });
    });
  }

  fall() {
    this.camera.position.y -= this.ySpeed;
    this.ySpeed += this.acc;
  }

  update = (chunks, blockPlacedCallback) => {
    this.inputHandler.update(chunks);
    this.fall();
  };

  hasCollidedX = (item) => {
    return (
      this.camera.position.x <= item.x + item.width / 2 &&
      this.camera.position.x >= item.x - item.width / 2
    );
  };
  hasCollidedY = (item) => {
    return (
      this.camera.position.y <= item.y + item.height * 2 &&
      this.camera.position.y >= item.y
    );
  };
  hasCollidedZ = (item) => {
    return (
      this.camera.position.z <= item.z + item.depth / 2 &&
      this.camera.position.z >= item.z - item.depth / 2
    );
  };
}
