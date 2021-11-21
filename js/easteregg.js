if (window.innerHeight < 949 || window.innerWidth < 800)
    alert("Zoom uit voor de beste ervaring!");
const gravity = 1;
const maxDownwardsAcceleration = 25;
const jumpForce = -14;
const speed = 4;
const initialPipeDelay = 150; // in frames
const pipeDelayDecline = 2; // decline of delay between pipes every spawned pipe
const minPipeDelay = 50;
const pipeLength = 258; // in px on png
const pipeGap = 84; // in px on png
const playerXPos = 100;
const maxUpRot = 45;
const maxDownRot = 55;
let highScore = Number(localStorage.getItem("high-score")) || 0;
let highScoreIncreased = false;
const playerOpenedImg = document.createElement("img");
playerOpenedImg.src = "../img/game/pac-man-opened.png";
const playerClosedImg = document.createElement("img");
playerClosedImg.src = "../img/game/pac-man-closed.png";
const backgroundImg = document.createElement("img");
backgroundImg.src = "../img/game/background.png";
const pipesWithBallImg = document.createElement("img");
pipesWithBallImg.src = "../img/game/pipes-with-ball.png";
const pipesImg = document.createElement("img");
pipesImg.src = "../img/game/pipes.png";
const nomSounds = [new Audio("../audio/nom/nomnom-hoog.m4a")];
class Sprite {
    constructor(width, height, img) {
        this.width = 0;
        this.height = 0;
        this.width = width;
        this.height = height;
        this.img = img;
    }
}
class PositionSprite {
    constructor(sprite, xStartingPos, yStartingPos = 0) {
        this.xPosition = 0;
        this.yPosition = 0;
        this.sprite = null;
        this.gaveScore = false; // ONLY FOR PIPES, te lui om extra class te maken ;)
        this.sprite = sprite;
        this.xPosition = xStartingPos;
        this.yPosition = yStartingPos;
    }
}
let gameMaster = {
    canvas: document.getElementById("gamecanvas"),
    ctx: null,
    playerPos: 360,
    playerRot: 0,
    player: new Sprite(50, 50, playerOpenedImg),
    backgrounds: [],
    pipes: [],
    died: false,
    started: false,
    score: 0,
    jumped: false,
    moving: true,
    acceleration: 0,
    framesSincePipeSpawn: 0,
    pipeDelay: initialPipeDelay,
    initiate: function () {
        this.canvas.width = 800;
        this.canvas.height = 800;
        this.ctx = this.canvas.getContext("2d");
        for (let i = 0; i < 3; i++) {
            this.backgrounds[i] = new PositionSprite(new Sprite(456, 800, backgroundImg), 0 + i * 456); // original ratio: 144x254
        }
    },
    start: function () {
        this.started = true;
    },
    reset: function () {
        this.playerPos = 360;
        this.playerRot = 0;
        this.died = false;
        this.jumped = false;
        this.moving = true;
        this.acceleration = 0;
        this.score = 0;
        this.pipes = [];
        this.pipeDelay = initialPipeDelay;
        highScoreIncreased = false;
    },
    die: function () {
        this.died = true;
        this.started = false;
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};
document.body.onkeydown = e => {
    if (e.key == " ") {
        if (gameMaster.died)
            gameMaster.reset();
        else if (!gameMaster.started)
            gameMaster.start();
        if (!gameMaster.jumped && !gameMaster.died && gameMaster.moving) {
            gameMaster.jumped = true;
            gameMaster.acceleration = jumpForce;
        }
    }
};
document.body.onkeyup = e => {
    if (e.key == " " && gameMaster.jumped && !gameMaster.died) {
        gameMaster.jumped = false;
    }
};
function update() {
    // check if died
    if (gameMaster.playerPos > 749) {
        gameMaster.playerPos = 750;
        gameMaster.die();
    }
    // move player
    if (!gameMaster.died && gameMaster.started) {
        if (gameMaster.acceleration < maxDownwardsAcceleration)
            gameMaster.acceleration += gravity;
        gameMaster.playerPos += gameMaster.acceleration;
    }
    // check pipe spawner + score
    if (gameMaster.started && !gameMaster.died && gameMaster.moving) {
        moveBackgrounds();
        movePipes();
        checkPipeCollision();
    }
    // clear canvas
    gameMaster.ctx.clearRect(0, 0, 800, 800);
    // draw
    drawBackgrounds();
    drawPipes();
    drawPlayer();
    drawUI();
    gameMaster.framesSincePipeSpawn += 1;
}
function moveBackgrounds() {
    gameMaster.backgrounds.forEach(bg => {
        bg.xPosition -= speed;
        if (bg.xPosition <= -454)
            bg.xPosition = 908;
    });
}
function movePipes() {
    // check for new pipe
    if (gameMaster.framesSincePipeSpawn >= gameMaster.pipeDelay) {
        gameMaster.framesSincePipeSpawn = 0;
        if (gameMaster.pipeDelay > minPipeDelay)
            gameMaster.pipeDelay -= pipeDelayDecline;
        const yPos = (-pipeLength * 2) + 120 + Math.floor(Math.random() * (560 - (pipeGap * 2)));
        gameMaster.pipes.push(new PositionSprite(new Sprite(110, 1200, pipesWithBallImg), 800, yPos)); // original size: 26x600, so *2
    }
    // move pipes
    let indexToDelete = null;
    gameMaster.pipes.forEach((pipe, index) => {
        pipe.xPosition -= speed;
        if (pipe.xPosition <= playerXPos - 52 && !pipe.gaveScore) { // give score
            nomSounds[0].play();
            gameMaster.score += 1;
            pipe.gaveScore = true;
            pipe.sprite.img = pipesImg;
            pipe.sprite.width = 52;
            gameMaster.player.img = playerClosedImg;
            setTimeout(() => {
                gameMaster.player.img = playerOpenedImg;
            }, 500);
            // check highscore
            if (gameMaster.score > highScore) {
                highScore = gameMaster.score;
                localStorage.setItem("high-score", highScore.toString());
                highScoreIncreased = true;
            }
        }
        if (pipe.xPosition <= -pipe.sprite.width)
            indexToDelete = index;
    });
    if (indexToDelete != null)
        gameMaster.pipes.splice(indexToDelete, 1);
}
function checkPipeCollision() {
    // first pipe in the array is always the only pipe able to collide (with min delay = 50), which makes this easier :D
    if (gameMaster.pipes.length == 0)
        return;
    let pipe = gameMaster.pipes[0];
    if (pipe.xPosition < playerXPos + gameMaster.player.width - 2 /*looks better with the -2*/ && pipe.xPosition > playerXPos - gameMaster.player.width) {
        let pipeGapStart = pipe.yPosition + (2 * pipeLength); // TOP of gap
        if (gameMaster.playerPos < pipeGapStart || gameMaster.playerPos + gameMaster.player.height > pipeGapStart + pipeGap * 2)
            gameMaster.moving = false; // hit pipe
    }
}
function drawBackgrounds() {
    gameMaster.backgrounds.forEach(bg => {
        gameMaster.ctx.drawImage(bg.sprite.img, bg.xPosition, 0, bg.sprite.width, bg.sprite.height);
    });
}
function drawPlayer() {
    if (!gameMaster.started && !gameMaster.died)
        return gameMaster.ctx.drawImage(gameMaster.player.img, playerXPos, gameMaster.playerPos, gameMaster.player.width, gameMaster.player.height);
    // rotate player with acceleration
    if (gameMaster.acceleration < 0)
        gameMaster.playerRot = -gameMaster.acceleration / jumpForce * maxUpRot;
    else if (gameMaster.acceleration >= 0)
        gameMaster.playerRot = gameMaster.acceleration / maxDownwardsAcceleration * maxDownRot;
    gameMaster.ctx.save();
    gameMaster.ctx.translate(playerXPos + gameMaster.player.width / 2, gameMaster.playerPos + gameMaster.player.height / 2);
    gameMaster.ctx.rotate(gameMaster.playerRot * Math.PI / 180); // must be radians
    gameMaster.ctx.drawImage(gameMaster.player.img, -gameMaster.player.width / 2, -gameMaster.player.height / 2, gameMaster.player.width, gameMaster.player.height);
    gameMaster.ctx.restore();
}
function drawPipes() {
    gameMaster.pipes.forEach(pipe => {
        gameMaster.ctx.drawImage(pipe.sprite.img, pipe.xPosition, pipe.yPosition, pipe.sprite.width, pipe.sprite.height);
    });
}
function drawUI() {
    gameMaster.ctx.font = "40px Roboto";
    gameMaster.ctx.fillText(gameMaster.score.toString(), 400 - gameMaster.ctx.measureText(gameMaster.score.toString()).width / 2, 50);
    if (!gameMaster.died && !gameMaster.started)
        gameMaster.ctx.fillText("Press space to start!", 400 - gameMaster.ctx.measureText("Press space to start!").width / 2, 400);
    else if (gameMaster.died && !gameMaster.started) {
        if (highScoreIncreased) {
            gameMaster.ctx.fillText("New high score!", 400 - gameMaster.ctx.measureText("New high score!").width / 2, 340);
            gameMaster.ctx.fillText("Press space to reset.", 400 - gameMaster.ctx.measureText("Press space to reset.").width / 2, 400);
        }
        else
            gameMaster.ctx.fillText("Press space to reset!", 400 - gameMaster.ctx.measureText("Press space to reset!").width / 2, 400);
    }
    gameMaster.ctx.font = "20px Arial";
    gameMaster.ctx.fillText("High Score: " + highScore.toString(), 10, 35); // upper left corner
}
gameMaster.initiate();
this.updateIntervalID = setInterval(update, 20);
//# sourceMappingURL=easteregg.js.map