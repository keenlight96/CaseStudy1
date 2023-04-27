let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let imgBackground = document.getElementById("background");
let enemies = [];
let imgTank = [];
imgTank[0] = document.getElementById("tankUp");
imgTank[1] = document.getElementById("tankDown");
imgTank[2] = document.getElementById("tankLeft");
imgTank[3] = document.getElementById("tankRight");
let imgTankEnemy = [];
imgTankEnemy[0] = document.getElementById("tankEnemyUp");
imgTankEnemy[1] = document.getElementById("tankEnemyDown");
imgTankEnemy[2] = document.getElementById("tankEnemyLeft");
imgTankEnemy[3] = document.getElementById("tankEnemyRight");
let imgBullet = [];
imgBullet[0] = document.getElementById("bulletUp");
imgBullet[1] = document.getElementById("bulletDown");
imgBullet[2] = document.getElementById("bulletLeft");
imgBullet[3] = document.getElementById("bulletRight");
let imgUnbreakable = document.getElementById("unbreakable");

// Game mode
let globalMode = "EASY";
globalMode = localStorage.getItem("gameMode");
console.log(globalMode);
//
let globalWidth = 800;
let globalHeight = 650;

class TankPlayer {
    name;
    speed;
    bulletSpeed;
    fullHeath;
    currentHealth;
    isAlive = true;
    direction;
    bullet;
    isBullet = false;
    imgSrc;
    imgChoose;
    x = 250;
    y = 550;
    enemies;

    constructor(name, speed, bulletSpeed, fullHealth, imgSrc, enemies) {
        this.name = name;
        this.speed = speed;
        this.bulletSpeed = bulletSpeed;
        this.fullHeath = fullHealth;
        this.currentHealth = this.fullHeath;
        this.imgSrc = imgSrc;
        this.enemies = enemies;
    }

    start() {
        this.imgChoose = this.imgSrc[0];
        this.direction = "up";
    }

    draw() {
        // draw Enemies Tank
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].isAlive)
                this.enemies[i].draw();
        }
        // draw Player Tank
        if (this.isAlive) {
            ctx.drawImage(this.imgChoose, this.x, this.y);
            ctx.beginPath();
            ctx.rect(this.x, this.y - 10, 50 / this.fullHeath * this.currentHealth, 5);
            ctx.fillStyle = "green";
            ctx.fill();
        }
    }

    move() {
        clear();
        if (keyState["ArrowUp"] && this.y > 0) { // arrow up
            this.imgChoose = this.imgSrc[0];
            this.direction = "up";
            if (checkNotOverlapTank(this.x, this.y - this.speed)) {
                this.y -= this.speed;
            }
        } else if (keyState["ArrowDown"] && this.y + 50 < canvas.height) { // arrow down
            this.imgChoose = this.imgSrc[1];
            this.direction = "down";
            if (checkNotOverlapTank(this.x, this.y + this.speed)) {
                this.y += this.speed;
            }
        } else if (keyState["ArrowLeft"] && this.x > 0) { // arrow left
            this.imgChoose = this.imgSrc[2];
            this.direction = "left";
            if (checkNotOverlapTank(this.x - this.speed, this.y)) {
                this.x -= this.speed;
            }
        } else if (keyState["ArrowRight"] && this.x + 50 < canvas.width) { // arrow right
            this.imgChoose = this.imgSrc[3];
            this.direction = "right";
            if (checkNotOverlapTank(this.x + this.speed, this.y)) {
                this.x += this.speed;
            }
        }
        this.draw();
    }

    fire() {
        if ((event.key === " ") && !this.isBullet && this.isAlive) {
            if (this.direction === "up") this.bullet = new Bullet(this.x + 20, this.y, this.bulletSpeed, this.direction, this, imgBullet);
            else if (this.direction === "down") this.bullet = new Bullet(this.x + 20, this.y + 31, this.bulletSpeed, this.direction, this, imgBullet);
            else if (this.direction === "left") this.bullet = new Bullet(this.x, this.y + 20, this.bulletSpeed, this.direction, this, imgBullet);
            else if (this.direction === "right") this.bullet = new Bullet(this.x + 31, this.y + 20, this.bulletSpeed, this.direction, this, imgBullet);
            this.bullet.start();
            this.bullet.draw();
            this.bullet.isHit = false;
            this.isBullet = true;
        }

    }
}

