import { Game } from "./components/Game";

import "../css/style.css";

window.onload = async () => {
  const game = new Game();
  await game.setup();
  game.gameLoop();
};
