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


exports.Action = function(i, f, p) {
    mcts.Action.call(this);

    this.movei = i;
    this.from = f;
    this.pos = p;
};

exports.Action.prototype = Object.create(mcts.Action.prototype);

exports.Action.prototype.toString = function() {
    if (this.movei == 0) {
        s = "NO PLAY";
    } else {
        s = ""+(this.from==25?"BAR":this.from)+"->"+(this.pos==0?"OFF":this.pos);
    }
    return s;
};

exports.Game = function(o) {
    if (o instanceof exports.Game) {
        // copy game
        mcts.Game.call(this, o);
        this.track1 = o.track1.slice();
        this.track2 = o.track2.slice();
        this.roll = o.roll.slice();
        this.moves = o.moves.slice();
    } else {
        // initialize new game
        mcts.Game.call(this, { nondeterministic: true, nPlayers: 2 });
        //            off  1              6   7              12  13             18  19             24 bar
        this.track1 = [0,  0, 0, 0, 0, 0, 5,  0, 3, 0, 0, 0, 0,  5, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 2,  0];
        this.track2 = [0,  0, 0, 0, 0, 0, 5,  0, 3, 0, 0, 0, 0,  5, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 2,  0];
        while (true) {
            this.roll = [Math.ceil(6*this.rng.random()), Math.ceil(6*this.rng.random())];
            if (this.roll[0] != this.roll[1]) break;
        }
        this.moves = this.roll.slice();
        this.first = (o && o.first)?o.first:1;
        if (this.first > 0) {
            this.currentPlayer = this.first;
        } else if (this.roll[0] > this.roll[1]) {
            this.currentPlayer = 1;
        } else {
            this.currentPlayer = 2;
        }
    }
};

exports.Game.prototype = Object.create(mcts.Game.prototype);

exports.Game.prototype.copyGame = function() {
    return new exports.Game(this);
};

exports.Game.prototype.toString = function() {
    var s = "|"
    for (var i = 13; i < 25; i++) {
        if (this.track1[i] > 0) {
            s += "("+this.track1[i]+")";
        } else if (this.track2[25-i] > 0) {
            s += "["+this.track2[25-i]+"]";
        } else {
            s += " . ";
        }
        if (i == 18) {
            s += "|";
        }
    }
    s += "|\n";
    if (this.track1[25] > 0) {
        s += "("+this.track1[25]+")";
    }
    if (this.track2[25] > 0) {
        s += "["+this.track2[25]+"]";
    }
    s += "\n|";
    for (var i = 12; i > 0; i--) {
        if (i == 6) {
            s += "|";
        }
        if (this.track1[i] > 0) {
            s += "("+this.track1[i]+")";
        } else if (this.track2[25-i] > 0) {
            s += "["+this.track2[25-i]+"]";
        } else {
            s += " . ";
        }
    }
    s += "|\n";
    s += "\n"+this.roll.join("-")+" (" + this.moves + ")";
    s += "\n"+mcts.Game.prototype.toString.call(this);
    return s;
};

