// Extend our game with multiple scenes

// Start game
kaboom({
  global: true,
  fullscreen: true,
  scale: 1,
  debug: true,
  background: [],
});

// Load assets
loadSprite("bean", "/sprites/hero.png");
loadSprite("coin", "/sprites/bread.png");
loadSprite("spike", "/sprites/spike.png");
loadSprite("grass", "/sprites/block.png");
loadSprite("portal", "/sprites/portal.png");

const SPEED = 480;

// Design 2 levels
const LEVELS = [
  [
    "                 $                                                          ",
    "                                                           >                 ",
    "                $$                                         =                  ",
    "                                         =                                 ",
    "                                             =                             ",
    "    =         $$$$           $   $        =",
    "               ==            =",
    "        $                 =",
    "        =            =",
    "@                                                                         ",
    "=================   ================   ========  =======  ===============  ",
    "=               =   =              =   =      =  =     =  =             =   ",
    "=               =   =              =   =      =  =     =  =             =   ",
    "=               =   =              =   =      =  =     =  =             =   ",
  ],
  ["@   $   >", "=   =   ="],
  ["@   $   >", "=   ==    ="],
  ["    $$$$  $$$", "@      $    >", "=      =    ="],
];

// Define a scene called "game". The callback will be run when we go() to the scene
// Scenes can accept argument from go()
scene("game", ({ levelIdx, score }) => {
  let gravityCounter = 2500;
  gravity(gravityCounter);

  // Use the level passed, or first level
  const level = addLevel(LEVELS[levelIdx || 0], {
    width: 32,
    height: 32,
    pos: vec2(100, 200),
    "@": () => [sprite("bean"), area(), body(), origin("bot"), "player"],
    "=": () => [sprite("grass"), area(), solid(), origin("bot")],
    $: () => [sprite("coin"), area(), origin("bot"), "coin"],
    "^": () => [sprite("spike"), area(), origin("bot"), "danger"],
    ">": () => [sprite("portal"), area(), origin("bot"), "portal"],
  });

  // Get the player object from tag
  const player = get("player")[0];

  // Movements
  let doubleJump = false;

  onKeyPress("space", () => {
    if (player.isGrounded()) {
      player.jump();
      doubleJump = false;
    } else if (doubleJump) {
      player.jump();
      doubleJump = false;
    }
    player.jump();
  });

  onKeyDown("left" || "A", () => {
    player.flipX(true);
    player.move(-SPEED, 0);
  });

  onKeyDown("right", () => {
    player.flipX(false);
    player.move(SPEED, 0);
  });

  player.onCollide("danger", () => {
    player.pos = level.getPos(0, 0);
    // Go to "lose" scene when we hit a "danger"
    go("lose");
  });

  player.onCollide("coin", (coin) => {
    destroy(coin);
    score++;
    gravityCounter = gravityCounter - 200;
    if (score >= 3) {
      doubleJump = true;
    }
    scoreLabel.text = score;
  });

  // Fall death
  player.onUpdate(() => {
    if (player.pos.y >= 1980) {
      go("lose");
    }
  });

  // Enter the next level on portal
  player.onCollide("portal", () => {
    if (levelIdx < LEVELS.length - 1) {
      // If there's a next level, go() to the same scene but load the next level
      go("game", {
        levelIdx: levelIdx + 1,
        score: score,
      });
    } else {
      // Otherwise we have reached the end of game, go to "win" scene!
      go("win", { score: score });
    }
  });

  // Score counter text
  const scoreLabel = add([text(score), pos(12)]);
});
loseText = ["Try again"];
const randomIndex = Math.floor(Math.random() * loseText.length);
const randomText = loseText[randomIndex];

scene("lose", () => {
  add([text(randomText), pos(12)]);

  // Press any key to go back
  onKeyPress(start);
});

scene("win", ({ score }) => {
  add([
    text(`You grabbed ${score} coins!!!`, {
      width: width(),
    }),
    pos(12),
  ]);

  onKeyPress(start);
});

function start() {
  // Start with the "game" scene, with initial parameters
  go("game", {
    levelIdx: 0,
    score: 0,
  });
}

start();
