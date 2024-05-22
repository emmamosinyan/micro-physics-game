const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const startBtn = document.querySelector(".startBtn") as HTMLButtonElement;
const container = document.querySelector(".container") as HTMLElement;
const startModalEl = document.querySelector(".modalEl") as HTMLElement;
const restartBtn = document.querySelector(".restartBtn") as HTMLButtonElement;
const clickText = document.querySelector(".clickTextContainer") as HTMLElement;

let gravity = 9.8;
document.getElementById("setGravityButton")!.addEventListener("click", () => {
  const gravityInput = document.getElementById(
    "gravityInput"
  ) as HTMLInputElement;
  const gravityValue = gravityInput.value;
  const gravityNumber: number = +gravityValue;
  gravity = gravityNumber;
});

function resizeCanvas() {
  const container = document.querySelector(".container");
  const inputContainer = document.querySelector(".input-container");
  canvas.width = container.clientWidth;
  canvas.height = window.innerHeight - inputContainer.clientHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

let balls: Ball[] = [];

class Ball {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  gravity: number;
  bounceFactor: number;
  color: string;

  constructor(x: number, y: number, radius: number, gravity: number) {
    this.x = x;
    this.y = y;
    this.velocityX = (Math.random() - 0.5) * 4;
    this.velocityY = 0;
    this.radius = radius;
    this.gravity = gravity;
    this.bounceFactor = 0.8;
    this.color = `hsl(${Math.random() * 360}, 90%, 50%)`;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  update(deltaTime: number) {
    this.velocityY += this.gravity * deltaTime;
    this.x += this.velocityX;
    this.y += this.velocityY;

    if (this.y + this.radius >= canvas.height) {
      this.y = canvas.height - this.radius;
      this.velocityY = -Math.abs(this.velocityY) * this.bounceFactor;
    }

    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.velocityX = -this.velocityX * this.bounceFactor;
    } else if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.velocityX = -this.velocityX * this.bounceFactor;
    }

    if (Math.abs(this.velocityY) < 0.1) {
      this.velocityY = 0;
    }
  }
}

function draw(e: MouseEvent): void {
  const pos: Position = getCursorPosition(canvas, e);
  const clickX: number = pos.x;
  const clickY: number = pos.y;

  const ball = new Ball(clickX, clickY, 25, gravity);
  if (balls.length === 15) {
    balls.shift();
  }
  balls.push(ball);
}

interface Position {
  x: number;
  y: number;
}

function getCursorPosition(canvas: HTMLCanvasElement, e: MouseEvent): Position {
  const rect: DOMRect = canvas.getBoundingClientRect();

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function resolveCollision(ball1: Ball, ball2: Ball) {
  const dx = ball2.x - ball1.x;
  const dy = ball2.y - ball1.y;
  const distance = Math.hypot(dx, dy);

  if (distance - ball1.radius - ball2.radius < 1) {
    const angle = Math.atan2(dy, dx);
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    const vx1 = ball1.velocityX * cos + ball1.velocityY * sin;
    const vy1 = ball1.velocityY * cos - ball1.velocityX * sin;

    const vx2 = ball2.velocityX * cos + ball2.velocityY * sin;
    const vy2 = ball2.velocityY * cos - ball2.velocityX * sin;

    const v1Final = vx2;
    const v2Final = vx1;

    ball1.velocityX = v1Final * cos - vy1 * sin;
    ball1.velocityY = vy1 * cos + v1Final * sin;
    ball2.velocityX = v2Final * cos - vy2 * sin;
    ball2.velocityY = vy2 * cos + v2Final * sin;

    const overlap = ball1.radius + ball2.radius - distance;
    ball1.x -= (overlap / 2) * cos;
    ball1.y -= (overlap / 2) * sin;
    ball2.x += (overlap / 2) * cos;
    ball2.y += (overlap / 2) * sin;
  }
}

function checkCollisions() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      resolveCollision(balls[i], balls[j]);
    }
  }
}

let lastTime: number = performance.now();

function tick(currentTime: number) {
  const deltaTime: number = (currentTime - lastTime) / 1000;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  balls.forEach((ball) => {
    ball.update(deltaTime);
    ball.draw();
  });

  checkCollisions();
  lastTime = currentTime;

  requestAnimationFrame(tick);
}

restartBtn.addEventListener("click", () => {
  balls = [];
  clickText.style.display = "block";
});

clickText.addEventListener("click", () => {
  clickText.style.display = "none";
});

startBtn.addEventListener("click", () => {
  canvas.addEventListener("click", draw);
  clickText.style.display = "block";
  requestAnimationFrame(tick);
  startModalEl.style.display = "none";
});

canvas.addEventListener("click", () => {
  clickText.style.display = "none";
});
