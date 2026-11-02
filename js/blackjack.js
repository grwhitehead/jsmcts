/*
 * MIT License
 *
 * Copyright (c) 2022-2023 Greg Whitehead
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function(exports, require){

const mcts = require('mcts');


function handtotal(array) {
    var t = 0;
    var a = 0;
    for (var i = 0; i < array.length; i++) {
        t += array[i];
        if (array[i] == 1) {
            a = 1;
        }
    }
    if (a > 0 && t < 12) {
        t += 10;
    } else {
        a = 0;
    }
    return [t,a];
}


exports.ActionEnum = {
    HIT: 1,
    STAND: 2,
    DOUBLE: 3,
    SPLIT: 4
};

exports.Action = function(v) {
    mcts.Action.call(this);

    this.v = v;
};

exports.Action.prototype = Object.create(mcts.Action.prototype);

exports.Action.prototype.toString = function() {
    var s;
    if (this.v == exports.ActionEnum.HIT) {
        s = "HIT";
    } else if (this.v == exports.ActionEnum.STAND) {
        s = "STAND";
    } else if (this.v == exports.ActionEnum.DOUBLE) {
        s = "DOUBLE";
    } else if (this.v == exports.ActionEnum.SPLIT) {
        s = "SPLIT";
    }
    return s;
};

defaultDeck = [
    1,2,3,4,5,6,7,8,9,10,10,10,10,
    1,2,3,4,5,6,7,8,9,10,10,10,10,
    1,2,3,4,5,6,7,8,9,10,10,10,10,
    1,2,3,4,5,6,7,8,9,10,10,10,10
];

exports.Game = function(o, rng) {
    if (o instanceof exports.Game) {
        // copy game
        mcts.Game.call(this, o, rng);
        this.deck = mcts.shuffleArray(o.deck.slice(), this.rng);
        this.bet = o.bet;
        this.hand = o.hand.slice();
        this.bet2 = o.bet2;
        this.hand2 = o.hand2.slice();
        this.dealer = o.dealer.slice();
        this.winnings = o.winnings;
    } else {
        // initialize new game
        mcts.Game.call(this, { nondeterministic: true, nPlayers: 1, rewardsFunc: function(g) { return [(2+g.winnings)/4] } });
        this.deck = mcts.shuffleArray(defaultDeck.slice(), this.rng);
        this.bet = 1;
        this.hand = [this.deck.pop(), this.deck.pop()];
        this.bet2 = 0;
        this.hand2 = [];
        this.dealer = [this.deck.pop(), this.deck.pop()];
        this.winnings = 0;
        
        var dealerNatural = (handtotal(this.dealer)[0] == 21);
        var playerNatural = (handtotal(this.hand)[0] == 21);
        if (dealerNatural) {
            if (playerNatural) {
                // push
                this.winner = 0;
            } else {
                // dealer win
                this.winner = 2;
                this.winnings -= this.bet;
            }
        } else if (playerNatural) {
            // player win (3/2 payout)
            this.winner = 1;
            this.winnings += 1.5*this.bet;
        }
        if (this.winner < 0) {
            // neither the player nor the dealar has a natural
            // put the dealer's hole card back in the deck to keep the monte carlo simulation from cheating
            // we'll draw a new hole card (that doesn't make a natural) at the end of the game
            this.deck.unshift(this.dealer.pop());
        }
    }
};

exports.Game.prototype = Object.create(mcts.Game.prototype);

exports.Game.prototype.copyGame = function(rng) {
    return new exports.Game(this, rng);
};

exports.Game.prototype.toString = function() {
    s = "bet: "+this.bet;
    s += "\n"+((this.bet2>0 && this.currentTurn==1)?"->":"")+"hand: "+this.hand+" ("+handtotal(this.hand)[0]+")";
    if (this.bet2 > 0) {
        s += "\nbet2: "+this.bet2;
        s += "\n"+(this.currentTurn==2?"->":"")+"hand2: "+this.hand2+" ("+handtotal(this.hand2)[0]+")";
    }
    if (this.winner >= 0) {
        s += "\ndealer: "+this.dealer+" ("+handtotal(this.dealer)[0]+")";
    } else {
        s += "\ndealer: "+this.dealer[0]+",*";
    }
    s += "\n"+mcts.Game.prototype.toString.call(this);
    if (this.winner >= 0) {
        s += "\nwinnings "+this.winnings;
    }
    return s;
};

exports.Game.prototype.allActions = function() {
    var as = [];
    as.push(new exports.Action(exports.ActionEnum.STAND));
    if (this.currentTurn == 1) {
        if (this.bet2 == 0) {
            // unsplit hand
            if (this.hand.length == 2) {
                if (this.hand[0] == this.hand[1]) {
                    as.push(new exports.Action(exports.ActionEnum.SPLIT));
                }
                as.push(new exports.Action(exports.ActionEnum.DOUBLE));
            }
            as.push(new exports.Action(exports.ActionEnum.HIT));
        } else {
            if (this.hand.length == 2) {
                as.push(new exports.Action(exports.ActionEnum.DOUBLE));
            }
            as.push(new exports.Action(exports.ActionEnum.HIT));
        }
    } else if (this.currentTurn == 2 && this.bet2 > 0) {
        if (this.hand2.length == 2) {
            as.push(new exports.Action(exports.ActionEnum.DOUBLE));
        }
        as.push(new exports.Action(exports.ActionEnum.HIT));
    }
    return as;
};

exports.Game.prototype.doAction = function(a) {
    mcts.Game.prototype.doAction.call(this, a);

    if (this.currentTurn == 1) {
        if (a.v == exports.ActionEnum.SPLIT) {
            this.bet2 = 1;
            this.hand2 = [this.hand[1],this.deck.pop()];
            this.hand = [this.hand[0],this.deck.pop()];
            if (this.hand[0] == 1) {
                // split aces are done
                this.currentTurn += 2;
            }
        } else if (a.v == exports.ActionEnum.DOUBLE) {
            this.bet = 2;
            this.hand.push(this.deck.pop());
            this.currentTurn += 1;
        } else if (a.v == exports.ActionEnum.HIT) {
            this.hand.push(this.deck.pop());
            var t = handtotal(this.hand);
            if (t[0] > 21) {
                this.currentTurn += 1;
            }
        } else if (a.v == exports.ActionEnum.STAND) {
            this.currentTurn += 1;
        }
        if (this.currentTurn == 1 || (this.currentTurn == 2 && this.bet2 > 0)) return;
    } else if (this.currentTurn == 2 && this.bet2 > 0) {
        if (a.v == exports.ActionEnum.DOUBLE) {
            this.bet2 = 2;
            this.hand2.push(this.deck.pop());
            this.currentTurn += 1;
        } else if (a.v == exports.ActionEnum.HIT) {
            this.hand2.push(this.deck.pop());
            var t = handtotal(this.hand2);
            if (t[0] > 21) {
                this.currentTurn += 1;
            }
        } else if (a.v == exports.ActionEnum.STAND) {
            this.currentTurn += 1;
        }
        if (this.currentTurn == 2) return;
    }
    // replace the dealer's hole card
    this.dealer.push(this.deck.shift());
    // NOTE: if the deck has been shuffled, as in a copied game used in a mcts trial,
    // we may not get the original dealer's hole card back, so sanity check and make
    // sure the dealer doesn't end up with a natural
    while (handtotal(this.dealer)[0] == 21) {
        // if it makes a natural, throw it away and try again
        this.dealer.pop();
        this.dealer.push(this.deck.shift());
     }
    var tdealer = handtotal(this.dealer);
    while (tdealer[0] < 17) {
        this.dealer.push(this.deck.pop());
        tdealer = handtotal(this.dealer);
    }
    var t = handtotal(this.hand);
    if (t[0] > 21) {
        // player bust
        this.winnings -= this.bet;
    } else if (tdealer[0] > 21) {
        // dealer bust
        this.winnings += this.bet;
    } else if (t[0] > tdealer[0]) {
        // player win
        this.winnings += this.bet;
    } else if (t[0] < tdealer[0]) {
        // dealer win
        this.winnings -= this.bet;
    } else {
        // push
    }
    if (this.bet2 > 0) {
        var t = handtotal(this.hand2);
        if (t[0] > 21) {
            // player bust
            this.winnings -= this.bet2;
        } else if (tdealer[0] > 21) {
            // dealer bust
            this.winnings += this.bet2;
        } else if (t[0] > tdealer[0]) {
            // player win
            this.winnings += this.bet2;
        } else if (t[0] < tdealer[0]) {
            // dealer win
            this.winnings -= this.bet2;
        } else {
            // push
        }
    }
    if (this.winnings > 0) {
        this.winner = 1;
    } else if (this.winnings < 0) {
        this.winner = 2;
    } else {
        this.winner = 0;
    }
};


/*
 * NoBustPlayer
 */
