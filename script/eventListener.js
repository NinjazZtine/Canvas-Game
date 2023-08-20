canvas.addEventListener("touchstart", (ev) => {
    if (!running) return;
    let touches = ev.changedTouches;
    for (i = touches.length - 1; i >= 0; i--) {
        const touch = touches[i];
        const x = touch.clientX;
        const y = touch.clientY;
        if (x > WindowWidth / 2) {
            aimControl.touchStart(x, y);
        } else if (x < WindowWidth / 2) {
            moveControl.touchStart(x, y);
        }
    }
});

canvas.addEventListener("touchmove", (ev) => {
    if (!running) return;
    let touches = ev.changedTouches;
    for (i = touches.length - 1; i >= 0; i--) {
        const touch = touches[i];
        const x = touch.clientX;
        const y = touch.clientY;
        if (x > WindowWidth / 2) {
            aimControl.touchMove(x, y);
            player.aim(aimControl.angle);
        } else if (x < WindowWidth / 2) {
            moveControl.touchMove(x, y);
            player.move(
                moveControl.relativeX * 0.05,
                moveControl.relativeY * 0.05
            );
        }
    }
});

canvas.addEventListener("touchend", (ev) => {
    if (!running) return;
    let touches = ev.changedTouches;
    for (i = touches.length - 1; i >= 0; i--) {
        const touch = touches[i];
        const x = touch.clientX;
        if (x > WindowWidth / 2) {
            aimControl.touchEnd();
        } else if (x < WindowWidth / 2) {
            moveControl.touchEnd();
            player.moving = false;
        }
    }
});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    WindowWidth = window.innerWidth;
    WindowHeight = window.innerHeight;

});