class TankEnemy {
    name;
    speed;
    bulletSpeed;
    fullHeath;
    currentHealth;
    isAlive = true;
    direction = "down";
    bullet;
    isBullet = false;
    player;
    imgSrc;
    imgChoose;
    x;
    y;
    nextMove;
    countNextMove = 0;
    isApproaching = 0;

    constructor(name, x, y, speed, bulletSpeed, fullHeath, imgSrc, player) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.bulletSpeed = bulletSpeed;
        this.fullHeath = fullHeath;
        this.currentHealth = this.fullHeath;
        this.imgSrc = imgSrc;
        this.player = player;
    }

    start() {
        this.imgChoose = this.imgSrc[1];
    }

    draw() {
        if (this.isAlive) {
            ctx.drawImage(this.imgChoose, this.x, this.y);
            ctx.beginPath();
            ctx.rect(this.x, this.y - 10, 50 / this.fullHeath * this.currentHealth, 5);
            ctx.fillStyle = "red";
            ctx.fill()
        }
    }

    // Enemy moving
    move() {
        if (!this.countNextMove) {
            this.countNextMove = Math.floor(Math.random() * 7 + 1);
            // EASY AND MEDIUM MODE: won't approach player, isApproaching is always equal 0
            // HARD MODE
            if (globalMode === "HARD") {
                this.isApproaching = Math.floor(Math.random() * 2); // Ngẫu nhiên việc có tiến gần vào player ko
            }
            if (!this.isApproaching) {
                this.nextMove = Math.floor(Math.random() * 4);
            } else {
                let deltaX = (this.x + 25) - (this.player.x + 25);
                let deltaY = (this.y + 25) - (this.player.y + 25);
                if (deltaX > 0) {
                    if (deltaY > 0) {
                        if (Math.abs(deltaY) > Math.abs(deltaX)) this.nextMove = 0;
                        else this.nextMove = 2;
                    } else {
                        if (Math.abs(deltaY) > Math.abs(deltaX)) this.nextMove = 1;
                        else this.nextMove = 2;
                    }
                } else {
                    if (deltaY > 0) {
                        if (Math.abs(deltaY) > Math.abs(deltaX)) this.nextMove = 0;
                        else this.nextMove = 3;
                    } else {
                        if (Math.abs(deltaY) > Math.abs(deltaX)) this.nextMove = 1;
                        else this.nextMove = 3;
                    }
                }
            }
        }
        if (this.countNextMove) {
            if (this.nextMove === 0) {
                if (this.y > 0) {
                    this.direction = "up";
                    this.imgChoose = this.imgSrc[0];
                    if (checkNotOverlapTank(this.x, this.y - this.speed)) {
                        this.y -= this.speed;
                        this.countNextMove--;
                    } else this.countNextMove = 0;

                } else this.countNextMove = 0;
            }
            if (this.nextMove === 1) {
                if (this.y + 50 < canvas.height) {
                    this.direction = "down";
                    this.imgChoose = this.imgSrc[1];
                    if (checkNotOverlapTank(this.x, this.y + this.speed)) {
                        this.y += this.speed;
                        this.countNextMove--;
                    } else this.countNextMove = 0;
                } else this.countNextMove = 0;
            }
            if (this.nextMove === 2) {
                if (this.x > 0) {
                    this.direction = "left";
                    this.imgChoose = this.imgSrc[2];
                    if (checkNotOverlapTank(this.x - this.speed, this.y)) {
                        this.x -= this.speed;
                        this.countNextMove--;
                    } else this.countNextMove = 0;
                } else this.countNextMove = 0;
            }
            if (this.nextMove === 3) {
                if (this.x + 50 < canvas.width) {
                    this.direction = "right";
                    this.imgChoose = this.imgSrc[3];
                    if (checkNotOverlapTank(this.x + this.speed, this.y)) {
                        this.x += this.speed;
                        this.countNextMove--;
                    } else this.countNextMove = 0;
                } else this.countNextMove = 0;
            }
        }
        this.player.draw();
    }

    // Enemy firing
    fire() {

        if ((!this.isBullet) && (this.isAlive)) {
            // EASY MODE
            if (globalMode === "EASY") {
                if (this.direction === "up") this.bullet = new Bullet(this.x + 20, this.y, this.bulletSpeed, this.direction, this, imgBullet);
                else if (this.direction === "down") this.bullet = new Bullet(this.x + 20, this.y + 31, this.bulletSpeed, this.direction, this, imgBullet);
                else if (this.direction === "left") this.bullet = new Bullet(this.x, this.y + 20, this.bulletSpeed, this.direction, this, imgBullet);
                else if (this.direction === "right") this.bullet = new Bullet(this.x + 31, this.y + 20, this.bulletSpeed, this.direction, this, imgBullet);
                this.isBullet = true;
            } else {
                // MEDIUM AND HARD MODE
                if ((this.x + 25 > this.player.x) && (this.x + 25 < this.player.x + 50)) {
                    if (this.y > this.player.y) {
                        this.direction = "up";
                        if (!checkScopeBLocked(this.x + 25, this.y + 25, this.direction)) {
                            this.bullet = new Bullet(this.x + 20, this.y, this.bulletSpeed, this.direction, this, imgBullet);
                            this.isBullet = true;
                        }
                    } else {
                        this.direction = "down";
                        if (!checkScopeBLocked(this.x + 25, this.y + 25, this.direction)) {
                            this.bullet = new Bullet(this.x + 20, this.y + 31, this.bulletSpeed, this.direction, this, imgBullet);
                            this.isBullet = true;
                        }
                    }
                }
                if ((this.y + 25 > this.player.y) && (this.y + 25 < this.player.y + 50)) {
                    if (this.x > this.player.x) {
                        this.direction = "left";
                        if (!checkScopeBLocked(this.x + 25, this.y + 25, this.direction)) {
                            this.bullet = new Bullet(this.x, this.y + 20, this.bulletSpeed, this.direction, this, imgBullet);
                            this.isBullet = true;
                        }
                    } else {
                        this.direction = "right";
                        if (!checkScopeBLocked(this.x + 25, this.y + 25, this.direction)) {
                            this.bullet = new Bullet(this.x + 31, this.y + 20, this.bulletSpeed, this.direction, this, imgBullet);
                            this.isBullet = true;
                        }
                    }
                }
            }
            // Start draw and fire when bullet is generated
            if (this.isBullet) {
                this.bullet.start();
                this.bullet.draw();
                this.bullet.isHit = false;
            }
        }

    }
}

