const elements = {
    game: document.getElementById("game"),
    hand: document.querySelector(".player_hand"),
    message: document.querySelector(".message"),
    slap: document.querySelector(".btn-slap"),
    instructions: document.querySelector(".instructions")
}

let deck = ["2C", "2D", "2H", "2S",
              "3C", "3D", "3H", "3S",
              "4C", "4D", "4H", "4S",
              "5C", "5D", "5H", "5S",
              "6C", "6D", "6H", "6S",
              "7C", "7D", "7H", "7S", 
              "8C", "8D", "8H", "8S",
              "9C", "9D", "9H", "9S",
              "10C", "10D", "10H", "10S",
              "JC", "JD", "JH", "JS",
              "QC", "QD", "QH", "QS",
              "KC", "KD", "KH", "KS",
              "AC", "AD", "AH", "AS"];

let playerHand = []; //["QC", "QD", "9C", "9D", "9H", "9S",];
let dealerHand = []; //["QS", "KD", "7D", "5D", "5H"];
let currentHand = [];
let player0Expected = 0;
let player1Expected = 0;
let player = 0;
let royalBattle = false;
let difficulty = 500; // TODO: ask user for difficulty

const cardFunctions = () => {
        const shuffle = () => {
            let currentIndex = deck.length, temporaryValue, randomIndex;
        
            // while there remain elements to shuffle...
            while (0 !== currentIndex) {
        
                // pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
        
                // and swap it with the current element.
                temporaryValue = deck[currentIndex];
                deck[currentIndex] = deck[randomIndex];
                deck[randomIndex] = temporaryValue;
            }
        };
        const populateDecks = () => {
            playerHand = deck.slice(0, 26);
            dealerHand = deck.slice(26);
        };

        return {
            init: () => {
                shuffle();
                populateDecks();
            },
            getTopCardPlayer: () => {
                const top = playerHand[0];
                playerHand = playerHand.slice(1);
                return top;
            },
            getTopCardDealer: () => {
                const top = dealerHand[0];
                dealerHand = dealerHand.slice(1);
                return top;
            }
        }
}

// get numerical value of card
const cardValue = card => {
    if (/^\d+$/.test(card.charAt(0))) {
        if (card.charAt(0) === "1") {
            return 10;
        } else {
            return parseInt(card.charAt(0));
        }
    } else if (card.charAt(0) === "J") {
        return 11;
    } else if (card.charAt(0) === "Q") {
        return 12;
    } else if (card.charAt(0) === "K") {
        return 13;
    } else if (card.charAt(0) === "A") {
        return 14;
    }
}

// check if card is royal
const isRoyal = card => {
    return !(/^\d+$/.test(card.charAt(0)));
}

cardFunctions().init();

const uiController = () => {
    const placeCard = card => {
        console.log(`player ${player}: ${card}`);
        currentHand.push(card);
        const markup = `
                <img src="cards/${card}.png">
                `;
        elements.hand.innerHTML = "";
        elements.hand.insertAdjacentHTML('beforeend', markup);
        elements.message.textContent = `Player 1 Hand: ${playerHand.length} | Player 2 Hand: ${dealerHand.length} | Current Hand: ${currentHand.length}`;
    };

    return {
        playerUI: () => {
            if (playerHand.length > 0) {
                const card = cardFunctions().getTopCardPlayer();
                placeCard(card);
                if (isRoyal(card) && player0Expected == 0) {
                    royalBattle = true;
                    player1Expected = cardValue(card) - 10;
                    player = 1;
                } else if (isRoyal(card) && player0Expected > 0) {
                    royalBattle = true;
                    player1Expected = cardValue(card) - 10;
                    player0Expected = 0;
                    player = 1;
                }
            }   
        },
        dealerUI: () => {
            if (dealerHand.length > 0) {
                const card = cardFunctions().getTopCardDealer();
                placeCard(card);
                if (isRoyal(card) && player1Expected == 0) {
                    royalBattle = true;
                    player0Expected = cardValue(card) - 10;
                    player = 0;
                } else if (isRoyal(card) && player1Expected > 0) {
                    royalBattle = true;
                    player0Expected = cardValue(card) - 10;
                    player1Expected = 0;
                    player = 0;
                }
            }
        },
        addToDeck: player => {
            if (player === 0) {
                playerHand.push(...currentHand);
                currentHand = [];
                elements.instructions.innerHTML = "";
                elements.instructions.textContent = "Added Current Hand to Player 1";
            } else {
                dealerHand.push(...currentHand);
                currentHand = [];
                elements.instructions.innerHTML = "";
                elements.instructions.textContent = "Added Current Hand to Player 2";
            }
            const markup = `
                <img src="cards/back.png">
                `;
            setTimeout(function() {
                elements.hand.innerHTML = "";
                elements.hand.insertAdjacentHTML('beforeend', markup)
            }, 500);
            elements.message.textContent = `Player 1 Hand: ${playerHand.length} | Player 2 Hand: ${dealerHand.length} | Current Hand: ${currentHand.length}`;
        },
        checkSlap: () => {
            if (currentHand.length >= 2) {
                if (cardValue(currentHand[currentHand.length - 1]) === cardValue(currentHand[currentHand.length - 2])) {
                    return true;
                }
            } else if (currentHand.length >= 3) {
                if (cardValue(currentHand[currentHand.length - 1]) === cardValue(currentHand[currentHand.length - 3])) {
                    return true;
                }
            }
            return false;
        }
    }
}

document.addEventListener('keyup', (event) => {
    const keyName = event.key;
    if (keyName === 'w' && player === 0) {
        uiController().playerUI();
        if (player0Expected > 1) {
            player0Expected--;

        } else {
            player0Expected = 0;
            player = 1;
        }
        console.log(`player0Expected: ${player0Expected} | player1Expected: ${player1Expected}`);
        if (player0Expected == 0 && player1Expected == 0 && royalBattle) {
            royalBattle = false;
            uiController().addToDeck(1);
        }
    }
});

document.addEventListener('keyup', (event) => {
    const keyName = event.keyCode;
    if (keyName === 38 && player === 1) {
        uiController().dealerUI();
        if (player1Expected > 1) {
            player1Expected--;
        } else {
            player1Expected = 0;
            player = 0;
        }
        console.log(`player0Expected: ${player0Expected} | player1Expected: ${player1Expected}`);
        if (player0Expected == 0 && player1Expected == 0 && royalBattle) {
            royalBattle = false;
            uiController().addToDeck(0);
        }
    }
});

document.addEventListener('keyup', (event) => {
    const keyName = event.key;
    if (keyName === 's') {
        if (uiController().checkSlap()) {
            uiController().addToDeck(0);
        } else {
            console.log("BURN");
        }
    }
});

document.addEventListener('keyup', (event) => {
    const keyName = event.keyCode;
    if (keyName === 40) {
        if (uiController().checkSlap()) {
            uiController().addToDeck(1);
        } else {
            console.log("BURN");
        }
    }
});