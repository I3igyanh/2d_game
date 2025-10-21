export default function makeAIPlayer(k, posVec2, speed, target) {
  const ai = k.add([
    k.sprite("player", { anim: "idle" }),
    k.pos(posVec2),
    k.area({ shape: new k.Rect(k.vec2(5, 10), 20, 40) }),
    k.body({ jumpForce: 400, weight: 1, isStatic: false }),
    k.scale(2),
    "enemy",
  ]);

  let attacking = false;
  let direction = 0;
  let health = 100;

  // --- Health bar ---
  const barBg = k.add([
    k.rect(120, 6),
    k.color(100, 0, 0),
    k.anchor("center"),
    k.pos(ai.pos.x, ai.pos.y - 30),
    { z: 10 },
  ]);

  const bar = k.add([
    k.rect(120, 6),
    k.color(0, 255, 0),
    k.anchor("center"),
    k.pos(ai.pos.x, ai.pos.y - 30),
    { z: 11 },
  ]);

  // --- Helper for animations ---
  const playAnim = (anim, loop = true) => {
    if (ai.getCurAnim()?.name !== anim) {
      ai.play(anim, { loop });
    }
  };

  // --- Damage pop-up text ---
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

  // --- Update logic ---
  ai.onUpdate(() => {
    if (!target.exists()) return;

    const dist = target.pos.x - ai.pos.x;
    const absDist = Math.abs(dist);

    if (!attacking) {
      if (absDist > 100 && absDist < 600) {
        direction = dist > 0 ? 1 : -1;
        ai.move(direction * speed, 0);
        ai.flipX = direction < 0;
        playAnim("run");
      } else {
        playAnim("idle");
      }
    }

    // --- Attack logic ---
    if (absDist <= 120 && !attacking) {
      attacking = true;
      playAnim("attack", false);

      // Hit check after short delay (timed with animation)
      k.wait(0.3, () => {
        if (target.exists() && ai.pos.dist(target.pos) < 100 && typeof target.hurt === "function") {
          target.hurt(10);
          showDamageText(10, target.pos);
        }
      });

      // Return to idle after attack
      k.wait(0.6, () => {
        attacking = false;
        playAnim("idle");
      });
    }

    // --- Random jump for variety ---
    if (Math.random() < 0.002 && ai.isGrounded()) {
      ai.jump();
    }

    // --- Update health bar position ---
    const barY = ai.pos.y +50; // closer to the head
    const barX = ai.pos.x +200;
    barBg.pos = k.vec2(barX, barY);
    bar.pos = k.vec2(barX, barY);
    bar.width = 120 * (health / 100);
  });

  // --- Handle AI taking damage ---
  ai.hurt = (amount) => {
    health = Math.max(0, health - amount);
    showDamageText(amount, ai.pos);

    if (health <= 0) {
      ai.destroy();
      bar.destroy();
      barBg.destroy();
    }
  };

  return ai;
}
