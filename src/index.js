import Phaser from "phaser";

var config = {
  type: Phaser.AUTO,
  backgroundColor: "#161616",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 1000
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var bricks;
var paddle;
var ball;
var pointer;
var scoreText;
var score = 0;
var heart;
var lifeText;
var lives = 5;
var gameOverText;
var youWonText;
var music;
var scoreaud;
var victory;
var fail;
var hit;

let game = new Phaser.Game(config);

function preload() {
  this.load.image("ball", "assets/ball.png");
  this.load.image("paddle", "assets/paddle.png");
  this.load.image("purple", "assets/purple.png");
  this.load.image("navy", "assets/navy.png");
  this.load.image("red", "assets/red.png");
  this.load.image("heart", "assets/heart.png");
  this.load.audio("music", "audio/music.mp3");
  this.load.audio("fail", "audio/fail.mp3");
  this.load.audio("hit", "audio/hit.mp3");
  this.load.audio("victory", "audio/victory.mp3");
  this.load.audio("scoreaud", "audio/score.mp3");
}

function create() {
  music = this.sound.add("music", {
    loop: true
  });
  victory = this.sound.add("victory", {
    loop: false
  });
  fail = this.sound.add("fail", {
    loop: false
  });
  scoreaud = this.sound.add("scoreaud", {
    loop: false
  });
  hit = this.sound.add("hit", {
    loop: false
  });
  music.play();

  this.physics.world.setBoundsCollision(true, true, true, false);

  bricks = this.physics.add.staticGroup({
    key: ["purple", "navy", "red"],
    frameQuantity: 10,
    gridAlign: {
      width: 5,
      height: 6,
      cellWidth: 150,
      cellHeight: 50,
      x: 100,
      y: 130
    }
  });

  ball = this.physics.add
    .image(400, 918, "ball")
    .setCollideWorldBounds(true)
    .setBounce(1);
  ball.setData("onPaddle", true);
  paddle = this.physics.add.image(400, 950, "paddle").setImmovable();

  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "32px",
    fill: "#fff"
  });

  lifeText = this.add.text(700, 16, `${lives}x`, {
    fontSize: "32px",
    fill: "#fff"
  });

  gameOverText = this.add.text(16, 400, "", {
    fontSize: "140px",
    fill: "#fff"
  });
  youWonText = this.add.text(64, 400, "", {
    fontSize: "140px",
    fill: "#fff"
  });

  heart = this.physics.add.image(760, 30, "heart");

  this.physics.add.collider(ball, bricks, hitBrick, null, this);
  this.physics.add.collider(ball, paddle, hitPaddle, null, this);

  this.input.on("pointermove", function (pointer) {
    paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);
    if (ball.getData("onPaddle")) {
      ball.x = paddle.x;
    }
  });
  this.input.on("pointerup", function (pointer) {
    if (ball.getData("onPaddle")) {
      ball.setVelocity(-75, -700);
      ball.setData("onPaddle", false);
    }
  });
}

function update() {
  if (ball.y > 1000) {
    if (lives > 1) {
      resetBall();
      lives -= 1;
      lifeText.setText(lives + "x");
    } else if (lives === 1) {
      lives -= 1;
      lifeText.setText(lives + "x");
      gameOver();
    }
  }
}

function hitBrick(ball, brick) {
  scoreaud.play();
  brick.disableBody(true, true);
  if (brick.texture.key === "red") {
    score += 10;
  } else if (brick.texture.key === "navy") {
    score += 20;
  } else {
    score += 40;
  }
  scoreText.setText("Score: " + score);
  if (bricks.countActive() === 0) {
    youWon();
  }
}

function hitPaddle(ball, paddle) {
  let diff = 0;
  hit.play();
  if (ball.x < paddle.x) {
    diff = paddle.x - ball.x;
    ball.setVelocityX(-12 * diff);
  } else if (paddle.x < ball.x) {
    diff = ball.x - paddle.x;
    ball.setVelocityX(12 * diff);
  } else {
    ball.setVelocity(-75, -900);
  }
}

function resetBall() {
  ball.setVelocity(0);
  ball.setData("onPaddle", true);
  ball.setPosition(paddle.x, 900);
}

function gameOver() {
  music.stop();
  fail.play();
  bricks.children.each(function (brick) {
    brick.disableBody(true, true);
  });

  paddle.disableBody(true, true);
  ball.disableBody(true, true);

  music.stop();
  fail.play();

  gameOverText.setText("GAME OVER");
}

function youWon() {
  paddle.disableBody(true, true);
  ball.disableBody(true, true);
  music.stop();
  victory.play();
  youWonText.setText("YOU WON!");
}
