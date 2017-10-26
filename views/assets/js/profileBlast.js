'use strict';

let canvas;
let ctx;
let width;
let height;
let currentFrame;

let player;
let gameOver;
let game;
let stopDrawLoop;

let particles;
let obsoleteParticles;

const CST = {
    ACCELERATION: 5,
    IMG_SIZE: 100,
    DESCELERATION: 2,
    MAX_SPEED: 20,
    BLAST_FREQ : 4,
    BLAST_SPEED : 10,
    BLASTS_SIZE : 5,
    SHIP_MOVE_FREQ : 50,
    SHIP_BLAST_FREQ_MIN : 300,
    SHIP_BLAST_FREQ_MAX : 1000,
    COLUMNS: 11,
    ROWS: 5,
    PARTICLES: {
        GRAVITY: 0.5,
        SPEED:6,
        MAX_SIZE:4,
        ENTROPY: 0.1,
    }
};

$(document).ready(() => {
    $('#profile-pic').click((event) => {
       launch(); 
    });
});


function launch() {
    $('#profile-pic').slideUp();
    
    if(!ctx) {
        console.log('launching profile blast');
        initCanvas();
    }
    currentFrame = 0;
    canvas.style.display = 'block';
    
    player = {
        x: width/2,
        y: height-125,
        dirx: 0,
        life: 3,
        img: document.getElementById('profile-pic'),
        blasts : [],
        blastsToDelete : [],
        score: 0,
    };
    gameOver = false;
    game = {
        ships : [],
        blasts : [],
        blastsToDelete : [],
    }
    particles = [];
    obsoleteParticles = [];
    // add init ships
    spawnShipFleet();
    stopDrawLoop = false;
    draw();
}

// MAIN LOOP //

function draw() {
    ctx.clearRect(0, 0, width, height);
    /*ctx.fillStyle = 'white';
    ctx.fillText(
        width+':'+height+', '+
        particles.length+':'+obsoleteParticles.length+','+
        currentFrame, 50, 50);*/
    // ctx.drawImage(profilePic, 50, 50);
    
    if(!gameOver) {
        gameFrame();
    
        removeBlasts();

        removeShips();    
        
        drawParticles();
    } else {
        ctx.font="60px Arial";
        ctx.fillStyle = '#db2a2a';
        ctx.fillText("GAME OVER", 100, height/2);
        ctx.font="30px Arial";
        ctx.fillText("Score : " + player.score, 100, height/2 + 100);
    }
    currentFrame++;
    
    if(!stopDrawLoop) {
        requestAnimationFrame(draw);
    }
}

// GAME MECHANICS //

