function s (p) {

    class GameObject {
      constructor(x, y, drawFunction, vx=0, vy=0) {
        this.x = x;
        this.y = y;
        this._drawFunction = drawFunction;
        this.vx = vx;
        this.vy = vy;
      }
  
      draw() {
        // draw it in its own context
        p.push();
        this._drawFunction();
        p.pop();
      }
    }
    
    function instructions(){
      let st = p.createElement('style', `
        kbd {
          display:inline-block;
        padding: 2px 8px;
          margin: 4px 2px;
          
        border: 1px solid #bbb;
          border-radius:3px;
        }
  `);
      let d = p.createDiv(`
      <p>Controls:</p>
        <ul id="instructions-list" style="list-style:none;">
          <li><kbd>&larr; LEFT ARROW</kbd>: Move left</li>
          <li><kbd>&rarr; RIGHT ARROW</kbd>: Move right</li>
          <li><kbd>SHIFT (HOLD)</kbd>: Slow move</li>
          <li><kbd>&uarr; UP ARROW</kbd>: Shoot</li>
        </ul>`);
      
      d.style('display:grid');
      d.style('grid-template-columns:4rem auto');
      d.style('padding:10px');
      
    }
  
    const lifeStates = {
      FULL : function() {
        p.noStroke();
        p.fill("white");
        p.circle(this.x, this.y, 15);
      },
      EMPTY : function() {
        p.noFill(); 
        p.strokeWeight(2);
        p.stroke("white");
        p.circle(this.x, this.y, 10);
      },
      get DEFAULTSTATE() {
        return Object.keys(this)[0];
      }
    }
  
    let player;
    const enemies = [];
    const ENEMY_SIZE = 35;
    const MAX_ENEMIES = 5;
    const PROJECTILE_LENGTH = 6;
  
    class UiElement {
     constructor(x, y, states) {
       this.x = x;
       this.y = y;
       this.states = states; // key value pairs of state names and draw functions
       this.currentState = states.DEFAULTSTATE;
     }
  
    draw() {
        this.t = this.states[this.currentState];
        p.push();
        this.t();
        p.pop();
      }
    }
  
    const GameManager = {
      MAX_LIVES : 3,
      currentLives : 3,
      SCORE : 0,
      LivesUi : [],
      LoseLife : function() {
        if (this.currentLives > 0) {
          this.LivesUi[this.currentLives-1].currentState = 'EMPTY';
          this.currentLives -= 1;
        }
      }
    }
  
    p.setup = function() {
      let cnv = p.createCanvas(400, 500);
      // console.log(p)
      // cnv.parent(p._userNode);
      // console.log(cnv.parent())
      instructions();
  
      GameManager.LivesUi = [
        new UiElement(p.width-15, p.height-15, lifeStates),
        new UiElement(p.width-35, p.height-15, lifeStates),
        new UiElement(p.width-55, p.height-15, lifeStates) 
        ];
  
      enemies.push(new GameObject(p.width/2-20, 20, drawEnemy));
      enemies.push(new GameObject(p.width/4-20, 20, drawEnemy));
      enemies.push(new GameObject(3*p.width/4-20, 20, drawEnemy));
  
      player = {
        LASTSHOT : 0,
        gameSettings : {
          FIRERATE : 10,
          MOVESPEED : 7,
          MAXPROJECTILES : 3
        },
        controls : {
          LEFT : p.LEFT_ARROW,
          RIGHT: p.RIGHT_ARROW,
          SHOOT: p.UP_ARROW,
          SLOW: 16
        },
        gameObject :
        new GameObject(
        p.width/2,
        p.height-30,
        function() {
          p.noStroke();
          p.fill('gold');
          p.triangle(
            this.x - 10, this.y,
            this.x, this.y - 20,
            this.x + 10, this.y);
      }),
        draw() {
         this.gameObject.draw(); 
        },
        get canShoot() {
         return p.frameCount > (this.LASTSHOT + this.gameSettings.FIRERATE) 
        },
        projectiles : []
      }
  
    }
  
    p.draw = function() {
      p.background('#441133');
  
      if (GameManager.currentLives == 0) {
        p.push();
        p.noLoop();
        p.fill("white");
        p.textSize(30);
        p.textAlign('center');
        p.text('GAME OVER', p.width/2, p.height/2);
        p.pop();
      }
  
      if (p.keyIsPressed) {
        checkControls();
      }
      checkCollision();
  
      for (let i = 0; i < player.projectiles.length;) {
        if (player.projectiles[i].HIT == true) {
          player.projectiles.splice(i,1);  
        }
        else if (player.projectiles[i].y > 0) {
          player.projectiles[i].y -= player.projectiles[i].vy;
          player.projectiles[i].draw();
          i++;
        } else {
          player.projectiles.splice(i,1); 
        }
      }
  
      // check who has been hit
      for (let i = 0; i < enemies.length;) {
        if (enemies[i].HIT) {
          enemies.splice(i,1);
          GameManager.SCORE += 1;
        } else if (enemies[i].y > (p.height + ENEMY_SIZE - 15)) {
          enemies.splice(i,1);
          GameManager.LoseLife();
        }
        else {
          enemies[i].y += enemies[i].vy;
          enemies[i].draw();
          i++;
        }
  
      }
      if ((enemies.length < MAX_ENEMIES) && (GameManager.currentLives > 0)) {
        if (p.random() > 0.98) {
         spawnEnemy(); 
        }
      }
  
      player.draw();
  
      for (let life of GameManager.LivesUi) {
        life.draw();
      }
  
      p.push();
      p.fill("white");
      p.textSize(20)
      p.text(GameManager.SCORE, 8, p.height-10);
      p.pop();
  
    }
  
    function drawProjectile() {
      p.strokeWeight(5);
      p.stroke('aqua');
      p.line(this.x, this.y, this.x, this.y + PROJECTILE_LENGTH);
    }
  
    function drawEnemy() {
      p.noStroke();
      p.fill('hotpink');
      p.rect(this.x, this.y, ENEMY_SIZE);
    }
  
    function checkCollision() {
  
      // compare all enemies to all projectiles
      for (let e of enemies) {
        for (let pl of player.projectiles) {
          // line(e.x+ENEMY_SIZE/2, e.y+ENEMY_SIZE/2, pl.x, pl.y);
          let proximity = p.dist(e.x+ENEMY_SIZE/2, e.y+ENEMY_SIZE/2, pl.x, pl.y);
          if (proximity < ENEMY_SIZE-5) {
            e.HIT = true; 
            pl.HIT = true;
          }
        }
      }
    }
  
    function spawnEnemy() {
      enemies.push(new GameObject(p.random(50, p.width-50), -20, drawEnemy, 0, p.random(1,4)));
    }
  
    function checkControls() {
      let moveAmount = 0;
      let moveMultiplier = 1;
      let moveSlow = 0.4;
      if (p.keyIsDown(player.controls.SLOW)) {
        moveMultiplier = moveSlow;
      }
      if (p.keyIsDown(player.controls.LEFT)) {
        moveAmount -= player.gameSettings.MOVESPEED * moveMultiplier;
      }
      if (p.keyIsDown(player.controls.RIGHT)) {
        moveAmount += player.gameSettings.MOVESPEED * moveMultiplier;
      }
      player.gameObject.x += moveAmount;
  
      if (p.keyIsDown(player.controls.SHOOT) && player.canShoot) {
        if (player.projectiles.length < player.gameSettings.MAXPROJECTILES) {
        player.LASTSHOT = p.frameCount;
        player.projectiles.push(new GameObject(
          player.gameObject.x, 
          player.gameObject.y - 20, 
          drawProjectile, 0, 4)
                               );
      }
      }
    }
  }
  
  // new p5(s, "sketch-container");