exports.NoBustPlayer = function() {
    mcts.Player.call(this);
};

exports.NoBustPlayer.prototype = Object.create(mcts.Player.prototype);

exports.NoBustPlayer.prototype.getAction = function(g) {
    var t = handtotal(g.hand);
    if (t[0] > 11 && t[1] == 0) {
        // stand on hard 12 or greater
        return new exports.Action(exports.ActionEnum.STAND);
    } else {
        return new exports.Action(exports.ActionEnum.HIT);
    }
};


/*
 * MimicDealerPlayer
 */
exports.MimicDealerPlayer = function() {
    mcts.Player.call(this);
};

exports.MimicDealerPlayer.prototype = Object.create(mcts.Player.prototype);

exports.MimicDealerPlayer.prototype.getAction = function(g) {
    var t = handtotal(g.hand);
    if (t[0] >= 17) {
        return new exports.Action(exports.ActionEnum.STAND);
    } else {
        return new exports.Action(exports.ActionEnum.HIT);
    }
};


/*
 * OptimumPlayer
 *
 * Roger R. Baldwin, Wilbert E. Cantey, Herbert Maisel, and James P. McDermott. The optimum strategy in blackjack. Journal of the American Statistical Association, 51(275):429–429, 1956.
 *
 */
exports.OptimumPlayer = function() {
    mcts.Player.call(this);
};

