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
TidePooler.prototype.intentHandlers = {
    "OneshotDeckIntent": function (intent, session, response) {
        handleOneshotDeckRequest(intent, session, response);
    },

    "DialogDeckIntent": function (intent, session, response) {
        // Determine if this turn is for card, for position, or an error.
        // We could be passed  s with values, no slots, slots with no value.
        var cardSlot = intent.slots.Card;
        var positionSlot = intent.slots.Position;
        if (cardSlot && cardSlot.value) {
            handleCardDialogRequest(intent, session, response);
        } else if (positionSlot && positionSlot.value) {
            handlePositionDialogRequest(intent, session, response);
        } else {
            handleNoSlotDialogRequest(intent, session, response);
        }
    },

    "SupportedDecksIntent": function (intent, session, response) {
        handleSupportedDecksRequest(intent, session, response);
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

// -------------------------- TidePooler Domain Specific Business Logic --------------------------

// set decks
var DECKS = {
    'new deck': {
      name:"The New Deck Stack",
      order:[

      ]
    },
    'tamariz': {
      name:"The Tamariz Stack",
      order:[

      ]
    },
    'aronson': {
      name:"The Aronson Stack",
      order:[

      ]
    },
    'maigret': {
      name:"The Maigret Stack",
      order:[

      ]
    },
};

function handleWelcomeRequest(response) {
    var whichDeckPrompt = "Which deck would you like to learn?",
        speechOutput = {
            speech: "<speak>Welcome to the Stacked Deck Trainer."
                + whichDeckPrompt
                + "</speak>",
            type: AlexaSkill.speechOutputType.SSML
        },
        repromptOutput = {
            speech: "You can ask for the position of specific card "
                + "or the name of card at a specific position"
                + "from one of the stacked decks"
                + "or you can simply open Stacked Deck Trainer and ask a question like, "
                + "where is the Ace of Hearts in a Tameriz stack? "
                + "or, name the card at the twenty-seventh position."
                + "You can set a default stack by saying, set stack to Aronson."
                + "You can also ask what stack am I using."
                + "For a list of currently supported stacked decks, ask what decks are supported. "
                + whichDeckPrompt,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };

    response.ask(speechOutput, repromptOutput);
}

function handleHelpRequest(response) {
    var repromptText = "Which deck would you like to learn?";
    var speechOutput = "You can ask for the position of specific card "
        + "or the name of card at a specific position"
        + "from one of the stacked decks"
        + "or you can simply open Stacked Deck Trainer and ask a question like, "
        + "where is the Ace of Hearts in a Tameriz deck? "
        + "or, name the card at the twenty-seventh position."
        + "You can set a default stack by saying, set stack to Aronson."
        + "You can also ask what stack am I using."
        + "For a list of currently supported stacked decks, ask what decks are supported. "
        + "Or you can say exit. "
        + repromptText;

    response.ask(speechOutput, repromptText);
}

/**
 * Handles the case where the user asked or for, or is otherwise being with supported decks
 */
function handleSupportedDecksRequest(intent, session, response) {
    // get city re-prompt
    var repromptText = "Which deck do we want to use?";
    var speechOutput = "Currently, I know the order of these stacked decks: " + getAllDecksText()
        + repromptText;

    response.ask(speechOutput, repromptText);
}

/**
 * Handles the dialog step where the user provides a card name
 */
function handleCardDialogRequest(intent, session, response) {

    var cardName = getDeckFromIntent(intent, false),
        repromptText,
        speechOutput;

    if (!cardName) {
        repromptText = "Please try again saying a card name, for example, Ace of Spades. "
            + "Which card are you looking for?";
        speechOutput = "I'm sorry, I didn't understand that card name. " + repromptText;

        response.ask(speechOutput, repromptText);
        return;
    }

    // if we don't have a deck yet, go to deck. If we have a deck, we perform the final request
    if (session.attributes.deck) {
        getFinalDeckResponse(session.attributes.deck, cardName, "card", response);
    } else {
        // set city in session and prompt for date
        session.attributes.deck = stackedDeck;
        speechOutput = "For which deck?";
        repromptText = "Which card in " + stackedDeck + " are you looking for?";

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
        repromptText = "Please try again saying a card position, for example, the 22nd position. "
            + "Which position are you looking for?";
        speechOutput = "I'm sorry, I didn't understand that card position. " + repromptText;

        response.ask(speechOutput, repromptText);
        return;
    }

    // if we don't have a deck yet, go to deck. If we have a deck, we perform the final request
    if (session.attributes.deck) {
        getFinalDeckResponse(session.attributes.deck, cardPosition, "position", response);
    } else {
        // set city in session and prompt for date
        session.attributes.deck = stackedDeck;
        speechOutput = "For which deck?";
        repromptText = "Which position in " + stackedDeck + " are you looking for?";

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
        var repromptText = "Please try again saying a card name, like the Queen of Hearts, "
          + "or a card position, like the 11th position.";
        var speechOutput = repromptText;

        response.ask(speechOutput, repromptText);
    } else {
        // get deck re-prompt
        handleSupportedDecksRequest(intent, session, response);
    }
}

/**
 * This handles the one-shot interaction, where the user utters a phrase like:
 * 'Alexa, open Tide Pooler and get tide information for Seattle on Saturday'.
 * If there is an error in a slot, this will guide the user to the dialog approach.
 */
function handleOneshotDeckRequest(intent, session, response) {

    // Determine deck, using default if none provided
    var stackedDeck = getDeckFromIntent(intent, true),
        repromptText,
        speechOutput;
    if (stackedDeck.error) {
        // invalid city. move to the dialog
        var repromptText = "Currently, I know the order of these stacked decks: " + getAllDecksText()
            + "Which deck do we want to use?";
        // if we received a value for the incorrect deck, repeat it to the user, otherwise we received an empty slot
        speechOutput = cityStation.city ? "I'm sorry, I don't have any data for " + stackedDeck.name + ". " + repromptText : repromptText;

        response.ask(speechOutput, repromptText);
        return;
    }

    // Determine custom card or position
    var cardName = getCardFromIntent(intent);
    if (!date) {
        // Invalid date. set city in session and prompt for date
        session.attributes.city = cityStation;
        repromptText = "Please try again saying a day of the week, for example, Saturday. "
            + "For which date would you like tide information?";
        speechOutput = "I'm sorry, I didn't understand that date. " + repromptText;

        response.ask(speechOutput, repromptText);
        return;
    }

    // all slots filled, either from the user or by default values. Move to final request
    getFinalDeckResponse(deck, info, cardOrPosition, response);
}

function getAllDecksText() {
    var deckList = '';
    for (var deck in DECKS) {
        deckList += deck + ", ";
    }

    return deckList;
}


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var stackedDeckTrainer = new StackedDeckTrainer();
    stackedDeckTrainer.execute(event, context);
};
