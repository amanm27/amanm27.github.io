/*
 * File: HangKarel.js
 * ------------------
 * This program plays a version of the classic Hangman game in which your
 * mission is to save Karel from being hung.
 * 
 * Author: Aman Malhotra (amanm27@stanford.edu)
 * 
 * Last modified: Friday, 10/18/19 4:07 pm
 * 
 */

/* Constants */
const GWINDOW_WIDTH = 500;                        /* Width of the graphics window        */
const GWINDOW_HEIGHT = 300;                       /* Height of the graphics window       */
const LETTER_BASELINE = 10;                       /* Distance from bottom to the letters */
const LETTER_POINTSIZE = 18;                      /* Font size used for letter buttons   */
const WORD_BASELINE = 45;                         /* Inset from bottom to secret word    */
const WORD_POINTSIZE = 36;                        /* Font size for the secret word       */
const MESSAGE_BASELINE = 110;                     /* Inset from bottom to message area   */
const MESSAGE_POINTSIZE = 60;                     /* Font size for messages              */
const MAX_INCORRECT_GUESSES = 7;                  /* Number of incorrect guesses allowed */
const INCORRECT_COLOR = "#FF9999";                /* Color used for incorrect guesses    */
const CORRECT_COLOR = "#009900";                  /* Color used to mark correct guesses  */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";    /* Letters in the alphabet  */

/* Constants that define the Karel image */
const KAREL_IMAGE_TOP = 20;                             /* Inset from top to Karel image       */
const BODY_WIDTH = 60;                                  /* Width of Karel's body               */
const BODY_HEIGHT = 80;                                 /* Height of Karel's body              */
const BODY_COLOR = "#EEEEEE";                           /* Fill color for Karel's body         */
const UPPER_NOTCH = 15;                                 /* Size of the upper right notch       */
const LOWER_NOTCH = 10;                                 /* Size of the lower left notch        */
const SCREEN_WIDTH = 32;                                /* Width of the screen rectangle       */
const SCREEN_HEIGHT = 45;                               /* Height of the screen rectangle      */
const SCREEN_INSET_X = 13;                              /* Inset from left to the screen       */
const SCREEN_INSET_Y = 12;                              /* Inset from top to the screen        */
const SLOT_WIDTH = 15;                                  /* Horizontal length of the disk slot  */
const SLOT_INSET_X = 30;                                /* Inset from left to the disk slot    */
const SLOT_INSET_Y = 68;                                /* Inset from top to the disk slot     */
const LEFT_LEG_INSET_Y = 55;                            /* Inset from top to the left leg      */
const RIGHT_LEG_INSET_X = 24;                           /* Inset from left to the right leg    */
const LEG_BREADTH = 8;                                  /* Breadth across each leg segment     */
const LEG_LENGTH = 20;                                  /* Length of each leg segment          */
const FOOT_BREADTH = 8;                                 /* Breadth across each foot segment    */
const FOOT_LENGTH = 20;                                 /* Length of each foot (overlaps leg)  */
const KAREL_X = (GWINDOW_WIDTH / 2) - (BODY_WIDTH / 2); /* X-coordinate of Karel image */

/* Main program below */

// executes the game
function HangKarel(){
   let gw = GWindow(GWINDOW_WIDTH, GWINDOW_HEIGHT);
   let numWords = HANGKAREL_WORDS.length;
   let secret = HANGKAREL_WORDS[randomInteger(0, numWords - 1)];
   let mysteryWord = "";
   let mysteryWordLabel = GLabel("", 0, 0);
   mysteryWord = createHiddenWord(secret, mysteryWord);
   mysteryWordLabel = updateWordAppearance(mysteryWord);
   gw.add(mysteryWordLabel);
   displayClickableLetters(gw, secret, mysteryWord, mysteryWordLabel);
}

// displays clickable letters and handles click cases
function displayClickableLetters(gw, secret, mysteryWord, mysteryWordLabel){

   for (let i = 0; i < ALPHABET.length; i++){
      let letterX = ((GWINDOW_WIDTH/2) - LETTER_POINTSIZE * (ALPHABET.length/2 - i) + LETTER_POINTSIZE*2/9); // last term accounts for difference in letter height/width to make letters look centered
      let letterY = GWINDOW_HEIGHT - LETTER_BASELINE;
      let letter = GLabel(ALPHABET.substring(i,i+1), letterX, letterY);
      letter.setFont(LETTER_POINTSIZE + "px Courier");
      letter.setColor("Black");
      gw.add(letter);
   }

   let currentLetter = "";
   let numGuesses = MAX_INCORRECT_GUESSES;
   let numCorrect = 0;
   let playing = true;

   let clickAction = function(e){
      if (!playing){
         return;
      }
      if (e.getY() >= GWINDOW_HEIGHT - LETTER_BASELINE - LETTER_POINTSIZE){
         let currentObject = gw.getElementAt(e.getX(), e.getY());
         currentLetter = currentObject.getLabel();
         if (secret.indexOf(currentLetter) !== -1){
            currentObject.setColor(CORRECT_COLOR);
            for (let i = 0; i < secret.length; i++){
               if (secret.charAt(i) == currentLetter){
                  mysteryWord = mysteryWord.substring(0, i) + currentLetter + mysteryWord.substring(i +1);
                  numCorrect++;
               }
            }
            mysteryWordLabel.setLabel(mysteryWord);

            if (numCorrect === secret.length){
               playing = false;
               winDisplay(gw);
            }
         } else {
            currentObject.setColor(INCORRECT_COLOR);
            numGuesses--;
            switch(numGuesses){
               case 6: display6(gw); break;
               case 5: display5(gw); break;
               case 4: display4(gw); break;
               case 3: display3(gw); break;
               case 2: display2(gw); break;
               case 1: display1(gw); break;
               case 0: 
                  playing = false;
                  display0(gw, secret);
                  break;
            }
         }
      }
   }

   gw.addEventListener("click", clickAction);
}

