export default function makePlayer(k, posVec2, speed) {
  const player = k.add([
    k.sprite("player", { anim: "idle" }),
    k.pos(posVec2),
    k.area({ shape: new k.Rect(k.vec2(5, 10), 20, 40) }),
    k.body({ jumpForce: 400, weight: 1, isStatic: false }),
    k.scale(2),
    "player",
  ]);

  let attacking = false;
  let health = 100;

  // Health bar
  const barBg = k.add([
    k.rect(120, 10),
    k.color(100, 0, 0),
    k.anchor("center"),
    k.pos(player.pos.x, player.pos.y - 40),
    { z: 10 },
  ]);

  const bar = k.add([
    k.rect(120, 10),
    k.color(0, 255, 0),
    k.anchor("center"),
    k.pos(player.pos.x, player.pos.y - 40),
    { z: 11 },
  ]);

  // Floating damage text
  function showDamageText(amount, pos) {
    const dmgText = k.add([
      k.text(`-${amount}`, { size: 16 }),
      k.color(255, 0, 0),
      k.pos(pos.x, pos.y - 40),
      k.anchor("center"),
      { z: 50 },
    ]);

    k.tween(dmgText.pos.y, dmgText.pos.y - 20, 0.4, (v) => (dmgText.pos.y = v), k.easings.easeOutCubic);
    k.wait(0.6, () => dmgText.destroy());
  }

  // Animation helper
  const playAnim = (anim, loop = true) => {
    if (player.getCurAnim()?.name !== anim) {
      player.play(anim, { loop });
    }
  };

  // Reset attack after animation
  player.onAnimEnd((animName) => {
    if (animName === "attack") {
      attacking = false;
    }
  });

  // Attack
  k.onKeyPress("space", () => {
    if (attacking) return;
    attacking = true;
    playAnim("attack", false);

    // Deal damage to nearby enemies mid-attack
    k.wait(0.3, () => {
      const enemies = k.get("enemy");
      for (const enemy of enemies) {
        if (enemy.exists() && player.pos.dist(enemy.pos) < 100 && typeof enemy.hurt === "function") {
          enemy.hurt(10);
          showDamageText(10, enemy.pos);
        }
      }
    });
  });

  // Movement
  k.onUpdate(() => {
    if (attacking) return; // don’t override attack anim whic causes freeze frame

    let dx = 0;
    if (k.isKeyDown("ArrowRight") || k.isKeyDown("d")) dx += 1;
    if (k.isKeyDown("ArrowLeft") || k.isKeyDown("a")) dx -= 1;

    if (dx !== 0) {
      player.move(dx * speed, 0);
      player.flipX = dx < 0;
      playAnim("run");
    } else {
      playAnim("idle");
    }

    if ((k.isKeyDown("ArrowUp") || k.isKeyDown("w")) && player.isGrounded()) {
      player.jump();
    }

    // Update health bar position — unchanged from your setup
    const barY = player.pos.y + 80;
    const barX = player.pos.x + 200;
    barBg.pos = k.vec2(barX, barY);
    bar.pos = k.vec2(barX, barY);
    bar.width = 120 * (health / 100);
  });

  // Player taking damage
  player.hurt = (amount) => {
    health = Math.max(0, health - amount);
    showDamageText(amount, player.pos);
    if (health <= 0) {
      player.destroy();
      bar.destroy();
      barBg.destroy();
    }
  };

  return player;
}
