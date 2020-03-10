/*
 * File: Enigma.js
 * ---------------
 * This program implements a graphical simulation of the Enigma machine.
 * 
 * Author: Aman Malhotra (amanm27@stanford.edu)
 * 
 * Last modified: Friday, 10/25/19 3:05 pm
 * 
 */

"use strict";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* Main program */

function Enigma() {
	let enigmaImage = GImage("EnigmaTopView.png");
	enigmaImage.addEventListener("load", function() {
		let gw = GWindow(enigmaImage.getWidth(), enigmaImage.getHeight());
		gw.add(enigmaImage);
		runEnigmaSimulation(gw);
   });
}

// You are responsible for filling in the rest of the code.  Your
// implementation of runEnigmaSimulation should perform the
// following operations:
//
// 1. Create an object that encapsulates the state of the Enigma machine.
// 2. Create and add graphical objects that sit on top of the image.
// 3. Add listeners that forward mouse events to those objects.

// carries out enigma simulation
function runEnigmaSimulation(gw) {
   
   let enigma = {};

   enigma.keys = createKeyboard(gw);
   enigma.lamps = createLampPanel(gw);
   enigma.rotors = createRotors(gw);

   let mousedownAction = function(e){
	   let obj = gw.getElementAt(e.getX(), e.getY());
	   if (obj !== null && obj.mousedownAction !== undefined){
		   obj.mousedownAction(enigma);
	   }
   };
   gw.addEventListener("mousedown", mousedownAction);

   let mouseUpAction = function(e){
	   let obj = gw.getElementAt(e.getX(), e.getY());
	   if (obj !== null && obj.mouseUpAction !== undefined){
		   obj.mouseUpAction(enigma);
	   }
   };
   gw.addEventListener("mouseup", mouseUpAction);

   let clickAction = function (e) {
	   let obj = gw.getElementAt(e.getX(), e.getY());
	   if (obj !== null && obj.clickAction !== undefined) {
		   obj.clickAction(enigma);
	   }
   };
   gw.addEventListener("click", clickAction);
}

// creates keyboard display
function createKeyboard(gw){
	let keys = [];
	for (let i = 0; i < KEY_LOCATIONS.length; i++){
		let key = GCompound();

		let border = GOval(2*KEY_RADIUS, 2*KEY_RADIUS);
		border.setFilled(true);
		border.setColor(KEY_BORDER_COLOR);
		key.add(border);

		let circle = GOval(KEY_BORDER, KEY_BORDER, 2*(KEY_RADIUS - KEY_BORDER), 2*(KEY_RADIUS - KEY_BORDER));
		circle.setFilled(true);
		circle.setColor(KEY_BGCOLOR);
		key.add(circle);

		let letter = GLabel(ALPHABET.charAt(i), KEY_RADIUS, KEY_RADIUS + KEY_LABEL_DY);
		letter.setFont(KEY_FONT);
		letter.setColor(KEY_BORDER_COLOR);
		let letterWidth = letter.getWidth();
		letter.setLocation(KEY_RADIUS - letterWidth/2, KEY_RADIUS + KEY_LABEL_DY);
		key.add(letter);

		keys.push(key);
		gw.add(key, KEY_LOCATIONS[ALPHABET.charAt(i).charCodeAt(0) - "A".charCodeAt(0)].x - KEY_RADIUS, KEY_LOCATIONS[ALPHABET.charAt(i).charCodeAt(0) - "A".charCodeAt(0)].y - KEY_RADIUS);
		
		key.mousedownAction = function(enigma) {
			letter.setColor(KEY_DOWN_COLOR);

			// handles carrying over across rotors
			let carryToMedium = advanceRotor(enigma.rotors[2]);
			if (carryToMedium){
				let carryToSlow = advanceRotor(enigma.rotors[1]);
				if (carryToSlow){
					advanceRotor(enigma.rotors[0]);	
				}
			}

			let finalOutIndex = executePermutationSequence(enigma, i);

			enigma.lamps[finalOutIndex].label.setColor(LAMP_ON_COLOR);
		}

		key.mouseUpAction = function(enigma) {
			letter.setColor(KEY_UP_COLOR);
			
			let finalOutIndex = executePermutationSequence(enigma, i);

			enigma.lamps[finalOutIndex].label.setColor(LAMP_OFF_COLOR);
		}
	}

	return keys;
}