// displays hidden word
function createHiddenWord(secret, mysteryWord){
   for (let i = 0; i < secret.length; i++){
      mysteryWord += "-";
   }
   return mysteryWord;
}

// updates word appearance after each guess
function updateWordAppearance(mysteryWord){
   let mysteryWordX = (GWINDOW_WIDTH/2) - (3*WORD_POINTSIZE/5) * (mysteryWord.length/2); // 3/5 coefficient to center
   let mysteryWordY = GWINDOW_HEIGHT - WORD_BASELINE;
   mysteryWordLabel = GLabel(mysteryWord, mysteryWordX, mysteryWordY);
   mysteryWordLabel.setFont(WORD_POINTSIZE + "px Courier");
   mysteryWordLabel.setColor("Black");
   return mysteryWordLabel;
}

// updates display with 6 chances left
function display6(gw){
   let body = GPolygon(KAREL_X, KAREL_IMAGE_TOP);
   body.addEdge(BODY_WIDTH - UPPER_NOTCH, 0);
   body.addEdge(UPPER_NOTCH, UPPER_NOTCH);
   body.addEdge(0, BODY_HEIGHT - UPPER_NOTCH);
   body.addEdge(- BODY_WIDTH + LOWER_NOTCH, 0);
   body.addEdge(- LOWER_NOTCH, - LOWER_NOTCH);
   body.addEdge(0, - BODY_HEIGHT + LOWER_NOTCH);
   body.setFilled(true);
   body.setFillColor(BODY_COLOR);
   gw.add(body);
}

// updates display with 5 chances left
function display5(gw){
   let screen = GRect(KAREL_X + SCREEN_INSET_X, KAREL_IMAGE_TOP + SCREEN_INSET_Y , SCREEN_WIDTH, SCREEN_HEIGHT);
   screen.setFilled(true);
   screen.setFillColor("WHITE");
   gw.add(screen);
}

// updates display with 4 chances left
function display4(gw){
   let slot = GLine(KAREL_X + SLOT_INSET_X, KAREL_IMAGE_TOP + SLOT_INSET_Y, SLOT_WIDTH + KAREL_X + SLOT_INSET_X, KAREL_IMAGE_TOP + SLOT_INSET_Y);
   gw.add(slot);
}

// updates display with 3 chances left
function display3(gw){
   let rightLeg = GRect(KAREL_X + RIGHT_LEG_INSET_X, KAREL_IMAGE_TOP + BODY_HEIGHT, LEG_BREADTH, LEG_LENGTH);
   rightLeg.setFilled(true);
   rightLeg.setFillColor("BLACK");
   gw.add(rightLeg);
}

// updates display with 2 chances left
function display2(gw){
   let rightFoot = GRect(KAREL_X + RIGHT_LEG_INSET_X, KAREL_IMAGE_TOP + BODY_HEIGHT + LEG_LENGTH - FOOT_BREADTH, FOOT_LENGTH, FOOT_BREADTH);
   rightFoot.setFilled(true);
   rightFoot.setFillColor("BLACK");
   gw.add(rightFoot);
}

// updates display with 1 chance left
function display1(gw){
   let leftLeg = GRect(KAREL_X - LEG_LENGTH, KAREL_IMAGE_TOP + LEFT_LEG_INSET_Y, LEG_LENGTH, LEG_BREADTH);
   leftLeg.setFilled(true);
   leftLeg.setFillColor("BLACK");
   gw.add(leftLeg);
}

// updates display with no chances left
function display0(gw, secret){
   let leftFoot = GRect(KAREL_X - LEG_LENGTH, KAREL_IMAGE_TOP + LEFT_LEG_INSET_Y, FOOT_BREADTH, FOOT_LENGTH);
   leftFoot.setFilled(true);
   leftFoot.setFillColor("BLACK");
   gw.add(leftFoot);

   let gameOverLabel = GLabel("GAME OVER!", GWINDOW_WIDTH/6, GWINDOW_HEIGHT - MESSAGE_BASELINE);
   gameOverLabel.setFont(MESSAGE_POINTSIZE + "px Courier");
   gameOverLabel.setColor("Red");
   gw.add(gameOverLabel);
   mysteryWord = secret;
   mysteryWordLabel.setLabel(mysteryWord);
}

// updates display when all letters guessed correctly
function winDisplay(gw){
   let gameWonLabel = GLabel("YOU WON!", 9*GWINDOW_WIDTH/40, GWINDOW_HEIGHT - MESSAGE_BASELINE);
   gameWonLabel.setFont(MESSAGE_POINTSIZE + "px Courier");
   gameWonLabel.setColor("Green");
   gw.add(gameWonLabel);
}
