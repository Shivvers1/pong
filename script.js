const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.8;
const MOVE_SPEED = 6;
const JUMP_STRENGTH = 16;
const PLATFORM_WIDTH = 180;
const PLATFORM_HEIGHT = 26;

// Bugatti Chiron player model
const BUGATTI_WIDTH = 80;
const BUGATTI_HEIGHT = 38;
const BIG_BUGATTI_WIDTH = 120;
const BIG_BUGATTI_HEIGHT = 55;

const PLAYER_START = {x: 60, y: 380};

let keys = {};

// Game objects
let player = {
  x: PLAYER_START.x,
  y: PLAYER_START.y,
  vx: 0,
  vy: 0,
  w: BUGATTI_WIDTH,
  h: BUGATTI_HEIGHT,
  onGround: false,
  big: false,
  invincible: false,
  invincibleTimer: 0,
  score: 0,
};

let platforms = [
  {x: 30, y: 450, w: 300, h: PLATFORM_HEIGHT, vanish: false},
  {x: 380, y: 410, w: PLATFORM_WIDTH, h: PLATFORM_HEIGHT, vanish: true, timer: 0},
  {x: 650, y: 370, w: PLATFORM_WIDTH, h: PLATFORM_HEIGHT, vanish: false},
  {x: 850, y: 320, w: PLATFORM_WIDTH, h: PLATFORM_HEIGHT, vanish: true, timer: 0},
  {x: 200, y: 260, w: PLATFORM_WIDTH, h: PLATFORM_HEIGHT, vanish: false},
  {x: 500, y: 210, w: PLATFORM_WIDTH, h: PLATFORM_HEIGHT, vanish: false},
  {x: 800, y: 160, w: PLATFORM_WIDTH, h: PLATFORM_HEIGHT, vanish: false}
];

let powerUps = [
  {type: 'mushroom', x: 420, y: 380, taken: false},
  {type: 'star', x: 510, y: 180, taken: false}
];

// Controls
document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