exports.Game.prototype.allActions = function() {
    if (this._actions != null) return this._actions;
    var as = [];
    if (this.currentPlayer == 1) {
        if (this.track1[25] > 0) {
            // move off bar before making other moves
            for (var i = 0; i < this.moves.length; i++) {
                if (i > 0 && this.moves[i] == this.moves[0]) break; // don't generate duplicates for doubles
                if (this.track2[this.moves[i]] < 2) {
                    as.push(new exports.Action(i+1, 25, 25-this.moves[i]));
                }
            }
        } else {
            for (var i = 0; i < this.moves.length; i++) {
                if (i > 0 && this.moves[i] == this.moves[0]) break; // don't generate duplicates for doubles
                for (var j = this.moves[i]+1; j < 25; j++) {
                    if (this.track1[j] > 0 && this.track2[25-(j-this.moves[i])] < 2) {
                        as.push(new exports.Action(i+1, j, j-this.moves[i]));
                    }
                }
            }
            var highestPos = -1;
            for (var i = 1; i < 25; i++) {
                if (this.track1[i] > 0) {
                    highestPos = i;
                }
            }
            if (highestPos < 7) {
                for (var i = 0; i < this.moves.length; i++) {
                    if (i > 0 && this.moves[i] == this.moves[0]) break; // don't generate duplicates for doubles
                    if (this.track1[this.moves[i]] > 0) {
                        as.push(new exports.Action(i+1, this.moves[i], 0));
                    } else if (this.moves[i] > highestPos) {
                        as.push(new exports.Action(i+1, highestPos, 0));
                    }
                }
            }
        }
    } else {
        if (this.track2[25] > 0) {
            // move off bar before making other moves
            for (var i = 0; i < this.moves.length; i++) {
                if (i > 0 && this.moves[i] == this.moves[0]) break; // don't generate duplicates for doubles
                if (this.track1[this.moves[i]] < 2) {
                    as.push(new exports.Action(i+1, 25, 25-this.moves[i]));
                }
            }
        } else {
            for (var i = 0; i < this.moves.length; i++) {
                if (i > 0 && this.moves[i] == this.moves[0]) break; // don't generate duplicates for doubles
                for (var j = this.moves[i]+1; j < 25; j++) {
                    if (this.track2[j] > 0 && this.track1[25-(j-this.moves[i])] < 2) {
                        as.push(new exports.Action(i+1, j, j-this.moves[i]));
                    }
                }
            }
            var highestPos = -1;
            for (var i = 0; i < 25; i++) {
                if (this.track2[i] > 0) {
                    highestPos = i;
                }
            }
            if (highestPos < 7) {
                for (var i = 0; i < this.moves.length; i++) {
                    if (i > 0 && this.moves[i] == this.moves[0]) break; // don't generate duplicates for doubles
                    if (this.track2[this.moves[i]] > 0) {
                        as.push(new exports.Action(i+1, this.moves[i], 0));
                    } else if (this.moves[i] > highestPos) {
                        as.push(new exports.Action(i+1, highestPos, 0));
                    }
                }
            }
        }
    }
    if (as.length == 0) {
        as.push(new exports.Action(0, 0, 0));
    }
    this._actions = as;
    return as;
};

exports.Game.prototype.doAction = function(a) {
    mcts.Game.prototype.doAction.call(this, a);
    if (a.movei > 0) {
        var done = true;
        if (this.currentPlayer == 1) {
            this.track1[a.from] -= 1;
            if (a.pos > 0) {
                if (this.track2[25-a.pos] > 0) {
                    this.track2[25-a.pos] -= 1;
                    this.track2[25] += 1;
                }
                this.track1[a.pos] += 1;
            }
            this.moves.splice(a.movei-1, 1);
            for (var i = 1; i < 25; i++) {
                if (this.track1[25] > 0 || this.track1[i] > 0) {
                    done = false;
                    break;
                }
            }
        } else {
            this.track2[a.from] -= 1;
            if (a.pos > 0) {
                if (this.track1[25-a.pos] > 0) {
                    this.track1[25-a.pos] -= 1;
                    this.track1[25] += 1;
                }
                this.track2[a.pos] += 1;
            }
            this.moves.splice(a.movei-1, 1);
            for (var i = 1; i < 25; i++) {
                if (this.track2[25] > 0 || this.track2[i] > 0) {
                    done = false;
                    break;
                }
            }
        }
        if (done) {
            this.winner = this.currentPlayer;
            return;
        }
        if (this.moves.length > 0) {
            this._actions = null;
            return;
        }
    }
    this._actions = null;
    this.currentTurn++;
    this.currentPlayer = (this.currentPlayer%2)+1
    this.roll = [Math.ceil(6*this.rng.random()), Math.ceil(6*this.rng.random())];
    this.moves = this.roll.slice();
    if (this.roll[0] == this.roll[1]) {
        this.moves.push(this.roll[0]);
        this.moves.push(this.roll[0]);
    }
};


}(typeof exports === 'undefined' ? this.exports_backgammon = {} : exports, typeof exports === 'undefined' ? function(m) { return this['exports_'+m] } : require));