function gameFrame() {
    // player //
    // move
    player.x += player.dirx;
    if(player.dirx >= CST.DESCELERATION) player.dirx -= CST.DESCELERATION;
    if(player.dirx <= -CST.DESCELERATION) player.dirx += CST.DESCELERATION;
    
    if(player.dirx > CST.MAX_SPEED) player.dirx = CST.MAX_SPEED;
    if(player.dirx < -CST.MAX_SPEED) player.dirx = -CST.MAX_SPEED;
    
    if(player.x < 0){
        player.x = 0;
        player.dirx = 0;
    }
    if(player.x > width){
        player.x = width;
        player.dirx = 0;
    }
    // life
    if(player.life<=0) {
        onGameOver();
    }
    // draw
    ctx.beginPath();
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x-CST.IMG_SIZE/2-2, player.y-CST.IMG_SIZE/2-2,
                CST.IMG_SIZE+4, CST.IMG_SIZE+4);
    ctx.fill();
    ctx.drawImage(player.img, player.x - CST.IMG_SIZE/2, player.y - CST.IMG_SIZE/2, 
                  CST.IMG_SIZE,CST.IMG_SIZE);
    // draw score
    ctx.font="30px Arial";
    ctx.fillStyle = '#983073';
    for(let i =0; i<player.life; i++) {
        ctx.fillText('O', 5+i*30, 30);
    }
    ctx.font="20px Arial";
    ctx.fillStyle = '#1739F7';
    ctx.fillText("Score : "+player.score, 5, 60);
    
    
    if(currentFrame%CST.BLAST_FREQ == 0) {
        // blast
        addPlayerBlast();
    }
    // game //
    
    for(let ship of game.ships) {
        // move
        if(currentFrame%ship.speed == 0) {
            ship.y+=1;
        }
        // blast
        if(ship.hasBlaster && (currentFrame+ship.blastOffset)%ship.blastSpeed == 0) {
            addGameBlast(ship.x, ship.y);
        }
        //show
        drawShip(ship);
        
        //outbound
        if(outbound(ship.x, ship.y)) {
            // game over
            ship.life = 0;
            onGameOver();
        }
    }
    
    // blasts //
    // player's
    for(let i = 0; i<player.blasts.length; i++) {
        // move
        player.blasts[i].y -= CST.BLAST_SPEED;
        // collisions
        if(outbound(player.blasts[i].x,player.blasts[i].y)) {
            player.blastsToDelete.push(i); 
        }
        for(let ship of game.ships) {
            if(inbound(player.blasts[i].x, player.blasts[i].y,
                      ship.x, ship.y , ship.size+CST.BLASTS_SIZE/2+1)) {
                // player -hit-> ship
                player.blastsToDelete.push(i);
                ship.life -= 1;
                addSparkles(player.blasts[i].x,player.blasts[i].y,'green',10, 0);
            }
        }
        // draw
        drawBlast(player.blasts[i].x, player.blasts[i].y, 'green');
    }
    // enemies
    for(let i=0; i<game.blasts.length; i++) {
        // move
        game.blasts[i].y += CST.BLAST_SPEED/2;
        // collisions
        if(outbound(game.blasts[i].x, game.blasts[i].y)) {
            game.blastsToDelete.push(i); 
        } 
        else if(inbound(game.blasts[i].x, game.blasts[i].y , 
                   player.x, player.y, CST.IMG_SIZE)) {
            // ship -hit-> player
            game.blastsToDelete.push(i); 
            player.life -= 1;
            addSparkles(game.blasts[i].x, game.blasts[i].y, 'red', 50, 0);
        }
        // draw
        drawBlast(game.blasts[i].x, game.blasts[i].y, 'red');
    }
}

function addPlayerBlast() {
    player.blasts.push({
        x:player.x,
        y:player.y - CST.IMG_SIZE/2,
    });
}

function addGameBlast(x, y) {
    game.blasts.push({
        x:x,
        y:y
    });
}

function spawnShipFleet() {
    for(let c = 1; c<=CST.COLUMNS; c++) {
        for(let r = 1; r<=CST.ROWS; r++) {
            setTimeout(()=> {
                let x = c * (width/(CST.COLUMNS+1));
                let y = r * ( (height/2)/(CST.ROWS+1));
                addShip(x, y);
            }, c*60+r*100);
        }
    }
}

function addShip(x, y) {
    game.ships.push({
        size: 30,
        life: 3,
        speed: CST.SHIP_MOVE_FREQ,
        blastSpeed: randomInt(CST.SHIP_BLAST_FREQ_MIN, CST.SHIP_BLAST_FREQ_MAX),
        blastOffset : randomInt(0, 1000),
        hasBlaster : randomInt(0,8) <= 1,
        color:'red',
        x:x,
        y:y,
    });
}

function drawShip(ship) {
    
    function drawRect(x,y,size) {
        ctx.beginPath();
        ctx.fillStyle = ship.color;
        ctx.strokeStyle = 'black';
        ctx.rect(x,y,size,size);
        ctx.fill();
        ctx.stroke();
    }
    let s = ship.size/3;
    drawRect(ship.x-ship.size/2, ship.y-ship.size/2,s,s);
    drawRect(ship.x-s/2, ship.y-ship.size/2,s,s);
    drawRect(ship.x+s/2, ship.y-ship.size/2,s,s);
    drawRect(ship.x-s/2, ship.y-s/2,s,s);
    drawRect(ship.x-s/2, ship.y+s/2,s,s);
}

function removeBlasts() {
    // players
    for(let i of player.blastsToDelete) {
        player.blasts.splice(i, 1);
    }
    // game
    for(let i of game.blastsToDelete) {
        game.blasts.splice(i, 1);
    }
    player.blastsToDelete = [];
    game.blastsToDelete = [];
}

