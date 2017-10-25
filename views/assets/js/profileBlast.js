'use strict';

let canvas;
let ctx;
let width;
let height;
let currentFrame;

let player;
let gameOver;
let game;

const CST = {
    ACCELERATION: 5,
    IMG_SIZE: 100,
    DESCELERATION: 2,
    MAX_SPEED: 20,
    BLAST_FREQ : 4,
    BLAST_SPEED : 10,
    BLASTS_SIZE : 5,
    SHIP_MOVE_FREQ : 1,
    SHIP_BLAST_FREQ : 120,
};

$(document).ready(() => {
    $('#profile-pic').click((event) => {
       launch(); 
    });
});

function launch() {
    console.log('launching profile blast');
    $('#profile-pic').slideUp();
    
    if(!ctx) {
        initCanvas();
    }
    
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
    
    // add init ships
    for(let i = 1; i<= 9; i++) {
        setTimeout(function() { 
            let x = (width/10)*i;
            addShip(x);
        }, randomInt(100, 8000));
    }
    
    draw();
}

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
    } else {
        ctx.font="60px Arial";
        ctx.fillStyle = '#db2a2a';
        ctx.fillText("GAME OVER", 100, height/2);
        ctx.font="30px Arial";
        ctx.fillText("Score : " + player.score, 100, height/2 + 100);
    }
    currentFrame++;
    requestAnimationFrame(draw);
}

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
    ctx.drawImage(player.img, player.x - CST.IMG_SIZE/2, player.y - CST.IMG_SIZE/2, 
                  CST.IMG_SIZE,CST.IMG_SIZE);
    // draw score
    ctx.font="20px Arial";
    ctx.fillStyle = '#983073';
    ctx.fillText("Life : "+player.life, 5, 30);
    ctx.fillStyle = '#1739F7';
    ctx.fillText("Score : "+player.score, 5, 60);
    
    
    if(currentFrame%CST.BLAST_FREQ == 0) {
        // blast
        addPlayerBlast();
    }
    // game //
    
    for(let ship of game.ships) {
        // move
        if(currentFrame%(CST.SHIP_MOVE_FREQ+ship.speed) == 0) {
            ship.y+=1;
        }
        // blast
        if(currentFrame%(CST.SHIP_BLAST_FREQ+ship.blastSpeed) == 0) {
            addGameBlast(ship.x, ship.y);
        }
        //show
        ctx.beginPath();
        ctx.fillStyle = ship.color;
        ctx.fillRect(ship.x-ship.size/2, ship.y-ship.size/2, ship.size, ship.size);
        ctx.fill();
        
        //outbound
        if(outbound(ship.x, ship.y)) {
            // game over
            ship.life = 0;
            console.log('game over');
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
                      ship.x, ship.y , ship.size)) {
                player.blastsToDelete.push(i);
                ship.life -= 1;
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
            // collision made
            game.blastsToDelete.push(i); 
            player.life -= 1;
        }
        // draw
        drawBlast(game.blasts[i].x, game.blasts[i].y, 'red');
    }
}

function addPlayerBlast() {
    player.blasts.push({
        x:player.x,
        y:player.y
    });
}

function addGameBlast(x, y) {
    game.blasts.push({
        x:x,
        y:y
    });
}

function addShip(x) {
    let smallness = randomInt(1, 3);
    game.ships.push({
        size: smallness*15,
        life: smallness*5,
        speed: smallness*2,
        blastSpeed: randomInt(120, 500),
        color:'red',
        x:x,
        y:40,
    });
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
            onShipDeath(game.ships[i].x);
            player.score+=100;
        }
    }
    for(let i of toRemove) {
        game.ships.splice(i, 1);
    }
}


function onShipDeath(x) {
    // add new ship on top
    setTimeout(function() { 
        addShip(x);
    }, randomInt(5000, 15000));
}

function drawBlast(x, y, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, CST.BLASTS_SIZE, CST.BLASTS_SIZE);
    ctx.fill();
}

function onGameOver() {
    if(!gameOver) {
        gameOver = true;
        setTimeout(()=>{
            onFinishGame();
        }, 5000);
    }
}

function onFinishGame() {
    canvas.style.display = 'none';
    $('#profile-pic').slideDown();
}


function initCanvas() {
    canvas = document.getElementById('canvasEaster');
    canvas.style.display = 'block';
    ctx = canvas.getContext('2d');
    // vars
    currentFrame = 0;
	
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
