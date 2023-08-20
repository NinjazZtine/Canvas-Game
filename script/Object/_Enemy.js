
class Enemy {
    constructor(x, y, velX = 0, velY = 0, size = 10, color = "red") {
        this.x = x;
        this.y = y;
        this.size = size;
        this.origSize = size;
        this.health = size;
        this.showHealth = false;
        this.velX = velX;
        this.velY = velY;
        this.knockVelX = 0;
        this.knockVelY = 0;
        this.color = color;
        this.targetAngle = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.onFireCooldown = true;
        this.onFireCooldownSmart = true;
        this.markedForDeletion = false;
        this.isDead = false;
    }

    aim(target) {
        this.targetAngle = Math.atan2(target.y - this.y, target.x - this.x);
        this.targetX = Math.cos(this.targetAngle);
        this.targetY = Math.sin(this.targetAngle);
    }
    
    knock(velX, velY) {
        this.knockVelX = velX;
        this.knockVelY = velY;
    }
    
    fireProjectile() {
        if (!this.onFireCooldown) {
            if (Math.random() < 0.05) {
                const velX = this.targetX * 4;
                const velY = this.targetY * 4;
                const x = this.x + this.targetX * 30;
                const y = this.y + this.targetY * 30;
                beep(0.02, 10, 5);
                projectileArray.push(new Projectile(x, y, velX, velY, "red"));
            }
            this.onFireCooldown = true;
        }
    }
    
    fireSmartProjectile(target) {
        if (smartProjectileArray.length > 6) return
        if (!this.onFireCooldownSmart) {
            if (Math.random() < 0.2) {
                playAudio(seeking_projectile_launch, Math.random() * 0.02 + 0.01);
                smartProjectileArray.push(new SmartProjectile(this.x, this.y, target, this.color));
            }
            this.onFireCooldownSmart = true;
        }
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.lineWidth = this.size * 0.5;
        ctx.strokeStyle = "white";
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.targetX * (this.size * 1.7), this.y + this.targetY * (this.size * 1.7));
        ctx.stroke();
        
        if (this.showHealth) {
            const barLength = this.size * 2.5 + 2;
            const barX = this.x - barLength*0.5;
            const barY = this.y - (this.size + 18);
            ctx.fillStyle = "red";
            ctx.fillRect(barX, barY, Math.max(0, (this.health * 2.5)), 6);
            ctx.strokeStyle = "#a3a3a3";
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barLength, 6);
        }
    }
    
    update() {
        if (Math.abs(this.knockVelX) + Math.abs(this.knockVelY) > 0.001) {
            this.knockVelX *= 0.95;
            this.knockVelY *= 0.95;
        } else {
            this.knockVelX = 0;
            this.knockVelY = 0;
        }
        this.x += this.velX + this.knockVelX;
        this.y += this.velY + this.knockVelY;
        this.aim(player);
        
        if (this.x + this.size > CanvasWidth) {
            this.velX = -this.velX;
            this.knockVelX = - this.knockVelX;
        } else if (this.x - this.size < 0) {
            this.velX = -this.velX;
            this.knockVelX = - this.knockVelX;
        }
        
        if (this.y + this.size > CanvasHeight) {
            this.velY = -this.velY;
            this.knockVelY = - this.knockVelY;
        } else if (this.y - this.size < 0) {
            this.velY = -this.velY;
            this.knockVelY = - this.knockVelY;
        }
        
        
        this.fireProjectile();
        this.fireSmartProjectile(player);
        if (this.isDead) {
            this.size -= 1;
        }
        if (this.size <= 0) {
            this.markedForDeletion = true;
        }
        this.draw();
    }
}

function createEnemy() {
    if (enemyArray.length > 5) return;
    if (Math.random() > 0.8) return;
    const big = 20;
    const medium = 15;
    const small = 10;
    let size = 15;
    const rng = Math.floor(Math.random() * 3);
    switch (rng) {
        case 0:
            size = small;
            break;
        case 1:
            size = medium;
            break;
        case 2:
            size = big;
            break;
    }
    const x = Math.round(size + Math.random() * (CanvasWidth - size * 2));
    const y = Math.round(size + Math.random() * (CanvasHeight - size * 2));
    const angle = Math.atan2(player.y - y, player.x - x);
    const randomVel = Math.random() * 1 + 0.3;
    const xVel = Math.cos(angle) * randomVel;
    const yVel = Math.sin(angle) * randomVel;
    const color = "hsl(" + Math.random() * 360 + "0,100%,70%)";
    enemyArray.push(new Enemy(x, y, xVel, yVel, size, color));
}
