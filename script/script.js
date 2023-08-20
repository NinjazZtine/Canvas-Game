const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let CanvasWidth = 1000;
let CanvasHeight = 800;
let WindowWidth = window.innerWidth;
let WindowHeight = window.innerHeight;
const unitSize = 25;

class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
    preRender() {
        const targetX = -player.x - player.targetX * 80 + ctx.canvas.width / 2;
        const targetY = -player.y - player.targetY * 80 + ctx.canvas.height / 2;
        const vectorX = targetX - this.x;
        const vectorY = targetY - this.y;
        this.x += vectorX * 0.04;
        this.y += vectorY * 0.04;
        ctx.save();
        ctx.translate(this.x, this.y);
    }
    postRender() {
        ctx.restore();
    }
}

const fpsUi = document.getElementById("fps");
const ScoreUi = document.getElementById("scoreUi");
const HealthUi = document.getElementById("healthValue");
const AmmoUi = document.getElementById("ammoValue");

const camera = new Camera();
let score = 0;
let fps = 0;
let player;
let moveControl;
let aimControl;
let particleArray = [];
let projectileArray = [];
let smartProjectileArray = [];
let enemyArray = [];

let lastTimeFrame = 0;
let timeElapsed = 0;
let Timers = [];
let running = false;

function gameLoop(delta) {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    camera.preRender();

    drawGrid();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    ctx.strokeRect(0, 0, CanvasWidth, CanvasHeight);
    player.update();

    //Projectile Loop
    for (let i = 0; i < projectileArray.length; i++) {
        const projectile = projectileArray[i];
        projectile.update();
        //enemyPassedBorder
        if (
            projectile.x >= CanvasWidth ||
            projectile.x <= 0 ||
            projectile.y >= CanvasHeight ||
            projectile.y <= 0
        ) {
            projectile.markedForDeletion = true;
        }

        //Enemy and Projectile Collision
        if (projectile.color === "white") {
            for (let j = 0; j < enemyArray.length; j++) {
                const enemy = enemyArray[j];
                const distance = Math.hypot(
                    projectile.x - enemy.x,
                    projectile.y - enemy.y
                );
                const radiiSum = enemy.size + projectile.size;
                if (distance <= radiiSum) {
                    emitParticle(
                        projectile.x,
                        projectile.y,
                        5,
                        5,
                        "white",
                        projectile.velX * 0.15,
                        projectile.velY * 0.16
                    );
                    enemy.health -= Math.floor(Math.random() * 3 + 3);
                    if (enemy.health > 0) {
                        enemy.showHealth = true;
                    } else {
                        if (!enemy.isDead) {
                            enemy.showHealth = false;
                            enemy.isDead = true;
                            playAudio(enemy_death, 0.5);
                            score += Math.round(Math.random() * 10 + enemy.origSize);
                            ScoreUi.innerText = score;
                        }
                    }
                    enemy.knock(projectile.velX * 0.2, projectile.velY * 0.2);
                    projectile.markedForDeletion = true;
                }
            }
        }

        //Projectile and smart projectile collisin
        if (projectile.color === "white") {
            for (let j = 0; j < smartProjectileArray.length; j++) {
                const sprojectile = smartProjectileArray[j];
                const distance = Math.hypot(
                    projectile.x - sprojectile.x,
                    projectile.y - sprojectile.y
                );
                const radiiSum = sprojectile.size + projectile.size;
                if (distance <= radiiSum) {
                    sprojectile.markedForDeletion = true;
                    projectile.markedForDeletion = true;
                }
            }
        }

        //Player and Projectile Collision
        if (projectile.color === "red") {
            if (!player.isDead) {
                const pDistance = Math.hypot(
                    projectile.x - player.x,
                    projectile.y - player.y
                );
                const pRadiiSum = projectile.size + player.size;
                if (pDistance <= pRadiiSum) {
                    emitParticle(
                        player.x,
                        player.y,
                        5,
                        10,
                        player.color,
                        projectile.velX * 0.3,
                        projectile.velY * 0.3
                    );
                    emitParticle(
                        projectile.x,
                        projectile.y,
                        5,
                        10,
                        "white",
                        projectile.velX * 0.15,
                        projectile.velY * 0.16
                    );
                    if (player.health > 0) {
                        playAudio(bullet_impact, 0.1);
                        player.knock(projectile.velX * 0.2, projectile.velY * 0.2);
                        player.health -= Math.random() * 4 + 3;
                        HealthUi.style.width = player.health + "%";
                    } else kill();
                    projectile.markedForDeletion = true;
                }
            }
        }

        if (projectile.markedForDeletion) {
            projectileArray.splice(i, 1);
            i--;
        }
    }

    //Smart Projectile Loop
    for (let i = 0; i < smartProjectileArray.length; i++) {
        const projectile = smartProjectileArray[i];
        projectile.update();
        if (Math.random() < 0.3) {
            emitParticle(projectile.x, projectile.y, 1, 2, projectile.color);
        }
        if (projectile.lifeTime <= 0) {
            projectile.markedForDeletion = true;
        }

        //Player and smartProjectile Collision
        if (!player.isDead) {
            const pDistance = Math.hypot(
                projectile.x - player.x,
                projectile.y - player.y
            );
            const pRadiiSum = projectile.size + player.size;
            if (pDistance <= pRadiiSum) {
                emitParticle(player.x, player.y, 7, 9, player.color, projectile.velX,
                    Projectile.velY);
                emitParticle(
                    projectile.x,
                    projectile.y,
                    12,
                    15,
                    projectile.color,
                    projectile.velX,
                    Projectile.velY
                );
                if (player.health > 0) {
                    playAudio(bullet_impact, 0.25);
                    player.knock(projectile.velX * 2, projectile.velY * 2);
                    player.health -= Math.random() * 10 + 10;
                    HealthUi.style.width = player.health + "%";
                } else kill();
                projectile.markedForDeletion = true;
            }
        }

        if (projectile.markedForDeletion) {
            smartProjectileArray.splice(i, 1);
            emitParticle(projectile.x, projectile.y, 8, 10, projectile.color);
        }
    }

    //Enemy Loop
    enemyArray.forEach((enemy, i) => {
        enemy.update();
        //enemyPassedBorders
        if (
            enemy.x > CanvasWidth + enemy.size * 2 ||
            enemy.x < -enemy.size * 2 ||
            enemy.y > CanvasHeight + enemy.size * 2 ||
            enemy.y < -enemy.size * 2
        ) {
            enemy.markedForDeletion = true;
        }

        if (enemy.markedForDeletion) {
            emitParticle(
                enemy.x,
                enemy.y,
                enemy.origSize,
                enemy.origSize,
                enemy.color
            );
            
            enemyArray.splice(i, 1);
        }
    });

    //Particle Loop
    for (let i = 0; i < particleArray.length; i++) {
        const particle = particleArray[i];
        particle.update();
        if (particle.size <= 0.2) {
            particle.markedForDeletion = true;
        }
        if (particle.markedForDeletion) {
            particleArray.splice(i, 1);
            i--;
        }
    }

    camera.postRender();

    timeElapsed = delta - lastTimeFrame;
    lastTimeFrame = delta;
    Timers.forEach((timer) => {
        timer.update(timeElapsed);
    });
    
    ctx.fillText(fps, canvas.width, 10);

    //drawing Controls
    /*
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(
        moveControl.touchStartPositionX,
        moveControl.touchStartPositionY
    );
    ctx.lineTo(moveControl.touchEndPositionX, moveControl.touchEndPositionY);
    ctx.stroke();
    ctx.strokeStyle = aimControl.power > 0.6 ? "red" : "lime";
    ctx.beginPath();
    ctx.moveTo(aimControl.touchStartPositionX, aimControl.touchStartPositionY);
    ctx.lineTo(aimControl.touchEndPositionX, aimControl.touchEndPositionY);
    ctx.stroke();
    */

    requestAnimationFrame(gameLoop);
}

