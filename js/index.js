import Paddle from './paddle_class/paddle_class.js';
import Ball from './ball_class/ball_class.js';
import Brick from './brick_class/brick_class.js';
import Wall from './wall_class/wall_class.js';

//HTML elements
const welcomeScreen = document.getElementById("welcomeScreen");
const start_btn = document.getElementById("startGame");
const pause_btn = document.getElementById("pause");
const restart_btn = document.getElementById("restart");
const scoreBoard = document.getElementById("score");

export const canvas = document.getElementById('game-canvas');
export const ctx = canvas.getContext('2d');

export let leftArrow = false;
export let rightArrow = false;
export let ballMoveAnimation;
export let ballMoveAnimation_paddle;
export let gameAnimation;


//Event Listeners
start_btn.addEventListener("click", startGame);

export const paddle = new Paddle(150, 20);
export const ball = new Ball();
const wall = new Wall(6, 8, 75, 25);
// console.log(wall);


//GameLogic Variables
let life;
let isStarted = false;
let gameRestart = false;
let score = 0;


function stopAnimation() {

    cancelAnimationFrame(gameAnimation);
    cancelAnimationFrame(ballMoveAnimation_paddle);
    cancelAnimationFrame(ballMoveAnimation);
}

function startGame() {
    welcomeScreen.style.display = 'none';

    ballMoveAnimation_paddle = requestAnimationFrame(moveBallOnPaddle);
    life = 3;
    start_btn.innerHTML = "START";
    ball.isMoving = false;
    score = 0;
    scoreBoard.value = score;
    loadEvents();
    tick();
    gameRestart = false;

}
// function restart() {

// }
function pause() {
    stopAnimation();
    pause_btn.classList.add("btn_active");
    pause_btn.removeEventListener('click', pause);
    pause_btn.addEventListener('click', resume);
    pause_btn.innerHTML = "RESUME";
}

function resume() {
    tick();
    ballMoveAnimation = requestAnimationFrame(moveBall);
    pause_btn.classList.remove("btn_active");
    pause_btn.addEventListener('click', pause);
    pause_btn.removeEventListener('click', resume);
    pause_btn.innerHTML = "PAUSE";
}

function gameOver() {
    cancelAnimationFrame(gameAnimation);
    welcomeScreen.style.display = 'flex';

    cancelAnimationFrame(ballMoveAnimation_paddle);
    cancelAnimationFrame(ballMoveAnimation);

    start_btn.innerHTML = "PLAY AGAIN";

}
function loadEvents() {

    pause_btn.addEventListener('click', pause);


    canvas.addEventListener("mousemove", function (event) {
        if (event.offsetX <= paddle.width / 2) {
            paddle.x = 0
        } else if (event.offsetX >= canvas.width - paddle.width / 2) {
            paddle.x = canvas.width - paddle.width;
        } else {
            paddle.x = event.offsetX - paddle.width / 2
        }
    });


    document.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") {
            leftArrow = true;
        } else if (event.key == "ArrowRight") {
            rightArrow = true;
        }
        if (event.key === " " && !ball.isMoving) {
            moveBall();
            ball.isMoving = true;
        }
    });
    document.addEventListener("keyup", function (event) {
        if (event.key === "ArrowLeft") {
            leftArrow = false;
        } else if (event.key == "ArrowRight") {
            rightArrow = false;
        }
    });

    canvas.addEventListener("click", function (event) {
        if (!ball.isMoving) {
            moveBall();
            ball.isMoving = true;
        }

    });


    restart_btn.addEventListener('click', () => {
        stopAnimation();
        gameRestart = true;
        startGame();
    });

}


function movePaddle() {
    if (rightArrow && paddle.x + paddle.width < canvas.width) {
        paddle.x += paddle.dx;
    } else if (leftArrow && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }
}

function moveBallOnPaddle() {

    ball.x = paddle.x + ball.radius + (paddle.width / 2);
    ball.y = paddle.y - ball.radius;
    ballMoveAnimation_paddle = requestAnimationFrame(moveBallOnPaddle);

}

function moveBall() {

    ball.x += ball.xStep;
    ball.y += ball.yStep;
    cancelAnimationFrame(ballMoveAnimation_paddle);
    ballMoveAnimation = requestAnimationFrame(moveBall);

}

function ballWallCollision() {
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.xStep = -ball.xStep;
    }

    if (ball.y - ball.radius < 0) {
        ball.yStep = - ball.yStep;
    }
    if (ball.y + ball.radius > canvas.height) {
        life--;
        ball.reset();
        moveBallOnPaddle();

    }

}

function ballPaddlleCollision() {
    if ((ball.y + ball.radius) > paddle.y &&
        (ball.y + ball.radius) < paddle.y + paddle.height &&
        (ball.x + ball.radius) > paddle.x &&
        (ball.x - ball.radius) < paddle.x + paddle.width) {
        let collidePoint = ball.x - (paddle.x + paddle.width / 2);
        collidePoint = collidePoint / (paddle.width / 2);
        let angle = collidePoint * (Math.PI / 3);
        ball.xStep = ball.speed * Math.sin(angle);
        ball.yStep = - ball.speed * Math.cos(angle);
    }
}


function collisionbrick() {
    for (let r = 0; r < wall.row; r++) {
        for (let c = 0; c < wall.column; c++) {
            var b = wall.bricks[r][c];

            if (b.status) {

                if (
                    ball.x - ball.radius < b.x + wall.width &&
                    ball.x + ball.radius > b.x &&
                    ball.y - ball.radius < b.y + wall.height &&
                    ball.y + ball.radius > b.y
                ) {
                    ball.yStep = - ball.yStep;
                    b.status = false;
                    score += 1;
                    scoreBoard.value = score;
                    //  wall.destroyBrick(b.x,b.y,b.status=false);
                    // wall.destroyBricks()
                    console.log(b.status)
                    console.log(score)

                }
            }
        }

    }

}

function checkLifes() {

    if (life === 0)
        return false;
    else
        return true;
}

function update() {
    movePaddle();
    ballWallCollision();
    ballPaddlleCollision();
    collisionbrick();
}
function drawGame() {
    paddle.draw();
    wall.createbrick();
    wall.drawbricks();
    ball.draw();

}

function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGame();
    update();
    gameAnimation = requestAnimationFrame(tick);
    if (!checkLifes()) {
        gameOver();
        return;
    }
    if (gameRestart) { return; }
}

//startGame();

