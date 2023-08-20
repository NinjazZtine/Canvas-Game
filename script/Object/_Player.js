class Player {
    constructor(x, y, size = 15, color = "white") {
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.moving = false;
        this.knockVelX = 0;
        this.knockVelY = 0;
        this.color = color;
        this.size = size;
        this.health =100;
        this.ammo = 50;
        this.reloading = false;
        this.targetAngle = 0;
        this.targetX = 1;
        this.targetY = 0;
        this.onFireCooldown = false;
        this.isDead = false;
    }

    aim(angle) {
        this.targetAngle = angle;
        this.targetX = Math.cos(this.targetAngle);
        this.targetY = Math.sin(this.targetAngle);
    }
    
    knock(velX, velY) {
        if (this.isDead) return;
        this.knockVelX = velX;
        this.knockVelY = velY;
    }
    
    move(velX, velY) {
        if (this.isDead) return;
        this.moving = true;
        this.velX = velX;
        this.velY = velY;
    }

    fireProjectile() {
        if (this.isDead) return;
        if (!this.onFireCooldown) {
            if (this.ammo > 0) {
                const velX = this.targetX * (Math.random() * 2 - 1 + 10);
                const velY = this.targetY * (Math.random() * 2 - 1 + 10);
                const x = this.x + this.targetX * 20;
                const y = this.y + this.targetY * 20;
                
                playAudio(shoot, 0.2);
                
                projectileArray.push(new Projectile(x, y, velX, velY));
                this.ammo--;
                AmmoUi.style.width = this.ammo / 50 * 100 + "%";
                this.onFireCooldown = true;
            } else {
                playAudio(no_ammo, 0.2);
                if (!this.reloading) {
                    this.reloading = true
                    setTimeout(() => {
                        playAudio(reload, 0.8);
                        this.ammo = 50
                        this.reloading = false;
                    }, 2000);
                }
                this.onFireCooldown = true;
            }
        }
    }
    
    draw() {
        if (this.isDead) return;
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
    }

    update() {
        if (!this.moving) {
            if (Math.abs(this.velX) + Math.abs(this.velY) > 0.001) {
                this.velX *= 0.90;
                this.velY *= 0.90;
            } else {
                this.velX = 0;
                this.velY = 0;
            }
        }
        if (Math.abs(this.knockVelX) + Math.abs(this.knockVelY) > 0.001) {
            this.knockVelX *= 0.95;
            this.knockVelY *= 0.95;
        } else {
            this.knockVelX = 0;
            this.knockVelY = 0;
        }
        this.x += this.velX + this.knockVelX;
        this.y += this.velY + this.knockVelY;
        

        if (this.x + this.size > CanvasWidth) {
            this.x = CanvasWidth - this.size;
        } else if (this.x - this.size < 0) {
            this.x = this.size;
        }
        if (this.y + this.size > CanvasHeight) {
            this.y = CanvasHeight - this.size;
        } else if (this.y - this.size < 0) {
            this.y = this.size;
        }
        
        if (aimControl.isActive && aimControl.power > 0.6) {
            this.fireProjectile();
        }
        this.draw();
    }
}
