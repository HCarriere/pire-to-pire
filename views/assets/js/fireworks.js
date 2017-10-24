'use strict';

let canvas;
let ctx;
let width;
let height;
let currentFrame;

let particles = [];
let obsoleteParticles = [];

let currentFireworks = 0;

const GRAVITY = 0.05;
const PARTICLES_SPEED = 10;
const ENTROPY = 0.05;
const PARTICLE_MAX_SIZE = 7;
const MAX_FIREWORKS = 10;


function launchFireworks() {
    if(currentFireworks >= MAX_FIREWORKS) {
        return;
    }
    currentFireworks = MAX_FIREWORKS;
    if(!ctx) {
        initCanvas();
    }
    addCluster(100,100,100,);
    
    for(let i = 0; i<MAX_FIREWORKS; i++) {
        setTimeout(function() { 
            addCluster(
                Math.floor(Math.random()*width),
                Math.floor(Math.random()*height),
                Math.floor(Math.random()*300+100)
                      );
            currentFireworks -= 1;
        }, Math.floor(Math.random()*1000*MAX_FIREWORKS/2));
    }
}

function initCanvas() {
    canvas = document.getElementById('fireworks');
    ctx = canvas.getContext('2d');
    // vars
    currentFrame = 0;
	
    // window events
    window.onresize = resizeCanvas;
	
    // canvas size
	width = canvas.width = (window.innerWidth) - 100;
	height = canvas.height = (window.innerHeight) - 100;
    resizeCanvas();
    draw();
}

function resizeCanvas() {
    width = canvas.width = (window.innerWidth);
    setTimeout(function() {
        height = canvas.height = (window.innerHeight) - 150;
    }, 0);
};

function draw() {
    ctx.clearRect(0, 0, width, height);
    /*ctx.fillStyle = 'white';
    ctx.fillText(
        width+':'+height+', '+
        particles.length+':'+obsoleteParticles.length+','+
        currentFrame, 50, 50);*/
    
    drawParticles();
    
    removeParticles();
    
    currentFrame++;
    requestAnimationFrame(draw);
}

function drawParticles() {
    for(let i=0; i<particles.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = particles[i].color;
        ctx.fillRect(particles[i].x, particles[i].y, 
                     particles[i].size/2, particles[i].size/2);
        
        // apply gravity
        particles[i].diry += GRAVITY;
        // apply direction
        particles[i].x += particles[i].dirx;
        particles[i].y += particles[i].diry;
        //entropy
        particles[i].size -= ENTROPY;
        // show
        //ctx.beginPath();
        ctx.fillRect(particles[i].x, particles[i].y, 
                     particles[i].size, particles[i].size);
        ctx.fillStyle = 'white';
        ctx.fillRect(particles[i].x+1, particles[i].y+1, 
                     particles[i].size/2, particles[i].size/2);
        ctx.fill();
        if(particles[i].x < 0 || particles[i].y < 0 || particles[i].y > height
          || particles[i].size <= 0) {
            obsoleteParticles.push(i);
        }
    }
}

function addCluster(x, y, size) {
    let color = getRandomColor();
    for(let i = 0; i<size; i++) {
        addParticle(x, y, color);
    }
}

function addParticle(x, y, color) {
    let vector = getRandomVector(PARTICLES_SPEED);
    particles.push({
        x: x,
        y: y,
        dirx: vector.x,
        diry: vector.y,
        color: color,
        size: Math.random()*PARTICLE_MAX_SIZE+1,
    });
}

function removeParticles() {
    // delete obsolete particles
    for(let i of obsoleteParticles) {
        particles.splice(i, 1);
    }
    obsoleteParticles = [];
}

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomVector(magMax) {
    let angle = Math.random() * Math.PI * 2;
    let mag = Math.random() * magMax - magMax;
    return {
        x: Math.cos(angle) * mag,
        y: Math.sin(angle) * mag,
    }
}
