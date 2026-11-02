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
const data = require('pigdata');

exports.Action = function(h) {
    mcts.Action.call(this);

    this.hold = h;
};

exports.Action.prototype = Object.create(mcts.Action.prototype);

exports.Action.prototype.toString = function() {
    return this.hold?"HOLD":"ROLL";
};

exports.Game = function(o, rng) {
    if (o instanceof exports.Game) {
        // copy game
        mcts.Game.call(this, o, rng);
        this.goalScore = o.goalScore;
        this.scores = o.scores.slice();
        this.rolls = o.rolls.map(function(v) { return v.slice() });
        this.totals = o.totals.slice();
    } else {
        // initialize new game
        mcts.Game.call(this, { nondeterministic: true, nPlayers: 2 });
        this.goalScore = (o && o.goalScore)?o.goalScore:100;
        this.scores = [0, 0];
        this.rolls = [[], []];
        this.totals = [0, 0];
    }
};

exports.Game.prototype = Object.create(mcts.Game.prototype);

exports.Game.prototype.copyGame = function(rng) {
    return new exports.Game(this, rng);
};

exports.Game.prototype.toString = function() {
    var s = "player: 1"+(this.currentPlayer==1?"*":"")+" / 2"+(this.currentPlayer==2?"*":"");
    s += "\nrolls: "+this.rolls[0]+" / "+this.rolls[1];
    s += "\ntotal: "+this.totals[0]+" / "+this.totals[1];
    s += "\nscore: "+this.scores[0]+" / "+this.scores[1];
    s += "\n"+mcts.Game.prototype.toString.call(this);
    return s;
};

exports.Game.prototype.allActions = function() {
    var as = [];
    //if (this.scores[this.currentPlayer-1]+this.totals[this.currentPlayer-1] < this.goalScore) {
        as.push(new exports.Action(false));
    //}
    if (this.totals[this.currentPlayer-1] > 0) {
        as.push(new exports.Action(true));
    }
    return as;
};

exports.Game.prototype.doAction = function(a) {
    mcts.Game.prototype.doAction.call(this, a);

    if (a.hold) {
        this.scores[this.currentPlayer-1] += this.totals[this.currentPlayer-1];
        if (this.scores[this.currentPlayer-1] >= this.goalScore) {
            this.winner = this.currentPlayer;
        } else {
            this.currentPlayer = (this.currentPlayer%2)+1;
            this.rolls[this.currentPlayer-1] = [];
            this.totals[this.currentPlayer-1] = 0;
            this.currentTurn++;
        }
    } else {
        var roll = Math.ceil(6*this.rng.random());
        this.rolls[this.currentPlayer-1].push(roll);
        if (roll == 1) {
            this.totals[this.currentPlayer-1] = 0;
            this.currentPlayer = (this.currentPlayer%2)+1;
            this.rolls[this.currentPlayer-1] = [];
            this.totals[this.currentPlayer-1] = 0;
            this.currentTurn++;
        } else {
            this.totals[this.currentPlayer-1] += roll;
        }
    }
};


/*
 * HoldAtNPlayer
 *
 * Dice Games Properly Explained, Reiner Knizia
 * Neller, T. and Clifton G. M. Presser. “Practical Play of the Dice Game Pig.” (2010).
 *
 */
exports.HoldAtNPlayer = function(n) {
    mcts.Player.call(this);

    this.n = n;
};

exports.HoldAtNPlayer.prototype = Object.create(mcts.Player.prototype);

exports.HoldAtNPlayer.prototype.getAction = function(g) {
    if (g.scores[g.currentPlayer-1] + g.totals[g.currentPlayer-1] >= g.goalScore) return new exports.Action(true);
    return new exports.Action(g.totals[g.currentPlayer-1] >= this.n);
};


/*
 * KeepPaceEndRacePlayer
 *
 * Neller, T. and Clifton G. M. Presser. “Practical Play of the Dice Game Pig.” (2010).
 *
 */
exports.KeepPaceEndRacePlayer = function(c, d, e) {
    mcts.Player.call(this);

    this.c = c;
    this.d = d;
    this.e = e;
};

exports.KeepPaceEndRacePlayer.prototype = Object.create(mcts.Player.prototype);

exports.KeepPaceEndRacePlayer.prototype.getAction = function(g) {
    if (g.scores[g.currentPlayer-1] + g.totals[g.currentPlayer-1] >= g.goalScore) return new exports.Action(true);
    var i = g.scores[g.currentPlayer-1];
    var j = g.scores[3-g.currentPlayer-1];
    return new exports.Action(!((i >= (g.goalScore-this.e)) ||
                                (j >= (g.goalScore-this.e)) ||
                                (g.totals[g.currentPlayer-1] < (this.c+Math.round((j-i)/this.d)))));
};


/*
 * OptimalPlayer
 *
 * Neller, T. and Clifton G. M. Presser. “Optimal Play of the Dice Game Pig.” (2004).
 *
 */
exports.OptimalPlayer = function() {
    mcts.Player.call(this);
};

exports.OptimalPlayer.prototype = Object.create(mcts.Player.prototype);

exports.OptimalPlayer.prototype.p_ijk = function(i, j, k) {
    if (i+k >= 100) {
        return 1.0;
    } else if (j >= 100) {
        return 0.0;
    } else {
        return data._p_ijk[i][j][k];
    }
};

exports.OptimalPlayer.prototype.p_ijk_roll = function(i, j, k) {
    return (1.0 - this.p_ijk(j, i, 0)
            + this.p_ijk(i, j, k+2)
            + this.p_ijk(i, j, k+3)
            + this.p_ijk(i, j, k+4)
            + this.p_ijk(i, j, k+5)
            + this.p_ijk(i, j, k+6))/6.0;
};

exports.OptimalPlayer.prototype.p_ijk_hold = function(i, j, k) {
    return 1.0 - this.p_ijk(j, i+k, 0);
};

exports.OptimalPlayer.prototype.getAction = function(g) {
    if (g.scores[g.currentPlayer-1] + g.totals[g.currentPlayer-1] >= g.goalScore) return new exports.Action(true);
    var i = g.scores[g.currentPlayer-1];
    var j = g.scores[3-g.currentPlayer-1];
    var k = g.totals[g.currentPlayer-1];
    
    return new exports.Action((this.p_ijk_roll(i, j, k) <= this.p_ijk_hold(i, j, k)))
};


}(typeof exports === 'undefined' ? this.exports_pig = {} : exports, typeof exports === 'undefined' ? function(m) { return this['exports_'+m] } : require));
