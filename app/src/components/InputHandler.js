export class InputHandler {
  constructor(controlOptions) {
    this.controlOptions = controlOptions;
    this.keys = [];

    window.addEventListener("keydown", (event) => {
      this.keys.push(event.key);
    });
    window.addEventListener("keyup", (event) => {
      this.keys = this.keys.filter((key) => key != event.key);
    });
  }

  update = (chunks) => {
    this.controlOptions.map(({ key, handleKeyPress }) => {
      if (this.keys.includes(key) && handleKeyPress) {
        handleKeyPress(chunks);
      }
    });
  };
}