class Bullet {
    x;
    y;
    speed;
    direction;
    isHit = false;
    owner;
    imgSrc;
    imgChoose;

    constructor(x, y, speed, direction, owner, imgSrc) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.direction = direction;
        this.owner = owner;
        this.imgSrc = imgSrc;

    }

    start() {
        if (this.direction === "up") this.imgChoose = this.imgSrc[0];
        else if (this.direction === "down") this.imgChoose = this.imgSrc[1];
        else if (this.direction === "left") this.imgChoose = this.imgSrc[2];
        else if (this.direction === "right") this.imgChoose = this.imgSrc[3];
    }

    draw() {
        if (this.direction === "up") ctx.drawImage(this.imgChoose, this.x, this.y);
        else if (this.direction === "down") ctx.drawImage(this.imgChoose, this.x, this.y);
        else if (this.direction === "left") ctx.drawImage(this.imgChoose, this.x, this.y);
        else if (this.direction === "right") ctx.drawImage(this.imgChoose, this.x, this.y);
    }

    movePlayer() {
        this.owner.draw();
        if ((this.direction === "up")) this.y -= this.speed;
        if (this.direction === "down") this.y += this.speed;
        if (this.direction === "left") this.x -= this.speed;
        if (this.direction === "right") this.x += this.speed;
        this.draw();
        // Check hit enemy
        for (let i = 0; i < this.owner.enemies.length; i++) {
            if ((this.x >= this.owner.enemies[i].x) && (this.x < this.owner.enemies[i].x + 50)
                && (this.y >= this.owner.enemies[i].y) && (this.y < this.owner.enemies[i].y + 50)
                && this.owner.enemies[i].isAlive) {
                this.owner.enemies[i].currentHealth--;
                if (this.owner.enemies[i].currentHealth === 0) {
                    this.owner.enemies[i].isAlive = false;
                }
                this.isHit = true;
            }
        }
        // Check hit unbreakable objects
        if (!checkNotOverlapBullet(this.x, this.y, this.direction)) {
            this.isHit = true;
        }
        // Check if hit or outside box
        if ((this.y < -50) || (this.x < -50) || (this.y > canvas.height + 50) || (this.x > canvas.width + 50) || (this.isHit)) {
            this.owner.isBullet = false;
        }
    }

    moveEnemies() {
        // clear();
        this.owner.player.draw();
        if ((this.direction === "up")) this.y -= this.speed;
        else if (this.direction === "down") this.y += this.speed;
        else if (this.direction === "left") this.x -= this.speed;
        else if (this.direction === "right") this.x += this.speed;
        this.draw();
        // Check hit player
        if ((this.x >= this.owner.player.x) && (this.x < this.owner.player.x + 50)
            && (this.y >= this.owner.player.y) && (this.y < this.owner.player.y + 50)
            && this.owner.player.isAlive) {
            this.owner.player.currentHealth--;
            if (this.owner.player.currentHealth === 0) {
                this.owner.player.isAlive = false;
                endGame("defeat");
            }
            this.isHit = true;
        }
        // Check hit unbreakable objects
        if (!checkNotOverlapBullet(this.x, this.y, this.direction)) {
            this.isHit = true;
        }
        // Check if hit or outside box
        if ((this.y < -50) || (this.x < -50) || (this.y > canvas.height + 50) || (this.x > canvas.width + 50) || (this.isHit)) {
            this.owner.isBullet = false;
        }
    }

}

