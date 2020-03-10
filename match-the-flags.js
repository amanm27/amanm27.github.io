/**
 * File: match-the-flag.js
 * Author: Aman Malhotra
 * Last modified: Friday, 11/22/19 12:45 am
 * -----------------------
 * Defines the controller for the MatchTheFlag application.
 */
"use strict";

function BootstrapMatchTheFlag(){

   let flagsDisplayed = 0;
   let image1;
   let image2;
   let displayedFlag1 = "";
   let displayedFlag2 = "";
   let inWaitTime = false;

   let flagImageArray = createFlagImageArray();
   createFlagImages(flagImageArray);

   /*
    * Function: shuffle
    * -----------------
    * Generically shuffles the supplied array so
    * that any single permutation of the elements
    * is equally likely.
    */
   function shuffle(array){
      for (let lh = 0; lh < array.length; lh++){
         let rh = lh + Math.floor(Math.random() * (array.length - lh));
         let temp = array[rh];
         array[rh] = array[lh];
         array[lh] = temp;
      }    
   }

   /*
    * Function: createFlagImageArray
    * -----------------
    * Creates shuffled array of length 16, with
    * the name of each country's image file
    * represented twice.
    */
   function createFlagImageArray(){
      let array = [];
      for (let i = 0; i < NUM_COUNTRIES; i++){
         let filename = "images/" + COUNTRIES[i].toLowerCase() + ".png";
         array.push(filename);
         array.push(filename);
      }
      shuffle(array);
      return array;
   }

   /*
    * Function: createFlagImages
    * -----------------
    * Adds the country images to the board.
    */
   function createFlagImages(array){
      for (let i = 0; i < array.length; i++){
         let image = document.createElement("img");
         image.setAttribute("src", COVER_IMAGE);
         image.setAttribute("data-country-image", array[i]);
         image.addEventListener("click", clickAction);

         let board = document.getElementById("board");
         board.appendChild(image);
      }
   }

   /*
    * Function: clickAction
    * -----------------
    * Handles the scenario when a square
    * is clicked; disables the callback
    * functionality in the one-second
    * interval.
    */
   function clickAction(e){
      if (!inWaitTime){
         let image = e.target;

         if (flagsDisplayed === 0){
            image1 = image;
         } else {
            image2 = image;
         }
         
         if (image.getAttribute("src") === COVER_IMAGE){
            image.setAttribute("src", image.getAttribute("data-country-image"));
            if (flagsDisplayed === 0){
               displayedFlag1 = image.getAttribute("src");
            } else {
               displayedFlag2 = image.getAttribute("src");
            }
            flagsDisplayed++;
            if (flagsDisplayed == 2){
               inWaitTime = true;
               console.log(inWaitTime);
               image1.setAttribute("src", displayedFlag1);
               image2.setAttribute("src", displayedFlag2);
               if (displayedFlag1 === displayedFlag2){
                  function f(){
                     image1.setAttribute("src", MATCHED_IMAGE);
                     image2.setAttribute("src", MATCHED_IMAGE);
                     inWaitTime = false;
                  }
                  let timeout = setTimeout(f, 1000);
               } else {
                  function f(){
                     image1.setAttribute("src", COVER_IMAGE);
                     image2.setAttribute("src", COVER_IMAGE);
                     inWaitTime = false;
                  }
                  let timeout = setTimeout(f, 1000); 
               }
               flagsDisplayed = 0;
            }
         } else {
            return;
         }
      }
   }
}

/* Execute the above function when the DOM tree is fully loaded. */
document.addEventListener("DOMContentLoaded", BootstrapMatchTheFlag);
