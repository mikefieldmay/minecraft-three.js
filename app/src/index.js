import { Game } from "./components/Game";

import "../css/style.css";

window.onload = () => {
  const game = new Game();
  game.setup();
  game.gameLoop();
};