function drawGrid() {
    width = CanvasWidth / unitSize;
    height = CanvasHeight / unitSize;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 0.2;
    for (i = 0; i < width; i++) {
        ctx.beginPath();
        ctx.moveTo(i * unitSize, 0);
        ctx.lineTo(i * unitSize, CanvasHeight);
        ctx.stroke();
    }
    for (i = 0; i < height; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * unitSize);
        ctx.lineTo(CanvasWidth, i * unitSize);
        ctx.stroke();
    }
}

function showStartScreen() {}

function gameStart() {
    player = new Player(
        Math.floor(Math.random() * CanvasWidth),
        Math.floor(Math.random() * CanvasHeight),
        15,
        "hsl(0,0%,66.8%)"
    );
    moveControl = new GestureControl();
    aimControl = new GestureControl();
    score = 0;
    ScoreUi.innerText = score;
    HealthUi.style.width = Math.max(2, player.health) + "%";
    AmmoUi.style.width = Math.max(2, (player.ammo / 50) * 100) + "%";
    
    Timers = [
        //enemySpawnRate
        new Timer(1000, createEnemy),
        //playerFireCooldown
        new Timer(150, () => {
            player.onFireCooldown = false;
        }),

        //enemyFireCooldown
        new Timer(200, () => {
            enemyArray.forEach((enemy) => {
                enemy.onFireCooldown = false;
            });
        }),
        new Timer(2000, () => {
            enemyArray.forEach((enemy) => {
                enemy.onFireCooldownSmart = false;
            });
        }),

        //smartProjectileLifeTime
        new Timer(1000, () => {
            smartProjectileArray.forEach((projectile) => {
                projectile.lifeTime -= 1;
            });
        }),

        //fps counter
        new Timer(200, () => {
            ctx.fillStyle = "white";
            ctx.textAlign = "right";
            fps = Math.round(1000 / timeElapsed) + " FPS";
        }),
    ];
    smartProjectileArray = [];
    
    lastTimeFrame = 0;
    timeElapsed = 0;
    running = true;
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    running = false;
    Timers = [];
    lastTimeFrame = 0;
    timeElapsed = 0;
    player = {};
    setTimeout(gameStart, 100);
}

function kill() {
    playAudio(death_explosion, 1);
    player.isDead = true;
    emitParticle(player.x, player.y, 25, 19, player.color);
    setTimeout(() => {
        gameOver();
        return;
    }, 3000);
}

gameStart();