function removeShips() {
    let toRemove = [];
    for(let i = 0; i<game.ships.length; i++) {
        if(game.ships[i].life <= 0) {
            toRemove.push(i);
            onShipDeath(game.ships[i]);
            player.score+=100;
        }
    }
    for(let i of toRemove) {
        game.ships.splice(i, 1);
    }
}


function onShipDeath(ship) {
    addSparkles(ship.x, ship.y, 'red', 100, 5);
    
    if(game.ships.length <= 1) {
        // all ships are ded
        setTimeout(()=>{
            spawnShipFleet();    
        },5000);
        
        for(let i =0; i<10; i++) {
            setTimeout(()=>{
                addSparkles(randomInt(0, width), randomInt(0, height),
                           getRandomColor(), randomInt(100, 300), 1); 
            },i*100+100);
        }
    }
}

function drawBlast(x, y, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, CST.BLASTS_SIZE, CST.BLASTS_SIZE*2);
    ctx.fill();
}

function onGameOver() {
    if(!gameOver) {
        console.log('game over');
        gameOver = true;
        setTimeout(()=>{
            onFinishGame();
        }, 5000);
    }
}

function onFinishGame() {
    stopDrawLoop = true;
    canvas.style.display = 'none';
    $('#profile-pic').slideDown();
}

// UTILS //

function initCanvas() {
    canvas = document.getElementById('canvasEaster');
    ctx = canvas.getContext('2d');
    
    // window events
	window.addEventListener('keypress', keyPressed);
    window.onresize = resizeCanvas;
	
    // canvas size
	width = canvas.width = (window.innerWidth) - 100;
	height = canvas.height = (window.innerHeight) - 100;
    resizeCanvas();
}


function resizeCanvas() {
    width = canvas.width = (window.innerWidth);
    setTimeout(function() {
        height = canvas.height = (window.innerHeight) - 150;
    }, 0);
};


function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function inbound(x1, y1, x2, y2, size) {
    if(x1 > x2-size/2 && x1 < x2+size/2 &&
      y1 > y2 -size/2 && y1 < y2+size/2) {
        return true;
    }
    return false;
}


function outbound(x,y) {
    if(x<0 || x>width || y<0 || y>height) {
        return true;
    }
    return false;
}


function randomInt(min, max) {
    return Math.floor(Math.random()*max + min);
}


function keyPressed(e) {
    if(e.key == 'q' || e.key == 'ArrowLeft') {
        player.x-=10;
    }
    if(e.key == 'd' || e.key == 'ArrowRight') {
        player.x+=10;
    }
}


// PARTICLES //

function drawParticles() {
    for(let i = 0; i<particles.length; i++) {
        // move
        particles[i].diry += CST.PARTICLES.GRAVITY;
        particles[i].x += particles[i].dirx;
        particles[i].y += particles[i].diry;
        particles[i].size -= CST.PARTICLES.ENTROPY;
        // outbound
        if(particles[i].size <= 0 || 
           outbound(particles[i].x, particles[i].y)) {
            obsoleteParticles.push(i);
        }
        // draw
        ctx.beginPath();
        ctx.fillStyle = particles[i].color;
        ctx.fillRect(particles[i].x, particles[i].y, 
                     particles[i].size, particles[i].size);
        ctx.fill();
    }
    removeParticles();
}

function removeParticles() {
    for(let i of obsoleteParticles) {
        particles.splice(i, 1);
    }
    obsoleteParticles = [];
}

function addSparkles(x, y, color, size, power) {
    for(let i =0; i<size; i++) {
        addParticle(x, y, color, power);
    }
}

function addParticle(x, y, color, power) {
    let vector = getRandomVector(CST.PARTICLES.SPEED+power);
    particles.push({
        x: x,
        y: y,
        dirx: vector.x,
        diry: vector.y,
        color: color,
        size: Math.random()*CST.PARTICLES.MAX_SIZE+1,
    });
}

function getRandomVector(magMax) {
    let angle = Math.random() * Math.PI * 2;
    let mag = Math.random() * magMax - magMax;
    return {
        x: Math.cos(angle) * mag,
        y: Math.sin(angle) * mag,
    }
}
