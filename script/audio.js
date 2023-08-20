const shoot = document.getElementById('shoot');
const no_ammo = document.getElementById('no_ammo');
const reload = document.getElementById('reload');
const enemy_death = document.getElementById('enemy_death');
const seeking_projectile_launch = document.getElementById('seeking_projectile_launch');
const bullet_impact = document.getElementById('bullet_impact');
const death_explosion = document.getElementById('death_explosion');
/*
const no_ammo = new Audio("./assets/audio/no_ammo.wav");
const reload = new Audio("./assets/audio/reload.wav");
const enemy_death = new Audio("./assets/audio/enemy_death.wav");
const missile_launch = new Audio("./assets/audio/missile_launch.wav");
const bullet_impact = new Audio("./assets/audio/missile_launch.wav");
*/

const actx = new AudioContext();

function playAudio(audio, volume = 1) {
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play();
}

function beep(vol, freq, duration) {
    v = actx.createOscillator();
    u = actx.createGain();
    v.connect(u);
    v.frequency.value = freq + 500;
    v.type = "square";
    u.connect(actx.destination);
    u.gain.value = vol;
    v.start(actx.currentTime);
    v.stop(actx.currentTime + duration * 0.001);
}