// creates panel of lamps
function createLampPanel(gw){
	let lamps = [];
	for (let i = 0; i < LAMP_LOCATIONS.length; i++){
		let lamp = GCompound();
		
		let mainLamp = GOval(2*LAMP_RADIUS, 2*LAMP_RADIUS);
		mainLamp.setColor(LAMP_BORDER_COLOR);
		mainLamp.setFilled(true);
		mainLamp.setFillColor(LAMP_BGCOLOR);
		lamp.add(mainLamp);

		let label = GLabel(ALPHABET.charAt(i), LAMP_RADIUS, LAMP_RADIUS + LAMP_LABEL_DY);
		label.setFont(LAMP_FONT);
		label.setColor(LAMP_OFF_COLOR);
		let labelWidth = label.getWidth();
		label.setLocation(LAMP_RADIUS - labelWidth/2, LAMP_RADIUS + LAMP_LABEL_DY);
		lamp.add(label);
		lamp.label = label;

		lamps.push(lamp);
		gw.add(lamp, LAMP_LOCATIONS[ALPHABET.charAt(i).charCodeAt(0) - "A".charCodeAt(0)].x - LAMP_RADIUS, LAMP_LOCATIONS[ALPHABET.charAt(i).charCodeAt(0) - "A".charCodeAt(0)].y - LAMP_RADIUS);
	}

	return lamps;
}

// creates three rotors
function createRotors(gw){
	let rotors = [];
	for (let i = 0; i < ROTOR_LOCATIONS.length; i++){
		let rotor = GCompound();
		rotor.offset = 0;
		
		let mainRotor = GRect(ROTOR_WIDTH, ROTOR_HEIGHT);
		mainRotor.setColor(ROTOR_BGCOLOR);
		mainRotor.setFilled(true);
		rotor.add(mainRotor);

		let label = GLabel(ALPHABET.charAt(rotor.offset), ROTOR_WIDTH/2, ROTOR_HEIGHT/2 + ROTOR_LABEL_DY);
		label.setFont(ROTOR_FONT);
		let labelWidth = label.getWidth();
		label.setLocation(ROTOR_WIDTH/2 - labelWidth/2, ROTOR_HEIGHT/2 + ROTOR_LABEL_DY);
		rotor.add(label);
		rotor.label = label;

		rotor.perm = ROTOR_PERMUTATIONS[i];
		rotor.invPerm = invertKey(rotor.perm);

		rotors.push(rotor);
		gw.add(rotor, ROTOR_LOCATIONS[i].x - ROTOR_WIDTH/2, ROTOR_LOCATIONS[i].y - ROTOR_HEIGHT/2);

		rotor.clickAction = function(enigma) {
			advanceRotor(rotor);
		}
	}

	return rotors;
}

// advances rotor, returns true if carry over necessary and false otherwise
function advanceRotor(rotor){
	let carry = false;
	rotor.offset++;
	if (rotor.offset > 25){
		rotor.offset = 0;
		carry = true;
	}
	rotor.label.setLabel(ALPHABET.charAt(rotor.offset));
	return carry;
}

