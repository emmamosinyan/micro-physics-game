var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var startBtn = document.querySelector(".startBtn");
var container = document.querySelector(".container");
var startModalEl = document.querySelector(".modalEl");
var restartBtn = document.querySelector(".restartBtn");
var clickText = document.querySelector(".clickTextContainer");
var gravity = 9.8;
document.getElementById("setGravityButton").addEventListener("click", function () {
    var gravityInput = document.getElementById("gravityInput");
    var gravityValue = gravityInput.value;
    var gravityNumber = +gravityValue;
    gravity = gravityNumber;
});
function resizeCanvas() {
    var container = document.querySelector(".container");
    var inputContainer = document.querySelector(".input-container");
    canvas.width = container.clientWidth;
    canvas.height = window.innerHeight - inputContainer.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
var balls = [];
var Ball = /** @class */ (function () {
    function Ball(x, y, radius, gravity) {
        this.x = x;
        this.y = y;
        this.velocityX = (Math.random() - 0.5) * 4;
        this.velocityY = 0;
        this.radius = radius;
        this.gravity = gravity;
        this.bounceFactor = 0.8;
        this.color = "hsl(".concat(Math.random() * 360, ", 90%, 50%)");
    }
    Ball.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };
    Ball.prototype.update = function (deltaTime) {
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
        }
        else if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.velocityX = -this.velocityX * this.bounceFactor;
        }
        if (Math.abs(this.velocityY) < 0.1) {
            this.velocityY = 0;
        }
    };
    return Ball;
}());
function draw(e) {
    var pos = getCursorPosition(canvas, e);
    var clickX = pos.x;
    var clickY = pos.y;
    var ball = new Ball(clickX, clickY, 25, gravity);
    if (balls.length === 15) {
        balls.shift();
    }
    balls.push(ball);
}
function getCursorPosition(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}
function resolveCollision(ball1, ball2) {
    var dx = ball2.x - ball1.x;
    var dy = ball2.y - ball1.y;
    var distance = Math.hypot(dx, dy);
    if (distance - ball1.radius - ball2.radius < 1) {
        var angle = Math.atan2(dy, dx);
        var sin = Math.sin(angle);
        var cos = Math.cos(angle);
        var vx1 = ball1.velocityX * cos + ball1.velocityY * sin;
        var vy1 = ball1.velocityY * cos - ball1.velocityX * sin;
        var vx2 = ball2.velocityX * cos + ball2.velocityY * sin;
        var vy2 = ball2.velocityY * cos - ball2.velocityX * sin;
        var v1Final = vx2;
        var v2Final = vx1;
        ball1.velocityX = v1Final * cos - vy1 * sin;
        ball1.velocityY = vy1 * cos + v1Final * sin;
        ball2.velocityX = v2Final * cos - vy2 * sin;
        ball2.velocityY = vy2 * cos + v2Final * sin;
        var overlap = ball1.radius + ball2.radius - distance;
        ball1.x -= (overlap / 2) * cos;
        ball1.y -= (overlap / 2) * sin;
        ball2.x += (overlap / 2) * cos;
        ball2.y += (overlap / 2) * sin;
    }
}
function checkCollisions() {
    for (var i = 0; i < balls.length; i++) {
        for (var j = i + 1; j < balls.length; j++) {
            resolveCollision(balls[i], balls[j]);
        }
    }
}
var lastTime = performance.now();
function tick(currentTime) {
    var deltaTime = (currentTime - lastTime) / 1000;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(function (ball) {
        ball.update(deltaTime);
        ball.draw();
    });
    checkCollisions();
    lastTime = currentTime;
    requestAnimationFrame(tick);
}
restartBtn.addEventListener("click", function () {
    balls = [];
    clickText.style.display = "block";
});
clickText.addEventListener("click", function () {
    clickText.style.display = "none";
});
startBtn.addEventListener("click", function () {
    canvas.addEventListener("click", draw);
    clickText.style.display = "block";
    requestAnimationFrame(tick);
    startModalEl.style.display = "none";
});
canvas.addEventListener("click", function () {
    clickText.style.display = "none";
});
