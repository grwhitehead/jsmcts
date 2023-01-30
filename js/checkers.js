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


exports.Action = function(f, j, p) {
    mcts.Action.call(this);

    this.from = f;
    this.jump = j;
    this.pos = p;
};

exports.Action.prototype = Object.create(mcts.Action.prototype);

exports.Action.prototype.toString = function() {
    s = ""+this.from;
    if (this.jump) {
        s += "-["+this.jump+"]";
    }
    s += "->"+this.pos;
    return s;
};

exports.Game = function(o) {
    if (o instanceof exports.Game) {
        // copy game
        mcts.Game.call(this, o);
        this.board = o.board.slice();
        this.jumping = o.jumping;
        this.lastDrawAvoidingTurn = o.lastDrawAvoidingTurn;
        this.positionCount = new Object(null); for (var i in o.positionCount) { this.positionCount[i] = o.positionCount[i] };
    } else {
        // initialize new game
        mcts.Game.call(this, { nPlayers: 2 });
        this.board = [0, 1, 0, 1, 0, 1, 0, 1,
                      1, 0, 1, 0, 1, 0, 1, 0,
                      0, 1, 0, 1, 0, 1, 0, 1,
                      0, 0, 0, 0, 0, 0, 0, 0,
                      0, 0, 0, 0, 0, 0, 0, 0,
                      2, 0, 2, 0, 2, 0, 2, 0,
                      0, 2, 0, 2, 0, 2, 0, 2,
                      2, 0, 2, 0, 2, 0, 2, 0];
        this.jumping = 0;
        this.lastDrawAvoidingTurn = 0;
        this.positionCount = new Object(null);
    }
};

exports.Game.prototype = Object.create(mcts.Game.prototype);

exports.Game.prototype.copyGame = function() {
    return new exports.Game(this);
};

exports.Game.prototype.toString = function() {
    var s = ""
    for (var i = 0; i < this.board.length; i++) {
        switch (this.board[i]) {
        case 0:
            s += ".";
            break;
        case 1:
            s += "x";
            break;
        case 2:
            s += "o";
            break;
        case 5:
            s += "X";
            break;
        case 6:
            s += "O";
            break;
        }
        if (i%8 == 7) s+= "\n";
    }
    s += "\n"+mcts.Game.prototype.toString.call(this);
    return s;
};

exports.Game.prototype.allActions = function() {
    if (this._actions != null) return this._actions;
    var as = [];
    // must jump if we can
    for (var i = 0; i < this.board.length; i++) {
        if (this.jumping && this.jumping != 1+i) continue;
        var p = this.board[i]&0x3;
        var k = this.board[i]&0x4;
        if (p == this.currentPlayer) {
           var r = Math.floor(i/8);
           var c = i%8;
           if (p == 1 || k > 0) {
               if ((r < 6) && (c > 1) && ((this.board[i+7]&0x3) == (p%2)+1) && (this.board[i+14] == 0)) {
                   as.push(new exports.Action(1+i, 1+i+7, 1+i+14));
               }
               if ((r < 6) && (c < 6) && ((this.board[i+9]&0x3) == (p%2)+1) && (this.board[i+18] == 0)) {
                   as.push(new exports.Action(1+i, 1+i+9, 1+i+18));
               }
           }
           if (p == 2 || k > 0) {
               if ((r > 1) && (c > 1) && ((this.board[i-9]&0x3) == (p%2)+1) && (this.board[i-18] == 0)) {
                   as.push(new exports.Action(1+i, 1+i-9, 1+i-18));
               }
               if ((r > 1) && (c < 6) && ((this.board[i-7]&0x3) == (p%2)+1) && (this.board[i-14] == 0)) {
                   as.push(new exports.Action(1+i, 1+i-7, 1+i-14));
               }
           }
        }
    }
    if (as.length > 0) return as;
    // no jumps, look for regular moves
    for (var i = 0; i < this.board.length; i++) {
        var p = this.board[i]&0x3;
        var k = this.board[i]&0x4;
        if (p == this.currentPlayer) {
            var r = Math.floor(i/8);
            var c = i%8;
            if (p == 1 || k > 0) {
                if ((r < 7) && (c > 0) && (this.board[i+7] == 0)) {
                    as.push(new exports.Action(1+i, null, 1+i+7));
                }
                if ((r < 7) && (c < 7) && (this.board[i+9] == 0)) {
                    as.push(new exports.Action(1+i, null, 1+i+9));
                }
            }
            if (p == 2 || k > 0) {
                if ((r > 0) && (c > 0) && (this.board[i-9] == 0)) {
                    as.push(new exports.Action(1+i, null, 1+i-9));
                }
                if ((r > 0) && (c < 7) && (this.board[i-7] == 0)) {
                    as.push(new exports.Action(1+i, null, 1+i-7));
                }
            }
        }
    }
    this._actions = as;
    return as;
};

exports.Game.prototype.doAction = function(a) {
    mcts.Game.prototype.doAction.call(this, a);
    if (a.jump || (this.board[a.from-1]&0x4) == 0) {
        this.lastDrawAvoidingTurn = this.currentTurn;
        this.positionCount = new Object(null);
    }
    this.board[a.pos-1] = this.board[a.from-1];
    this.board[a.from-1] = 0;
    if (a.jump) {
        this.board[a.jump-1] = 0;
    }
    if (this.board[a.pos-1] == 1 && a.pos-1 > 55) {
        this.board[a.pos-1] = 5;
    } else if (this.board[a.pos-1] == 2 && a.pos-1 < 8) {
        this.board[a.pos-1] = 6;
    } else if (a.jump) {
        this._actions = null;
        this.jumping = a.pos;
        var as = this.allActions();
        if (as.length > 0 && as[0].jump) {
            return;
        }
    }
    this.jumping = 0;
    this.currentTurn++;
    this.currentPlayer = (this.currentPlayer%2)+1
    this._actions = null;
    if (this.allActions().length == 0) {
        this.winner = (this.currentPlayer%2)+1;
        return;
    }
    if (this.currentTurn-this.lastDrawAvoidingTurn > 40) {
        this.winner = 0;
        return;
    }
    /*
    var k = "";
    for (var i = 0; i < this.board.length; i++) {
        k += this.board[i];
    }
    if (this.positionCount[k]) {
        if (this.positionCount[k] > 3) {
            this.winner = 0;
            return;
        }
        this.positionCount[k]++;
    } else {
        this.positionCount[k] = 1;
    }
    */
};


}(typeof exports === 'undefined' ? this.exports_checkers = {} : exports, typeof exports === 'undefined' ? function(m) { return this['exports_'+m] } : require));
