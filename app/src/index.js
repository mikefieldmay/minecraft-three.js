import { Game } from "./components/Game";

import "../css/style.css";

window.onload = async () => {
  const helpText = document.getElementById("help");
  const startButton = document.getElementById("startButton");

  startButton.onclick = async () => {
    helpText.classList.add("hide");
    const game = new Game();
    await game.setup();
    game.gameLoop();
  };
};
