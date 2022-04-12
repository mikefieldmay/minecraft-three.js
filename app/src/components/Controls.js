import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { identifyChunk } from "../utils/identifyChunk";
import { createInstanceChunks } from "../utils/generateChunks";
import { Block } from "./Block";

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
    this.canPlaceBlock = true;
    this.autoJump = true;
    this.controlOptions = {
      forward: "w",
      backward: "s",
      right: "d",
      left: "a",
      jump: " ",
      placeBlock: "q"
    };
  }

  setup = () => {
    document.body.addEventListener("click", () => {
      this.controls.lock();
    });

    window.addEventListener("keydown", (event) => {
      this.keys.push(event.key);
      if (event.key == this.controlOptions.jump && this.canJump) {
        this.ySpeed = -this.jumpSpeed;
        this.canJump = false;
      }
    });
    window.addEventListener("keyup", (event) => {
      this.keys = this.keys.filter((key) => key != event.key);
    });
  };

  update = (chunks, blockPlacedCallback) => {
    if (this.keys.includes(this.controlOptions.forward)) {
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
    if (this.keys.includes(this.controlOptions.left)) {
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
    if (this.keys.includes(this.controlOptions.backward)) {
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
    if (this.keys.includes(this.controlOptions.right)) {
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
    if (this.keys.includes(this.controlOptions.placeBlock)) {
      if (this.canPlaceBlock) {
        this.canPlaceBlock = false;

        blockPlacedCallback();
        setTimeout(() => {
          this.canPlaceBlock = true;
        }, 250);
      }
    }
    this.camera.position.y -= this.ySpeed;
    this.ySpeed += this.acc;
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
