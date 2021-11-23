// Kan waarschijnlijk ook in css gedaan worden (is wel moeilijker dan dit dan), maar vind de canvas met js wel goed en handig werken en kan er goed mee om
const canvas = document.getElementById("animation-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const ballImg = document.createElement("img") as HTMLImageElement;
ballImg.src = "../img/magic/ball.png";
const pacmanOpenedImg = document.createElement("img");
pacmanOpenedImg.src = "../img/game/pac-man-opened.png";
const pacmanClosedImg = document.createElement("img");
pacmanClosedImg.src = "../img/game/pac-man-closed.png";

const ballSize = 20;
const ballDelay = 25;
const pacmanSize = 55;
const pacmanDelay = 250;
const animationDelay = 100;
const pacmanSpeed = 11;
const textSpeed = 10;
const textDelay = 400;
const animationIntervalTime = 20;


enum Direction {
    right, down, left, up
}

let direction: Direction = Direction.right;
let pacmanPos = {x: 45, y: 45}; // MIDDEN!!
let traveledSinceDot = 0;

let drawingInterval = null;
let textInterval = null;
let finished = false;

setTimeout(startPacMan, 200);

function startPacMan() {
    document.getElementById("font-loader").hidden = true;

    drawDotsOneByOne();

    // draw pacman
    setTimeout(() => {
        ctx.drawImage(pacmanOpenedImg, 45 - pacmanSize / 2, 45 - pacmanSize / 2, pacmanSize, pacmanSize);

        setTimeout(() => drawingInterval = setInterval(() => ballAnimation() == "finished" ? (function () {
            clearInterval(drawingInterval);
            textInterval = setTimeout(() => setInterval(() => drawText() == "finished" ? clearInterval(textInterval) : null, animationIntervalTime), textDelay);
        })() : null, animationIntervalTime), animationDelay);
    }, ballDelay * 25 + pacmanDelay);
}

function drawDotsOneByOne() {
    for (let i = 0; i < 9; i++) {
        setTimeout(() => {
            ctx.drawImage(ballImg, 90 * i + 135 - ballSize / 2, 45 - ballSize / 2, ballSize, ballSize);
        }, i * ballDelay);
    }

    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            ctx.drawImage(ballImg, 855 - ballSize / 2, 90 * i + 135 - ballSize / 2, ballSize, ballSize);
        }, i * ballDelay + 9 * ballDelay);
    }

    for (let i = 0; i < 9; i++) {
        setTimeout(() => {
            ctx.drawImage(ballImg, 765 - 90 * i - ballSize / 2, 405 - ballSize / 2, ballSize, ballSize);
        }, i * ballDelay + 13 * ballDelay);
    }

    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            ctx.drawImage(ballImg, 45 - ballSize / 2, 315 - 90 * i - ballSize / 2, ballSize, ballSize);
        }, i * ballDelay + 22 * ballDelay);
    }
}

function ballAnimation() {
    ctx.clearRect(pacmanPos.x - pacmanSize / 2, pacmanPos.y - pacmanSize / 2, pacmanSize, pacmanSize);
    
    ctx.save();
    let degrees = 0;
    let scale = [1, 1];
    if (direction == Direction.right) {
        pacmanPos.x += pacmanSpeed;
        if (pacmanPos.x >= 855) {
            pacmanPos.x = 855;
            direction = Direction.down;
        }
    }
    else if (direction == Direction.down) {
        pacmanPos.y += pacmanSpeed;
        degrees = 90;
        if (pacmanPos.y >= 405) {
            pacmanPos.y = 405;
            direction = Direction.left;
        }
    }
    else if (direction == Direction.left) {
        pacmanPos.x -= pacmanSpeed;
        degrees = 0;
        scale = [-1, 1];
        if (pacmanPos.x <= 45) {
            pacmanPos.x = 45;
            direction = Direction.up;
        }
    }
    else if (direction == Direction.up) {
        pacmanPos.y -= pacmanSpeed;
        degrees = 270;
        scale = [1, -1];
        if (pacmanPos.y <= 45) {
            pacmanPos.y = 45;
        }
    }
    ctx.translate(pacmanPos.x, pacmanPos.y);
    ctx.rotate(degrees * Math.PI / 180);
    ctx.scale(scale[0], scale[1]);
    
    if (traveledSinceDot >= 80 || traveledSinceDot <= 10) ctx.drawImage(pacmanClosedImg, -pacmanSize / 2, -pacmanSize / 2, pacmanSize, pacmanSize);
    else ctx.drawImage(pacmanOpenedImg, -pacmanSize / 2, -pacmanSize / 2, pacmanSize, pacmanSize);

    ctx.restore();

    if (traveledSinceDot >= 90) traveledSinceDot = 0;
    traveledSinceDot += pacmanSpeed;

    if (direction == Direction.up && pacmanPos.y == 45) {
        direction = Direction.right;
        ctx.clearRect(pacmanPos.x - pacmanSize / 2, pacmanPos.y - pacmanSize / 2, pacmanSize, pacmanSize);
        ctx.drawImage(pacmanClosedImg, 45 - pacmanSize / 2, 45 - pacmanSize / 2, pacmanSize, pacmanSize);
        return "finished";
    }
}

const totalText = ["Flappy", "Pac-Man"]

function drawText() {
    ctx.clearRect(0, 0, canvas.width, canvas.width);
    pacmanPos.x += textSpeed / 2;
    ctx.drawImage(pacmanClosedImg, pacmanPos.x - pacmanSize / 2, pacmanPos.y - pacmanSize / 2, pacmanSize, pacmanSize);
    
    let textAmount = Math.round((pacmanPos.x - 45) / 405 * 13);
    ctx.font = "195px pacman-font";
    ctx.textAlign = "left";
    if (textAmount < totalText[0].length) {
        ctx.fillStyle = "blue";
        ctx.fillText(totalText[0].substr(0, textAmount), canvas.width / 2 - ctx.measureText("Flappy").width / 2, 220);
    }
    else {
        ctx.fillStyle = "blue";
        ctx.fillText(totalText[0], canvas.width / 2 - ctx.measureText("Flappy").width / 2, 220);
        ctx.fillStyle = "yellow";
        ctx.fillText(totalText[1].substr(0, textAmount - totalText[0].length), canvas.width / 2 - ctx.measureText("Pac-Man").width / 2, 400);
    }

    if (pacmanPos.x >= 450) {
        ctx.clearRect(0, 0, canvas.width, canvas.width);
        
        pacmanPos.x = 450;
        ctx.drawImage(pacmanOpenedImg, pacmanPos.x - pacmanSize / 2, pacmanPos.y - pacmanSize / 2, pacmanSize, pacmanSize);

        ctx.fillStyle = "blue";
        ctx.fillText("Flappy", canvas.width / 2 - ctx.measureText("Flappy").width / 2, 220);
        ctx.fillStyle = "yellow";
        ctx.fillText("Pac-Man", canvas.width / 2 - ctx.measureText("Pac-Man").width / 2, 400);
        ctx.font = "40px pacman-font";
        ctx.textAlign = "center";
        ctx.fillText("*Click*", canvas.width / 2, 445);

        finished = true;
        return "finished";
    }
}


function toGame() {
    if (finished) {
        ctx.clearRect(0, 0, canvas.width, canvas.width);
    }

    location.href = "./game.html";
}