// applies a given permutation to a given index, taking into account given offset
function applyPermutation(index, permutation, offset){
	// computes the index of the letter after shifting it by the offset, wrapping around if necessary
	let newIndex = index + offset;
	let maxIndex = ALPHABET.length - 1;
	let minIndex = 0;

	if (newIndex > maxIndex){
		newIndex = (newIndex % maxIndex) - 1;
	}
	
	// looks up the character at that index in the permutation string
	let char = permutation.charAt(newIndex);
	
	// returns the index of the resulting character after subtracting the offset, wrapping if necessary
	let finalIndex = ALPHABET.indexOf(char) - offset;

	if (finalIndex < minIndex){
		finalIndex = ALPHABET.length - (-finalIndex % ALPHABET.length);
	}

	finalIndex = permutation.indexOf(ALPHABET.charAt(finalIndex));

	return finalIndex;
}

// returns inverted version of given permutation sequence 
function invertKey(perm){
	let invPerm = "";

	for (let i = 0; i < ALPHABET.length; i++){
		invPerm += ALPHABET.charAt(perm.indexOf(ALPHABET.charAt(i)));
	}

	return invPerm; 
}

// carries out full permutation sequence (fast -> medium -> slow -> reflector -> slow (inverted) -> medium (inverted) -> fast (inverted))
function executePermutationSequence(enigma, i){
	// goes through fast rotor
	let fastInIndex = i;
	let fastPermutation = enigma.rotors[2].perm;
	let fastOffset = enigma.rotors[2].offset;
	let newChar1 = fastPermutation.charAt(applyPermutation(fastInIndex, fastPermutation, fastOffset));
	let fastOutIndex = ALPHABET.indexOf(newChar1);

	// goes through medium rotor
	let mediumInIndex = fastOutIndex;
	let mediumPermutation = enigma.rotors[1].perm;
	let mediumOffset = enigma.rotors[1].offset;
	let newChar2 = mediumPermutation.charAt(applyPermutation(mediumInIndex, mediumPermutation, mediumOffset));
	let mediumOutIndex = ALPHABET.indexOf(newChar2);

	// goes through slow rotor
	let slowInIndex = mediumOutIndex;
	let slowPermutation = enigma.rotors[0].perm;
	let slowOffset = enigma.rotors[0].offset;
	let newChar3 = slowPermutation.charAt(applyPermutation(slowInIndex, slowPermutation, slowOffset));
	let slowOutIndex = ALPHABET.indexOf(newChar3);

	// goes through reflector
	let reflInIndex = slowOutIndex;
	let reflPermutation = REFLECTOR_PERMUTATION;
	let reflOffset = 0;
	let newChar4 = reflPermutation.charAt(applyPermutation(reflInIndex, reflPermutation, reflOffset));
	let reflOutIndex = ALPHABET.indexOf(newChar4);

	// goes through inverted slow rotor
	let invSlowInIndex = reflOutIndex;
	let invSlowPermutation = enigma.rotors[0].invPerm;
	let invSlowOffset = enigma.rotors[0].offset;
	let newChar5 = invSlowPermutation.charAt(applyPermutation(invSlowInIndex, invSlowPermutation, invSlowOffset));
	let invSlowOutIndex = ALPHABET.indexOf(newChar5);

	// goes through inverted medium rotor
	let invMediumInIndex = invSlowOutIndex;
	let invMediumPermutation = enigma.rotors[1].invPerm;
	let invMediumOffset = enigma.rotors[1].offset;
	let newChar6 = invMediumPermutation.charAt(applyPermutation(invMediumInIndex, invMediumPermutation, invMediumOffset));
	let invMediumOutIndex = ALPHABET.indexOf(newChar6);

	// goes through inverted fast rotor
	let invFastInIndex = invMediumOutIndex;
	let invFastPermutation = enigma.rotors[2].invPerm;
	let invFastOffset = enigma.rotors[2].offset;
	let newChar7 = invFastPermutation.charAt(applyPermutation(invFastInIndex, invFastPermutation, invFastOffset));
	let invFastOutIndex = ALPHABET.indexOf(newChar7);

	let finalOutIndex = invFastOutIndex;

	return finalOutIndex;
}