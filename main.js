(function() {
    const canvas = document.getElementById('bouncingBalls');
    const ctx = canvas.getContext('2d');
    let width, height;
    let balls = [];
    let mouse = {
        x: undefined,
        y: undefined,
        down: false,
        draggingBall: null
    };
    const MAX_BALLS = 50;
    const FRICTION = 0.99;
    let GRAVITY = 0.2;

    function init() {
        resizeCanvas();
        createBalls();
        animate();
        window.addEventListener('resize', resizeCanvas, false);
        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mousemove', onMouseMove, false);
        canvas.addEventListener('mouseup', onMouseUp, false);
        window.addEventListener('keydown', onKeyDown, false);
    }

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createBalls() {
        for (let i = 0; i < MAX_BALLS; i++) {
            const radius = random(10, 30);
            const x = random(radius, width - radius);
            const y = random(radius, height - radius);
            const dx = random(-2, 2);
            const dy = random(-2, 2);
            const color = randomColor();
            balls.push(new Ball(x, y, dx, dy, radius, color));
        }
    }

    function Ball(x, y, dx, dy, radius, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = radius;
        this.color = color;
        this.trail = [];
    }

    Ball.prototype.update = function() {
        if (this.x + this.radius > width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > height || this.y - this.radius < 0) {
            this.dy = -this.dy * FRICTION;
        } else {
            this.dy += GRAVITY;
        }

        this.x += this.dx;
        this.y += this.dy;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 25) this.trail.shift();

        this.draw();
    };

    Ball.prototype.draw = function() {
        for (let i = 0; i < this.trail.length; i++) {
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, this.radius * (i / this.trail.length), 0, 2 * Math.PI);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };

    Ball.prototype.isMouseOver = function() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    };

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randomColor() {
        const r = Math.floor(random(0, 256));
        const g = Math.floor(random(0, 256));
        const b = Math.floor(random(0, 256));
        return `rgba(${r}, ${g}, ${b}, 0.8)`;
    }

    function onMouseDown(event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.down = true;

        for (let ball of balls) {
            if (ball.isMouseOver()) {
                mouse.draggingBall = ball;
                break;
            }
        }
    }

    function onMouseMove(event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;

        if (mouse.down && mouse.draggingBall) {
            mouse.draggingBall.x = mouse.x;
            mouse.draggingBall.y = mouse.y;
            mouse.draggingBall.dx = 0;
            mouse.draggingBall.dy = 0;
        }
    }

    function onMouseUp(event) {
        mouse.down = false;
        mouse.draggingBall = null;
    }

    function onKeyDown(event) {
        if (event.key === 'ArrowUp') {
            GRAVITY += 0.1;
        } else if (event.key === 'ArrowDown') {
            GRAVITY = Math.max(0, GRAVITY - 0.1);
        }
    }

    function detectCollisions() {
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                const dx = balls[i].x - balls[j].x;
                const dy = balls[i].y - balls[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < balls[i].radius + balls[j].radius) {
                    // Simple collision response
                    balls[i].dx = -balls[i].dx;
                    balls[i].dy = -balls[i].dy;
                    balls[j].dx = -balls[j].dx;
                    balls[j].dy = -balls[j].dy;
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        balls.forEach(ball => ball.update());
        detectCollisions();
        requestAnimationFrame(animate);
    }

    init();
})();