// New class: Unbreakable Objects
class Unbreakable {
    // x;
    // y;
    imgSrc;
    arr;

    constructor(imgSrc) {
        // this.x = x;
        // this.y = y;
        this.imgSrc = imgSrc;
    }

    start() {
        this.arr = new Array(globalHeight / 50);
        for (let i = 0; i < this.arr.length; i++) {
            this.arr[i] = new Array(globalWidth / 50);
        }
        for (let i = 0; i < this.arr.length; i++) {
            for (let j = 0; j < this.arr[i].length; j++) {
                this.arr[i][j] = 0;
            }

        }
        // add initial position of player and enemies
        this.arr[550 / 50][250 / 50] = 2;
        this.arr[100 / 50][400 / 50] = 2;
        this.arr[100 / 50][100 / 50] = 2;
        this.arr[100 / 50][650 / 50] = 2;
        //
        let countRemain = 15;
        let chk;
        while (countRemain > 0) {
            let getX = Math.floor(Math.random() * (globalWidth / 50));
            let getY = Math.floor(Math.random() * (globalHeight / 50));
            chk = true;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if ((getY + i >= 0) && (getX + j >= 0) && (getY + i < globalHeight / 50) && (getX + j < globalWidth / 50)) {
                        if ((this.arr[getY + i][getX + j] === 1) || this.arr[getY + i][getX + j] === 2) {
                            chk = false;
                            break;
                        }
                    }
                }
                if (!chk) break;
            }
            if (chk) {
                this.arr[getY][getX] = 1;
                countRemain--;
            }
        }
    }

    draw() {
        for (let i = 0; i < this.arr.length; i++) {
            for (let j = 0; j < this.arr[i].length; j++) {
                if (this.arr[i][j] === 1) {
                    ctx.drawImage(this.imgSrc, j * 50, i * 50);
                }
            }
        }

    }
}

let player = new TankPlayer("Long", 5, 15, 3, imgTank, enemies);
player.start();
player.draw();
let enemiesBulletSpeed;
if (globalMode === "EASY") enemiesBulletSpeed = 10;
else enemiesBulletSpeed = 15;
enemies[0] = new TankEnemy("One", 400, 100, 3, enemiesBulletSpeed, 2, imgTankEnemy, player);
enemies[1] = new TankEnemy("Two", 100, 100, 3, enemiesBulletSpeed, 2, imgTankEnemy, player);
enemies[2] = new TankEnemy("Three", 650, 100, 3, enemiesBulletSpeed, 2, imgTankEnemy, player);

let unbreakable = new Unbreakable(imgUnbreakable);
unbreakable.start();
console.log(unbreakable.arr);
// global Position
let globalPosition;
for (let i = 0; i < enemies.length; i++) {
    enemies[i].start();
    enemies[i].draw();
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgBackground, 0, 0);
    unbreakable.draw();
}

let globalInterval;
let frameRate = 40;

function runningGame() {
    clear();
    player.move();
    // player.draw();
    let countEnemiesAlive = 0;
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].isAlive) {
            countEnemiesAlive++;
            enemies[i].move();
            enemies[i].fire();
            if (enemies[i].isBullet) {
                enemies[i].bullet.moveEnemies();
            }
        }
    }

    if (player.isBullet) {
        player.bullet.movePlayer();
    }
    if (countEnemiesAlive > 0) {
        setTimeout(function () {
            globalInterval = requestAnimationFrame(runningGame);
        }, 1000 / frameRate);
    } else endGame("victory");

}

