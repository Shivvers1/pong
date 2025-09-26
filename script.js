const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

const PADDLE_WIDTH = 10, PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const PADDLE_SPEED = 6;

let leftPaddle = {
  x: 10,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  dy: 0
};

let rightPaddle = {
  x: canvas.width - 10 - PADDLE_WIDTH,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  dy: 0
};

let ball = {
  x: canvas.width / 2 - BALL_SIZE / 2,
  y: canvas.height / 2 - BALL_SIZE / 2,
  dx: Math.random() < 0.5 ? 4 : -4,
  dy: (Math.random()-0.5)*6
};

let scoreLeft = 0, scoreRight = 0;

// Keyboard control
document.addEventListener("keydown", (e) => {
  // Left paddle: W/S
  if (e.key === "w" || e.key === "W") leftPaddle.dy = -PADDLE_SPEED;
  if (e.key === "s" || e.key === "S") leftPaddle.dy = PADDLE_SPEED;

  // Right paddle: ArrowUp/ArrowDown
  if (e.key === "ArrowUp") rightPaddle.dy = -PADDLE_SPEED;
  if (e.key === "ArrowDown") rightPaddle.dy = PADDLE_SPEED;
});
document.addEventListener("keyup", (e) => {
  // Left paddle: W/S
  if (e.key === "w" || e.key === "W" || e.key === "s" || e.key === "S")
    leftPaddle.dy = 0;

  // Right paddle: ArrowUp/ArrowDown
  if (e.key === "ArrowUp" || e.key === "ArrowDown")
    rightPaddle.dy = 0;
});

function clampPaddle(paddle) {
  if (paddle.y < 0) paddle.y = 0;
  if (paddle.y + PADDLE_HEIGHT > canvas.height) paddle.y = canvas.height - PADDLE_HEIGHT;
}

function resetBall(direction = 1) {
  ball.x = canvas.width / 2 - BALL_SIZE / 2;
  ball.y = canvas.height / 2 - BALL_SIZE / 2;
  ball.dx = direction * 4;
  ball.dy = (Math.random()-0.5)*6;
}

function update() {
  // Left paddle movement (keyboard)
  leftPaddle.y += leftPaddle.dy;
  clampPaddle(leftPaddle);

  // Right paddle movement (keyboard)
  rightPaddle.y += rightPaddle.dy;
  clampPaddle(rightPaddle);

  // Ball movement
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision
  if (ball.y <= 0 || ball.y + BALL_SIZE >= canvas.height) {
    ball.dy = -ball.dy;
    ball.y = ball.y <= 0 ? 0 : canvas.height - BALL_SIZE;
  }

  // Paddle collision
  if (collide(leftPaddle, ball)) {
    ball.dx = Math.abs(ball.dx);
    ball.x = leftPaddle.x + PADDLE_WIDTH;
    ball.dy += leftPaddle.dy * 0.4; // add paddle's movement to ball
  }
  if (collide(rightPaddle, ball)) {
    ball.dx = -Math.abs(ball.dx);
    ball.x = rightPaddle.x - BALL_SIZE;
    ball.dy += rightPaddle.dy * 0.4;
  }

  // Score
  if (ball.x < 0) {
    scoreRight++;
    updateScore();
    resetBall(1);
  }
  if (ball.x > canvas.width) {
    scoreLeft++;
    updateScore();
    resetBall(-1);
  }
}

function updateScore() {
  document.getElementById("score-left").textContent = scoreLeft;
  document.getElementById("score-right").textContent = scoreRight;
}

function collide(paddle, ball) {
  return (
    ball.x < paddle.x + PADDLE_WIDTH &&
    ball.x + BALL_SIZE > paddle.x &&
    ball.y < paddle.y + PADDLE_HEIGHT &&
    ball.y + BALL_SIZE > paddle.y
  );
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw paddles
  ctx.fillStyle = "#fff";
  ctx.fillRect(leftPaddle.x, leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(rightPaddle.x, rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Draw ball
  ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

  // Draw net
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  for (let y = 0; y < canvas.height; y += 20) {
    ctx.moveTo(canvas.width/2, y);
    ctx.lineTo(canvas.width/2, y+10);
  }
  ctx.stroke();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
