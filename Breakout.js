/*
 * File: Breakout.js
 * -----------------
 * This program implements the Breakout game.
 * 
 * Author: Aman Malhotra (amanm27@stanford.edu)
 * 
 * Last modified: Friday, 10/11/19 4:50 pm
 */
"use strict";

/* Constants */
const GWINDOW_WIDTH = 360;           /* Width of the graphics window      */
const GWINDOW_HEIGHT = 600;          /* Height of the graphics window     */
const N_ROWS = 10;                   /* Number of brick rows              */
const N_COLS = 10;                   /* Number of brick columns           */
const BRICK_ASPECT_RATIO = 4 / 1;    /* Width to height ratio of a brick  */
const BRICK_TO_BALL_RATIO = 3 / 2;   /* Ratio of brick width to ball size */
const BRICK_TO_PADDLE_RATIO = 2 / 3; /* Ratio of brick to paddle width    */
const BRICK_SEP = 4;                 /* Separation between bricks         */
const TOP_FRACTION = 0.1;            /* Fraction of window above bricks   */
const BOTTOM_FRACTION = 0.05;        /* Fraction of window below paddle   */
const N_BALLS = 3;                   /* Number of balls in a game         */
const TIME_STEP = 10;                /* Time step in milliseconds         */
const INITIAL_Y_VELOCITY = 3.0;      /* Starting y velocity downward      */
const MIN_X_VELOCITY = 1.0;          /* Minimum random x velocity         */
const MAX_X_VELOCITY = 3.0;          /* Maximum random x velocity         */

/* Derived constants */
const BRICK_WIDTH = (GWINDOW_WIDTH - (N_COLS + 1) * BRICK_SEP) / N_COLS;
const BRICK_HEIGHT = BRICK_WIDTH / BRICK_ASPECT_RATIO;
const PADDLE_WIDTH = BRICK_WIDTH / BRICK_TO_PADDLE_RATIO;
const PADDLE_HEIGHT = BRICK_HEIGHT / BRICK_TO_PADDLE_RATIO;
const PADDLE_Y = (1 - BOTTOM_FRACTION) * GWINDOW_HEIGHT - PADDLE_HEIGHT;
const BALL_SIZE = BRICK_WIDTH / BRICK_TO_BALL_RATIO;
const LABEL_GW_WIDTH = GWINDOW_WIDTH/2;
const LABEL_GW_HEIGHT = GWINDOW_HEIGHT/10;
const brickXInit = (GWINDOW_WIDTH / 2) - (BRICK_SEP / 2) - (5 * BRICK_WIDTH) - (4 * BRICK_SEP);
const brickYInit = TOP_FRACTION * GWINDOW_HEIGHT;