exports.OptimumPlayer.prototype = Object.create(mcts.Player.prototype);

exports.OptimumPlayer.prototype.getAction = function(g) {
    var dealerfu = g.dealer[0];
    var h = (g.currentTurn == 1)?g.hand:g.hand2;
    var t = handtotal(h);
    if (g.bet2 == 0 && h.length == 2 && h[0] == h[1]) {
        // split
        if (h[0] == 1 || h[0] == 8) {
            return new exports.Action(exports.ActionEnum.SPLIT);
        } else if (h[0] == 9) {
            if ((dealerfu >= 2 && dealerfu <= 6) || dealerfu == 8 || dealerfu == 9) {
                return new exports.Action(exports.ActionEnum.SPLIT);
            }                
        } else if (h[0] == 7) {
            if (dealerfu >= 2 && dealerfu <= 8) {
                return new exports.Action(exports.ActionEnum.SPLIT);
            }                
        } else if (h[0] == 6 || h[0] == 3 || h[0] == 2) {
            if (dealerfu >= 2 && dealerfu <= 7) {
                return new exports.Action(exports.ActionEnum.SPLIT);
            }                
        } else if (h[0] == 4) {
            if (dealerfu == 5) {
                return new exports.Action(exports.ActionEnum.SPLIT);
            }                
        }
    }
    if (t[1] == 0) {
        // hard doubling
        if (h.length == 2) {
            if (t[0] == 11) {
                if (dealerfu >= 2 && dealerfu <= 10) {
                    return new exports.Action(exports.ActionEnum.DOUBLE);
                }
            } else if (t[0] == 10) {
                if (dealerfu >= 2 && dealerfu <= 9) {
                    return new exports.Action(exports.ActionEnum.DOUBLE);
                }
            } else if (t[0] == 9) {
                if (dealerfu >= 2 && dealerfu <= 6) {
                    return new exports.Action(exports.ActionEnum.DOUBLE);
                }
            }
        }
        // hard hitting/standing
        if (dealerfu >= 2 && dealerfu <= 3) {
            if (t[0] >= 13) {
                return new exports.Action(exports.ActionEnum.STAND);
            } else {
                return new exports.Action(exports.ActionEnum.HIT);
            }
        } else if (dealerfu >= 4 && dealerfu <= 6) {
            if (t[0] >= 12) {
                return new exports.Action(exports.ActionEnum.STAND);
            } else {
                return new exports.Action(exports.ActionEnum.HIT);
            }
        } else {
            if (t[0] >= 17) {
                return new exports.Action(exports.ActionEnum.STAND);
            } else {
                return new exports.Action(exports.ActionEnum.HIT);
            }
        }
    } else {
        // soft doubling
        if (h.length == 2) {
            if (t[0] == 18) {
                if (dealerfu >= 4 && dealerfu <= 6) {
                    return new exports.Action(exports.ActionEnum.DOUBLE);
                }
            } else if (t[0] == 17) {
                if (dealerfu >= 3 && dealerfu <= 6) {
                    return new exports.Action(exports.ActionEnum.DOUBLE);
                }
            } else if (t[0] >= 13 && t[0] <= 16) {
                if (dealerfu >= 5 && dealerfu <= 6) {
                    return new exports.Action(exports.ActionEnum.DOUBLE);
                }
            } else if (t[0] == 12) {
                if (dealerfu == 5) {
                    return new exports.Action(exports.ActionEnum.DOUBLE);
                }
            }
        }
        // soft hitting/standing
        if (dealerfu >= 1 && dealerfu <= 8) {
            if (t[0] >= 18) {
                return new exports.Action(exports.ActionEnum.STAND);
            } else {
                return new exports.Action(exports.ActionEnum.HIT);
            }
        } else {
            if (t[0] >= 19) {
                return new exports.Action(exports.ActionEnum.STAND);
            } else {
                return new exports.Action(exports.ActionEnum.HIT);
            }
        }
    }
};


}(typeof exports === 'undefined' ? this.exports_blackjack = {} : exports, typeof exports === 'undefined' ? function(m) { return this['exports_'+m] } : require));