requestAnimationFrame(runningGame);

function checkNotOverlapTank(x, y) {
    let floorX = Math.floor(x / 50);
    let floorY = Math.floor(y / 50);
    if ((x % 50 === 0) && (y % 50 === 0)) return true;
    else if (x % 50 === 0) {
        if ((unbreakable.arr[floorY][floorX] === 1) || (unbreakable.arr[floorY + 1][floorX]) === 1) return false;
    } else if (y % 50 === 0) {
        if ((unbreakable.arr[floorY][floorX] === 1) || (unbreakable.arr[floorY][floorX + 1]) === 1) return false;
    } else {
        if ((floorX + 1 < globalWidth / 50) && (floorY + 1 < globalHeight / 50)) {
            if ((unbreakable.arr[floorY][floorX] === 1) || (unbreakable.arr[floorY][floorX + 1] === 1)
                || (unbreakable.arr[floorY + 1][floorX] === 1) || (unbreakable.arr[floorY + 1][floorX + 1] === 1)) {
                return false;
            }
        } else if (floorX + 1 < globalWidth / 50) {
            if ((unbreakable.arr[floorY][floorX] === 1) || (unbreakable.arr[floorY][floorX + 1] === 1)) {
                return false;
            }
        } else if (floorY + 1 < globalHeight / 50) {
            if ((unbreakable.arr[floorY][floorX] === 1) || (unbreakable.arr[floorY + 1][floorX] === 1)) {
                return false;
            }
        }
    }
    return true;
}

function checkNotOverlapBullet(x, y, direction) {
    if (direction === "up") {
        let floorX = Math.floor(x / 50);
        let floorY = Math.floor(y / 50);
        if (y > 0) {
            if (unbreakable.arr[floorY][floorX] === 1) return false;
        }
        return true;
    } else if (direction === "down") {
        let floorX = Math.floor(x / 50);
        let floorY = Math.floor((y + 19) / 50);
        if (y + 19 < globalHeight) {
            if (unbreakable.arr[floorY][floorX] === 1) return false;
        }
        return true;
    } else if (direction === "left") {
        let floorX = Math.floor(x / 50);
        let floorY = Math.floor(y / 50);
        if (x > 0) {
            if (unbreakable.arr[floorY][floorX] === 1) return false;
        }
        return true;
    } else if (direction === "right") {
        let floorX = Math.floor((x + 19) / 50);
        let floorY = Math.floor(y / 50);
        if (x + 19 < globalWidth) {
            if (unbreakable.arr[floorY][floorX] === 1) return false;
        }
        return true;
    }
}

// Check if enemies fire will be blocked by unbreakable objects
function checkScopeBLocked(x, y, direction) {
    let floorX = Math.floor(x / 50);
    let floorY = Math.floor(y / 50);
    let floorXPlayer = Math.floor(player.x / 50);
    let floorYPlayer = Math.floor(player.y / 50);
    if (direction === "up") {
        for (let i = floorYPlayer; i < floorY; i++) {
            if (unbreakable.arr[i][floorX] === 1) return true;
        }
    } else if (direction === "down") {
        for (let i = floorY; i < floorYPlayer; i++) {
            if (unbreakable.arr[i][floorX] === 1) return true;
        }
    } else if (direction === "left") {
        for (let i = floorXPlayer; i < floorX; i++) {
            if (unbreakable.arr[floorY][i] === 1) return true;
        }
    } else if (direction === "right") {
        for (let i = floorX; i < floorXPlayer; i++) {
            if (unbreakable.arr[floorY][i] === 1) return true;
        }
    }
    return false;
}

//
function endGame(result) {
    if (result === "victory") {
        document.getElementById("result").src = "CaseResources/Victory.png";
    } else if (result === "defeat") {
        document.getElementById("result").src = "CaseResources/Defeat.png";
    }
    document.getElementById("buttonBoard").style.zIndex = "2";
}

function redirectToIndexPage() {
    location.href = "index_GameTank.html";
}

function redirectReload() {
    location.reload();
}

document.addEventListener("keydown", function (event) {
    player.fire();
});
//
let keyState = {};
document.addEventListener("keydown", function (event) {
    keyState[event.key] = true;
});
document.addEventListener("keyup", function (event) {
    keyState[event.key] = false;
});