/* Main program */
function Breakout() {
  // sets up initial variables to be modified later
  let gw = GWindow(GWINDOW_WIDTH, GWINDOW_HEIGHT);
  let paddle = null;
  let ballX, ballY = 0;
  let chances = 3;
  let numBricks = N_ROWS * N_COLS;
  let playing = true;
  
  // sets up label window to display remaining chances
  let labelGW = GWindow(LABEL_GW_WIDTH, LABEL_GW_HEIGHT);
  let str = chances + " chances left";
  let chanceLabel = GLabel(str, LABEL_GW_WIDTH/10, 3*LABEL_GW_HEIGHT/5);
  chanceLabel.setFont("24px Helvetica");
  chanceLabel.setColor("Blue");
  labelGW.add(chanceLabel);

  // sets initial ball movement
  let vx = randomReal(MIN_X_VELOCITY, MAX_X_VELOCITY);
  if (randomChance()) {
    vx = -vx;
  }
  let vy = INITIAL_Y_VELOCITY;

  // functions to carry out the game
  setUpBricks();
  createMovingPaddle();
  createBouncingBall();
  
  // sets up the bricks
  function setUpBricks(){
    for (let r = 0; r < N_ROWS; r++){
      for (let c = 0; c < N_COLS; c++){
        let brick = GRect(brickXInit + (BRICK_WIDTH * c) + (BRICK_SEP * c), brickYInit + (BRICK_HEIGHT * r) + (BRICK_SEP * r), BRICK_WIDTH, BRICK_HEIGHT);
        brick.setFilled(true);
        switch(r){
          case 0: brick.setColor("Red"); break;
          case 1: brick.setColor("Red"); break;
          case 2: brick.setColor("Orange"); break;
          case 3: brick.setColor("Orange"); break;
          case 4: brick.setColor("Green"); break;
          case 5: brick.setColor("Green"); break;
          case 6: brick.setColor("Cyan"); break;
          case 7: brick.setColor("Cyan"); break;
          case 8: brick.setColor("Blue"); break;
          case 9: brick.setColor("Blue"); break;
        }
        if (playing){
          gw.add(brick);
        }
      }
    }
  }

  // creates paddle that can move horizontally across window
  function createMovingPaddle(){ 
    // sets up initial stationary paddle
    let paddleX = 0;
    function setUpPaddle(){
      paddleX = (GWINDOW_WIDTH / 2) - (PADDLE_WIDTH / 2);
      paddle = GRect(paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
      paddle.setFilled(true);
      if (playing){
      gw.add(paddle);
      }
    }

    setUpPaddle();
    
    // controls paddle movement
    let moveAction = function(e){
      gw.remove(paddle);
      paddle = GRect(paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
      paddle.setFilled(true);
      if (e.getX() < 0){
        paddleX = 0;
      } else if (e.getX() > GWINDOW_WIDTH - PADDLE_WIDTH){
        paddleX = GWINDOW_WIDTH - PADDLE_WIDTH;
      } else {
        paddleX = e.getX();
      }
      if (playing){
        gw.add(paddle);
      }
    };
    gw.addEventListener("mousemove", moveAction);
  }

  // creates ball that moves through window and collides with objects
  function createBouncingBall(){
    // sets up initial stationary ball
    let ball = null;
    function setUpBall(){
      ballX = (GWINDOW_WIDTH / 2) - (BALL_SIZE / 2);
      ballY = (GWINDOW_HEIGHT / 2) - (BALL_SIZE / 2);
      ball = GOval(ballX, ballY, BALL_SIZE, BALL_SIZE);
      ball.setFilled(true);
      if (playing){
        gw.add(ball);
      }
    }

    setUpBall();

    // controls ball movement after initial click
    let clickAction = function(e){
      function step(){
        ball.move(vx,vy);
        ballX += vx;
        ballY += vy;

        // checks for collisions with walls, paddle, or bricks
        if (ballX <= 0 || ballX + BALL_SIZE >= GWINDOW_WIDTH){
          vx = -vx;
        }
        if (ballY <= 0){
          vy = -vy;
        }
        if (ballY + BALL_SIZE >= GWINDOW_HEIGHT){
          fallThroughBottom();
        }
        handleCollisions();
      }

      // handles case when ball hits bottom edge of window
      function fallThroughBottom(){
        clearInterval(timer);
        chances--;
        chanceLabel.setLabel(chances + " chances left");
        gw.remove(ball);
          
        if (chances === 0 && numBricks !== 0){
          playing = false;
          gw.removeAll();
          let endLabel = GLabel("GAME OVER!", 65, 100);
          endLabel.setFont("36px Helvetica");
          endLabel.setColor("Red");
          gw.add(endLabel);
        } else {
          gw.remove(ball);
          setUpBall();
        }
      }

      let timer = setInterval(step, TIME_STEP);
      if (playing){
        gw.add(ball);
      }
    };
    
    gw.addEventListener("click", clickAction);
  }

  // deals with collisions
  function handleCollisions(){
    // sees if ball collides with anything at point (x,y)
    function getCollidingObject(x,y){
      return gw.getElementAt(x, y);
    }

    // checks the four "corners" of the ball for collisions
    function checkCollisions(){
      if (collider === null){
        collider = getCollidingObject(ballX + BALL_SIZE, ballY);
      }
      if (collider === null){
        collider = getCollidingObject(ballX + BALL_SIZE, ballY + BALL_SIZE);
      }
      if (collider === null){
        collider = getCollidingObject(ballX, ballY + BALL_SIZE);
      }
    }

    let collider = getCollidingObject(ballX, ballY);
    checkCollisions();
  
    // removes object hit if collider is a brick
    if (collider === paddle){
      if (vy > 0){
        vy = -vy;
      } else {
        // acts like a chance was lost
        fallThroughBottom();
      }
    } else {
      if (collider !== null){
        vy = -vy;
        gw.remove(collider);
        numBricks--;
        if (numBricks === 0){
          playing = false;
          gw.removeAll();
          let winLabel = GLabel("YOU WON!", 65, 100);
          winLabel.setFont("36px Helvetica");
          winLabel.setColor("Green");
          gw.add(winLabel);
        }
      }
    }
  }
}