// Game loop
function update() {
  // Player movement
  if (keys['arrowleft'] || keys['a']) player.vx = -MOVE_SPEED;
  else if (keys['arrowright'] || keys['d']) player.vx = MOVE_SPEED;
  else player.vx = 0;

  // Jump
  if ((keys['arrowup'] || keys['w'] || keys[' ']) && player.onGround) {
    player.vy = -JUMP_STRENGTH * (player.big ? 1.12 : 1);
    player.onGround = false;
  }

  // Gravity
  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  // Platform collision
  player.onGround = false;
  for (const p of platforms) {
    // Handle vanish platforms
    if (p.vanish) {
      p.timer = (p.timer || 0) + 1;
      let visible = Math.floor(p.timer/60)%2 === 0;
      p.visible = visible;
      if (!visible) continue;
    } else {
      p.visible = true;
    }

    if (
      player.x + player.w > p.x &&
      player.x < p.x + p.w &&
      player.y + player.h > p.y &&
      player.y + player.h - player.vy < p.y &&
      player.vy >= 0
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  // World bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
  if (player.y + player.h > canvas.height) {
    player.y = canvas.height - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  // Power-up collision
  for (const pu of powerUps) {
    if (pu.taken) continue;
    if (
      player.x + player.w > pu.x &&
      player.x < pu.x + 38 &&
      player.y + player.h > pu.y &&
      player.y < pu.y + 38
    ) {
      pu.taken = true;
      if (pu.type === 'mushroom') {
        player.big = true;
        player.w = BIG_BUGATTI_WIDTH;
        player.h = BIG_BUGATTI_HEIGHT;
        setTimeout(() => {
          player.big = false;
          player.w = BUGATTI_WIDTH;
          player.h = BUGATTI_HEIGHT;
        }, 8000);
      } else if (pu.type === 'star') {
        player.invincible = true;
        player.invincibleTimer = 480; // 8 seconds
      }
      player.score += 100;
    }
  }

  // Invincibility timer
  if (player.invincible) {
    player.invincibleTimer--;
    if (player.invincibleTimer <= 0) {
      player.invincible = false;
    }
  }
}

function drawPlatform(p) {
  let grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
  grad.addColorStop(0, "#2d3436");
  grad.addColorStop(0.7, PLATFORM_COLOR);
  grad.addColorStop(1, "#145a32");
  ctx.fillStyle = grad;
  ctx.save();
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 24;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.restore();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.strokeRect(p.x, p.y, p.w, p.h);
}

function drawVanishPlatform(p) {
  ctx.save();
  ctx.globalAlpha = 0.22;
  drawPlatform(p);
  ctx.globalAlpha = 1.0;
  ctx.restore();
}

function drawMushroom(x, y) {
  // Stylized 3D mushroom
  ctx.save();
  ctx.translate(x+19, y+19);
  ctx.fillStyle = MUSHROOM_COLOR;
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 12, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(0, 6, 12, 7, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawStar(ctx, cx, cy, r, points, inset){
  ctx.save();
  ctx.beginPath();
  ctx.translate(cx, cy);
  ctx.moveTo(0,0-r);
  for(let i=0; i < points; i++){
    ctx.rotate(Math.PI / points);
    ctx.lineTo(0, 0 - (r*inset));
    ctx.rotate(Math.PI / points);
    ctx.lineTo(0, 0 - r);
  }
  ctx.closePath();
  ctx.fillStyle = STAR_COLOR;
  ctx.shadowColor = STAR_COLOR;
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.restore();
}

function drawBugatti(x, y, w, h, invincible=false) {
  // Stylized Bugatti Chiron
  ctx.save();
  ctx.translate(x, y);

  // Car body
  let grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#0061b2");
  grad.addColorStop(0.5, "#00aaff");
  grad.addColorStop(1, "#001f3f");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(w*0.1, h*0.68);
  ctx.bezierCurveTo(w*0.05, h*0.45, w*0.18, h*0.15, w*0.45, h*0.15);
  ctx.bezierCurveTo(w*0.7, h*0.15, w*0.95, h*0.35, w*0.95, h*0.7);
  ctx.lineTo(w*0.96, h*0.95);
  ctx.lineTo(w*0.1, h*0.95);
  ctx.closePath();
  ctx.fill();

  // Windshield
  ctx.fillStyle = "#cfd8dc";
  ctx.beginPath();
  ctx.ellipse(w*0.52, h*0.35, w*0.26, h*0.18, 0, Math.PI*0.95, Math.PI*0.05, false);
  ctx.fill();

  // Front grille
  ctx.fillStyle = "#232323";
  ctx.beginPath();
  ctx.ellipse(w*0.90, h*0.83, w*0.07, h*0.12, 0, 0, Math.PI*2);
  ctx.fill();

  // Headlights
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(w*0.17, h*0.7, w*0.06, h*0.04, 0, 0, Math.PI*2);
  ctx.ellipse(w*0.80, h*0.62, w*0.06, h*0.04, 0, 0, Math.PI*2);
  ctx.fill();

  // Wheels
  ctx.save();
  ctx.shadowColor = "#444";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#232323";
  ctx.beginPath();
  ctx.arc(w*0.22, h*0.92, h*0.13, 0, Math.PI*2);
  ctx.arc(w*0.77, h*0.92, h*0.13, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  // Bugatti logo
  ctx.fillStyle = "#fff";
  ctx.font = `${Math.round(h*0.11)}px Arial`;
  ctx.fillText("EB", w*0.74, h*0.55);

  // Invincibility aura
  if (invincible) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.shadowColor = STAR_COLOR;
    ctx.shadowBlur = 30;
    ctx.strokeStyle = STAR_COLOR;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(w/2, h/2, w*0.54, h*0.44, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// Main draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw platforms
  for (const p of platforms) {
    if (p.visible === false) {
      drawVanishPlatform(p);
    } else {
      drawPlatform(p);
    }
  }

  // Draw power-ups
  for (const pu of powerUps) {
    if (pu.taken) continue;
    if (pu.type === 'mushroom') {
      drawMushroom(pu.x, pu.y);
    } else if (pu.type === 'star') {
      drawStar(ctx, pu.x+19, pu.y+19, 15, 5, 0.45);
    }
  }

  // Draw Bugatti Chiron player
  drawBugatti(player.x, player.y, player.w, player.h, player.invincible);

  // Draw score and status
  ctx.font = "22px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + player.score, 28, 34);
  if (player.big) ctx.fillText("Big!", 170, 34);
  if (player.invincible) ctx.fillText("Invincible!", 250, 34);
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();

// Colors
const PLATFORM_COLOR = "#34a853";
const PLATFORM_VANISH_COLOR = "#b2bec3";
const STAR_COLOR = "#FFD700";
const MUSHROOM_COLOR = "#C0392B";
