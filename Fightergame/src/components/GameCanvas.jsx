import { useEffect } from "react";
import makeKaplayCtx from "../kaplayCtx";
import makePlayer from "../makePlayer";
import makeAIPlayer from "../makeAIPlayer"; 

export default function GameCanvas() {
  useEffect(() => {
    if (window.__kaplay_initialized__) return;
    window.__kaplay_initialized__ = true;

    const k = makeKaplayCtx();

    k.loadSprite("background", "/sprites/background.png");
    k.loadSprite("player", "/sprites/player/spritesheet.png", {
      sliceX: 8,
      sliceY: 3,
      anims: {
        idle: { from: 0, to: 7, loop: true },
        run: { from: 8, to: 13, loop: true },
        attack: { from: 16, to: 19, loop: false },
      },
    });

    k.scene("fight", () => {
      k.add([k.sprite("background"), k.pos(0, 0), k.scale(1.87)]);

      const player = makePlayer(k, k.vec2(200, 650), 400);
      makeAIPlayer(k, k.vec2(900, 650), 250, player); // AI added here

      k.add([
        k.pos(0, 700),
        k.rect(k.width, 50),
        k.area(),
        k.body({ isStatic: true }),
        k.opacity(0),
      ]);
    });

    k.go("fight");
  }, []);

  return null;
}
