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


exports.Action = function(p) {
    mcts.Action.call(this);

    this.pos = p;
};

exports.Action.prototype = Object.create(mcts.Action.prototype);

exports.Action.prototype.toString = function() {
    return ""+this.pos;
};


exports.Game = function(o) {
    if (o instanceof exports.Game) {
        // copy game
        mcts.Game.call(this, o);
        this.board = o.board.slice();
    } else {
        // initialize new game
        mcts.Game.call(this, { nPlayers: 2 });
        this.board = [0, 0, 0, 0, 0, 0, 0,
                      0, 0, 0, 0, 0, 0, 0,
                      0, 0, 0, 0, 0, 0, 0,
                      0, 0, 0, 0, 0, 0, 0,
                      0, 0, 0, 0, 0, 0, 0,
                      0, 0, 0, 0, 0, 0, 0];
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
            s += "X";
            break;
        case 2:
            s += "O";
            break;
        }
        if (i%7 == 6) s+= "\n";
    }
    s += "\n"+mcts.Game.prototype.toString.call(this);
    return s;
};

var lines = [
    // horiz
    [ 0+0,  0+1,  0+2,  0+3], [ 0+1,  0+2,  0+3,  0+4], [ 0+2,  0+3,  0+4,  0+5], [ 0+3,  0+4,  0+5,  0+6],
    [ 7+0,  7+1,  7+2,  7+3], [ 7+1,  7+2,  7+3,  7+4], [ 7+2,  7+3,  7+4,  7+5], [ 7+3,  7+4,  7+5,  7+6],
    [14+0, 14+1, 14+2, 14+3], [14+1, 14+2, 14+3, 14+4], [14+2, 14+3, 14+4, 14+5], [14+3, 14+4, 14+5, 14+6],
    [21+0, 21+1, 21+2, 21+3], [21+1, 21+2, 21+3, 21+4], [21+2, 21+3, 21+4, 21+5], [21+3, 21+4, 21+5, 21+6],
    [28+0, 28+1, 28+2, 28+3], [28+1, 28+2, 28+3, 28+4], [28+2, 28+3, 28+4, 28+5], [28+3, 28+4, 28+5, 28+6],
    [35+0, 35+1, 35+2, 35+3], [35+1, 35+2, 35+3, 35+4], [35+2, 35+3, 35+4, 35+5], [35+3, 35+4, 35+5, 35+6],
    // vert
    [0+0, 0+7, 0+14, 0+21], [0+7, 0+14, 0+21, 0+28], [0+14, 0+21, 0+28, 0+35],
    [1+0, 1+7, 1+14, 1+21], [1+7, 1+14, 1+21, 1+28], [1+14, 1+21, 1+28, 1+35],
    [2+0, 2+7, 2+14, 2+21], [2+7, 2+14, 2+21, 2+28], [2+14, 2+21, 2+28, 2+35],
    [3+0, 3+7, 3+14, 3+21], [3+7, 3+14, 3+21, 3+28], [3+14, 3+21, 3+28, 3+35],
    [4+0, 4+7, 4+14, 4+21], [4+7, 4+14, 4+21, 4+28], [4+14, 4+21, 4+28, 4+35],
    [5+0, 5+7, 5+14, 5+21], [5+7, 5+14, 5+21, 5+28], [5+14, 5+21, 5+28, 5+35],
    [6+0, 6+7, 6+14, 6+21], [6+7, 6+14, 6+21, 6+28], [6+14, 6+21, 6+28, 6+35],
    // diag 1
    [ 0+0,  0+8,  0+16,  0+24], [ 0+1,  0+9,  0+17,  0+25], [ 0+2,  0+10,  0+18,  0+26], [ 0+3,  0+11,  0+19,  0+27],
    [ 7+0,  7+8,  7+16,  7+24], [ 7+1,  7+9,  7+17,  7+25], [ 7+2,  7+10,  7+18,  7+26], [ 7+3,  7+11,  7+19,  7+27],
    [14+0, 14+8, 14+16, 14+24], [14+1, 14+9, 14+17, 14+25], [14+2, 14+10, 14+18, 14+26], [14+3, 14+11, 14+19, 14+27],
    // diag 2
    [ 0+3,  0+9,  0+15,  0+21], [ 0+4,  0+10,  0+16,  0+22], [ 0+5,  0+11,  0+17,  0+23], [ 0+6,  0+12,  0+18,  0+24],
    [ 7+3,  7+9,  7+15,  7+21], [ 7+4,  7+10,  7+16,  7+22], [ 7+5,  7+11,  7+17,  7+23], [ 7+6,  7+12,  7+18,  7+24],
    [14+3, 14+9, 14+15, 14+21], [14+4, 14+10, 14+16, 14+22], [14+5, 14+11, 14+17, 14+23], [14+6, 14+12, 14+18, 14+24]
];

exports.Game.prototype.allActions = function() {
    var as = [];
    for (var i = 0; i < 7; i++) {
        for (var j = 5; j >= 0; j--) {
            if (this.board[i+j*7] == 0) {
                as.push(new exports.Action(1+i+j*7));
                break;
            }
        }
    }
    return as;
};

exports.Game.prototype.doAction = function(a) {
    mcts.Game.prototype.doAction.call(this, a);
    this.board[a.pos-1] = this.currentPlayer;
    var e = false;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var n1 = 0;
        var n2 = 0;
        for (var j = 0; j < line.length; j++) {
            switch (this.board[line[j]]) {
            case 1:
                n1++;
                break;
            case 2:
                n2++;
                break;
            case 0:
                e = true;
            }
        }
        if (n1 == 4) {
            this.winner = 1;
            break;
        }
        if (n2 == 4) {
            this.winner = 2;
            break;
        }
    }
    if (!this.isGameOver()) {
        if (!e) {
            this.winner = 0;
        } else {
            this.currentTurn++;
            this.currentPlayer = (this.currentPlayer%2)+1
        }
    }
};


}(typeof exports === 'undefined' ? this.exports_connectfour = {} : exports, typeof exports === 'undefined' ? function(m) { return this['exports_'+m] } : require));
