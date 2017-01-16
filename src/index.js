/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

 /**
 * App ID for the skill
 */
var APP_ID = undefined;//replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

var StackedDeckTrainer = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
StackedDeckTrainer.prototype = Object.create(AlexaSkill.prototype);
StackedDeckTrainer.prototype.constructor = StackedDeckTrainer;

// ----------------------- Override AlexaSkill request and intent handlers -----------------------

StackedDeckTrainer.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

StackedDeckTrainer.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    handleWelcomeRequest(response);
};

StackedDeckTrainer.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

/**
 * override intentHandlers to map intent handling functions.
 */
StackedDeckTrainer.prototype.intentHandlers = {
    "OneshotCardIntent": function (intent, session, response) {
        handleOneshotCardRequest(intent, session, response);
    },

    "OneshotDPositionIntent": function (intent, session, response) {
        handleOneshotPositionRequest(intent, session, response);
    },

    "DialogDeckIntent": function (intent, session, response) {
        // Determine if this turn is for deck, for card, for position, or an error.
        // We could be passed  s with values, no slots, slots with no value.
        var deckSlot = intent.slots.Deck;
        var cardSlot = intent.slots.Card;
        var positionSlot = intent.slots.Position;

        if (deckSlot && deckSlot.value) {
            handleDeckDialogRequest(intent, session, response);
        } else if (cardSlot && cardSlot.value) {
            handleCardDialogRequest(intent, session, response);
        } else if (positionSlot && positionSlot.value) {
            handlePositionDialogRequest(intent, session, response);
        } else {
            handleNoSlotDialogRequest(intent, session, response);
        }
    },

    "AvailableDecksIntent": function (intent, session, response) {
        handleAvailableDecksRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        handleHelpRequest(response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

// -------------------------- Stacked Deck Trainer Domain Specific Business Logic --------------------------

// set decks
var DECKS = {
    'new deck': {
      name:"New Deck",
      order:[
        "Ace of Clubs",
        "Two of Clubs",
        "Three of Clubs",
        "Four of Clubs",
        "Five of Clubs",
        "Six of Clubs",
        "Seven of Clubs",
        "Eight of Clubs",
        "Nine of Clubs",
        "Ten of Clubs",
        "Jack of Clubs",
        "Queen of Clubs",
        "King of Clubs",
        "Ace of Hearts",
        "Two of Hearts",
        "Three of Hearts",
        "Four of Hearts",
        "Five of Hearts",
        "Six of Hearts",
        "Seven of Hearts",
        "Eight of Hearts",
        "Nine of Hearts",
        "Ten of Hearts",
        "Jack of Hearts",
        "Queen of Hearts",
        "King of Hearts",
        "Ace of Diamonds",
        "Two of Diamonds",
        "Three of Diamonds",
        "Four of Diamonds",
        "Five of Diamonds",
        "Six of Diamonds",
        "Seven of Diamonds",
        "Eight of Diamonds",
        "Nine of Diamonds",
        "Ten of Diamonds",
        "Jack of Diamonds",
        "Queen of Diamonds",
        "King of Diamonds",
        "Ace of Spades",
        "Two of Spades",
        "Three of Spades",
        "Four of Spades",
        "Five of Spades",
        "Six of Spades",
        "Seven of Spades",
        "Eight of Spades",
        "Nine of Spades",
        "Ten of Spades",
        "Jack of Spades",
        "Queen of Spades",
        "King of Spades"
      ]
    },
    'tamariz': {
      name:"Tamariz",
      order:[
        "Ace of Clubs",
        "Two of Clubs",
        "Three of Clubs",
        "Four of Clubs",
        "Five of Clubs",
        "Six of Clubs",
        "Seven of Clubs",
        "Eight of Clubs",
        "Nine of Clubs",
        "Ten of Clubs",
        "Jack of Clubs",
        "Queen of Clubs",
        "King of Clubs",
        "Ace of Hearts",
        "Two of Hearts",
        "Three of Hearts",
        "Four of Hearts",
        "Five of Hearts",
        "Six of Hearts",
        "Seven of Hearts",
        "Eight of Hearts",
        "Nine of Hearts",
        "Ten of Hearts",
        "Jack of Hearts",
        "Queen of Hearts",
        "King of Hearts",
        "Ace of Diamonds",
        "Two of Diamonds",
        "Three of Diamonds",
        "Four of Diamonds",
        "Five of Diamonds",
        "Six of Diamonds",
        "Seven of Diamonds",
        "Eight of Diamonds",
        "Nine of Diamonds",
        "Ten of Diamonds",
        "Jack of Diamonds",
        "Queen of Diamonds",
        "King of Diamonds",
        "Ace of Spades",
        "Two of Spades",
        "Three of Spades",
        "Four of Spades",
        "Five of Spades",
        "Six of Spades",
        "Seven of Spades",
        "Eight of Spades",
        "Nine of Spades",
        "Ten of Spades",
        "Jack of Spades",
        "Queen of Spades",
        "King of Spades"
      ]
    },
    'aronson': {
      name:"Aronson",
      order:[
        "Ace of Clubs",
        "Two of Clubs",
        "Three of Clubs",
        "Four of Clubs",
        "Five of Clubs",
        "Six of Clubs",
        "Seven of Clubs",
        "Eight of Clubs",
        "Nine of Clubs",
        "Ten of Clubs",
        "Jack of Clubs",
        "Queen of Clubs",
        "King of Clubs",
        "Ace of Hearts",
        "Two of Hearts",
        "Three of Hearts",
        "Four of Hearts",
        "Five of Hearts",
        "Six of Hearts",
        "Seven of Hearts",
        "Eight of Hearts",
        "Nine of Hearts",
        "Ten of Hearts",
        "Jack of Hearts",
        "Queen of Hearts",
        "King of Hearts",
        "Ace of Diamonds",
        "Two of Diamonds",
        "Three of Diamonds",
        "Four of Diamonds",
        "Five of Diamonds",
        "Six of Diamonds",
        "Seven of Diamonds",
        "Eight of Diamonds",
        "Nine of Diamonds",
        "Ten of Diamonds",
        "Jack of Diamonds",
        "Queen of Diamonds",
        "King of Diamonds",
        "Ace of Spades",
        "Two of Spades",
        "Three of Spades",
        "Four of Spades",
        "Five of Spades",
        "Six of Spades",
        "Seven of Spades",
        "Eight of Spades",
        "Nine of Spades",
        "Ten of Spades",
        "Jack of Spades",
        "Queen of Spades",
        "King of Spades"
      ]
    },
    'maigret': {
      name:"Maigret",
      order:[
        "Ace of Clubs",
        "Two of Clubs",
        "Three of Clubs",
        "Four of Clubs",
        "Five of Clubs",
        "Six of Clubs",
        "Seven of Clubs",
        "Eight of Clubs",
        "Nine of Clubs",
        "Ten of Clubs",
        "Jack of Clubs",
        "Queen of Clubs",
        "King of Clubs",
        "Ace of Hearts",
        "Two of Hearts",
        "Three of Hearts",
        "Four of Hearts",
        "Five of Hearts",
        "Six of Hearts",
        "Seven of Hearts",
        "Eight of Hearts",
        "Nine of Hearts",
        "Ten of Hearts",
        "Jack of Hearts",
        "Queen of Hearts",
        "King of Hearts",
        "Ace of Diamonds",
        "Two of Diamonds",
        "Three of Diamonds",
        "Four of Diamonds",
        "Five of Diamonds",
        "Six of Diamonds",
        "Seven of Diamonds",
        "Eight of Diamonds",
        "Nine of Diamonds",
        "Ten of Diamonds",
        "Jack of Diamonds",
        "Queen of Diamonds",
        "King of Diamonds",
        "Ace of Spades",
        "Two of Spades",
        "Three of Spades",
        "Four of Spades",
        "Five of Spades",
        "Six of Spades",
        "Seven of Spades",
        "Eight of Spades",
        "Nine of Spades",
        "Ten of Spades",
        "Jack of Spades",
        "Queen of Spades",
        "King of Spades"
      ]
    },
};

function handleWelcomeRequest(response) {
    var whichDeckPrompt = "Which deck do we want to use?",
        speechOutput = {
            speech: "<speak>Welcome to the Stacked Deck Trainer.",
                + whichDeckPrompt
                + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        },
        repromptOutput = {
            speech: "Once you tell me what stack we will be using, ",
                + "you can ask for the position of specific card in the deck ",
                + "or the name of card at a specific position ",
                + "or switch stacked decks.",
                + "You can also ask what stack am I using.",
                + "Also, you can simply open Stacked Deck Trainer and ask a question like, ",
                + "where is the Ace of Hearts in a Tamariz stack? ",
                + "or, name the card at the twenty-seventh position.",
                + "You can set a default stack by saying, set stack to Aronson.",
                + "For a list of currently available stacked decks, ask what decks are available. ",
                + whichDeckPrompt,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

    response.ask(speechOutput, repromptOutput);
}

function handleHelpRequest(response) {
    var repromptText = "Which deck do we want to use?";
    var speechOutput = "You can ask for the position of specific card ",
        + "or the name of card at a specific position",
        + "from one of the stacked decks",
        + "or you can simply open Stacked Deck Trainer and ask a question like, ",
        + "where is the Ace of Hearts in a Tamariz deck? ",
        + "or, name the card at the twenty-seventh position.",
        + "For a list of currently available stacked decks, ask what decks are available. ",
        + "Or you can say exit. ",
        + repromptText;

    response.ask(speechOutput, repromptText);
}

/**
 * Handles the case where the user asked or for, or is otherwise being with available decks
 */
function handleAvailableDecksRequest(intent, session, response) {
    // get city re-prompt
    var repromptText = "Which deck do we want to use?";
    var speechOutput = "Currently, I know the order of these stacked decks: " + getAllDecksText()
        + repromptText;

    response.ask(speechOutput, repromptText);
}

/**
 * Handles the dialog step where the user provides a deck
 */
function handleDeckDialogRequest(intent, session, response) {

    var stackedDeck = getDeckFromIntent(intent, false),
        repromptText,
        speechOutput;
    if (stackedDeck.error) {
        repromptText = "Currently, I know the order of these stacked decks: " + getAllDecksText()
            + "Which deck do we want to use?";
        // if we received a value for the incorrect city, repeat it to the user, otherwise we received an empty slot
        speechOutput = "I'm sorry, I don't know that stack. " + repromptText
        response.ask(speechOutput, repromptText);
        return;
    }

    // if we don't have a card yet, go to card. If we have a card, we perform the final request
    if (session.attributes.card) {
        getFinalCardResponse(stackedDeck, session.attributes.card, response);
    // if we don't have a position yet, go to position. If we have a position, we perform the final request
    } else if (session.attributes.position) {
        getFinalPositionResponse(stackedDeck, session.attributes.position, response);
    } else {
        // set deck in session and prompt for card or position
        session.attributes.deck = stackedDeck;
        speechOutput = "From the " + stackedDeck.name +" stack, name a position or name of card.";
        repromptText = "Name a position or name of card for the " + stackedDeck.name + " stack.";

        response.ask(speechOutput, repromptText);
    }
}

/**
 * Handles the dialog step where the user provides a card name
 */
function handleCardDialogRequest(intent, session, response) {

    var card = getCardFromIntent(intent, false),
        repromptText,
        speechOutput;

    if (!card) {
        repromptText = "Please try again saying a card name, for example, Ace of Spades. ",
            + "Which card are you looking for?";
        speechOutput = "I'm sorry, I didn't understand that card name. " + repromptText;

        response.ask(speechOutput, repromptText);
        return;
    }

    // if we don't have a deck yet, go to deck. If we have a deck, we perform the final request
    if (session.attributes.deck) {
        getFinalCardResponse(session.attributes.deck, card, response);
    } else {
        // set card in session and prompt for deck
        session.attributes.card = card;
        speechOutput = "For which deck?";
        repromptText = "Which deck are you looking in?";

        response.ask(speechOutput, repromptText);
    }
}

/**
 * Handles the dialog step where the user provides a card position
 */
function handlePositionDialogRequest(intent, session, response) {

    var cardPosition = getPositionFromIntent(intent, false),
        repromptText,
        speechOutput;

    if (!cardPosition) {
        repromptText = "Please try again saying a card position, for example, the 22nd position. ",
            + "Which position are you looking for?";
        speechOutput = "I'm sorry, I didn't understand that card position. " + repromptText;

        response.ask(speechOutput, repromptText);
        return;
    }

    // if we don't have a deck yet, go to deck. If we have a deck, we perform the final request
    if (session.attributes.deck) {
        getFinalDeckResponse(session.attributes.deck, cardPosition, response);
    } else {
        // set city in session and prompt for date
        session.attributes.position = cardPosition;
        speechOutput = "For which deck?";
        repromptText = "Which deck are you looking in?";

        response.ask(speechOutput, repromptText);
    }
}

/**
 * Handle no slots, or slot(s) with no values.
 * In the case of a dialog based skill with multiple slots,
 * when passed a slot with no value, we cannot have confidence
 * it is the correct slot type so we rely on session state to
 * determine the next turn in the dialog, and reprompt.
 */
function handleNoSlotDialogRequest(intent, session, response) {
    if (session.attributes.deck) {
        // get card name/position re-prompt
        var repromptText = "Please try again saying a card name, like the Queen of Hearts, ",
          + "or a card position, like the 11th position.";
        var speechOutput = repromptText;

        response.ask(speechOutput, repromptText);
    } else {
        // get deck re-prompt
        handleAvailableDecksRequest(intent, session, response);
    }
}

/**
 * This handles a one-shot interaction, where the user utters a phrase like:
 * 'Alexa, open Stacked Deck Trainer and get card for the Tamariz'.
 * If there is an error in a slot, this will guide the user to the dialog approach.
 */
function handleOneshotCardRequest(intent, session, response) {

    // Determine deck, using default if none provided
    var stackedDeck = getDeckFromIntent(intent, true),
        repromptText,
        speechOutput;
    if (stackedDeck.error) {
        // invalid deck. move to the dialog
        var repromptText = "Currently, I know the order of these stacked decks: " + getAllDecksText()
            + "Which deck do we want to use?";
        // if we received a value for the incorrect deck, repeat it to the user, otherwise we received an empty slot
        speechOutput = "I'm sorry, I don't know that stack. " + repromptText;

        response.ask(speechOutput, repromptText);
        return;
    }

    // Determine custom card
    var card = getCardFromIntent(intent);
    if (!card) {
        // Invalid date. set card in session
        session.attributes.card = card;
        repromptText = "Please try again saying a card name, for example, Ten of Diamonds. ",
            + "Which card do we want to locate?";
        speechOutput = "I'm sorry, I didn't understand that card. " + repromptText;

        response.ask(speechOutput, repromptText);
        return;
    }

    // all slots filled, either from the user or by default values. Move to final request
    getFinalCardResponse(deck, card, response);
}

/**
 * This handles the one-shot interaction, where the user utters a phrase like:
 * 'Alexa, open Stacked Deck Trainer and get card for the Tamariz'.
 * If there is an error in a slot, this will guide the user to the dialog approach.
 */
function handleOneshotPositionRequest(intent, session, response) {

    // Determine deck, using default if none provided
    var stackedDeck = getDeckFromIntent(intent, true),
        repromptText,
        speechOutput;
    if (stackedDeck.error) {
        // invalid deck. move to the dialog
        var repromptText = "Currently, I know the order of these stacked decks: " + getAllDecksText()
            + "Which deck do we want to use?";
        // if we received a value for the incorrect deck, repeat it to the user, otherwise we received an empty slot
        speechOutput = "I'm sorry, I don't know that stack. " + repromptText;

        response.ask(speechOutput, repromptText);
        return;
    }

    // Determine custom position
    var cardPosition = getPositionFromIntent(intent);
    if (!cardPosition) {
        // Invalid position. set position in session
        session.attributes.card = cardName;
        repromptText = "Please try again saying a card location, for example, the 32nd position ",
            + "What location do we want to discover?";
        speechOutput = "I'm sorry, I didn't understand that location. " + repromptText;

        response.ask(speechOutput, repromptText);
        return;
    }

    // all slots filled, either from the user or by default values. Move to final request
    getFinalPositionResponse(deck, cardPosition, response);
}

/**
 * Both the one-shot and dialog based paths lead to this method to issue the request, and
 * respond to the user with the final answer.
 */
function getFinalCardResponse(deck, card, response) {
    var cardPos = Nth(deck.order.indexOf(card));

    var speechOutput = "The " + card.name + " is at the " + cardPos + "position in the "
      + deck.name + ". ";

    response.tellWithCard(speechOutput, "StackedDeckTrainer", speechOutput);
}

/**
 * Both the one-shot and dialog based paths lead to this method to issue the request, and
 * respond to the user with the final answer.
 */
function getFinalPositionResponse(deck, position, response) {
    var cardPos = Nth(position);

    var speechOutput = "The " + deck.order[position] + " is at the " + cardPos + "position in the "
      + deck.name + ". ";

    response.tellWithCard(speechOutput, "StackedDeckTrainer", speechOutput);
}

/**
 * Gets the deck from the intent, or returns an error
 */
function getDeckFromIntent(intent, assignDefault) {

    var deckSlot = intent.slots.Deck;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!deckSlot || !deckSlot.value) {
        if (!assignDefault) {
            return {
                error: true
            }
        } else {
            // For sample skill, default to New Deck.
            return {
                name: DECKS['new deck'].name,
                order: DECKS['new deck'].order
            }
        }
    } else {
        // lookup the Deck..
        var deckName = deckSlot.value;
        if (DECKS[deckName.toLowerCase()]) {
            return {
                name: DECKS[deckName.toLowerCase()].name,
                order: DECKS[cityName.toLowerCase()].order
            }
        } else {
            return {
                error: true,
                name: deckName
            }
        }
    }
}

/**
 * Gets the card from the intent, or returns an error
 */
function getCardFromIntent(intent, assignDefault) {

    var cardSlot = intent.slots.Card;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!cardSlot || !cardSlot.value) {
        if (!assignDefault) {
            return {
                error: true
            }
        } else {
            // For sample skill, default to Ace of Spades.
            return {
              name: "Ace of Spades"
            };
        }
    } else {
      return {
        name: cardSlot.value;
      };
    }
}

/**
 * Gets the position from the intent, or returns an error
 */
function getPositionFromIntent(intent, assignDefault) {

    var positionSlot = intent.slots.Position;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!positionSlot || !positionSlot.value) {
        if (!assignDefault) {
            return {
                error: true
            }
        } else {
            // For sample skill, default to 1.
            return {
              name: "1"
            };
        }
    } else {
      return {
        name: positionSlot.value.slice(0,-2); //remove suffix
      };
    }
}

function Nth(str) {
  var lastltr = str.substr(-1);
    if (lastltr === "1") {
      return str + "st";
    }

    if (lastltr === "2") {
      return str + "nd";
    }

    if (lastltr === "3") {
      return str + "rd";
    }

    return str + "th";
}

function getAllDecksText() {
    var deckList = '';
    for (var deck in DECKS) {
        deckList += deck.name + ", ";
    }

    return deckList;
}


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var stackedDeckTrainer = new StackedDeckTrainer();
    stackedDeckTrainer.execute(event, context);
};
