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
        this.board = [0, 0, 0,
                      0, 0, 0,
                      0, 0, 0];
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
        if (i%3 == 2) s+= "\n";
    }
    s += "\n"+mcts.Game.prototype.toString.call(this);
    return s;
};

var lines = [
    // rows
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    // columns
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    // diagonals
    [0, 4, 8], [2, 4, 6]
];

exports.Game.prototype.allActions = function() {
    var as = [];
    for (var i = 0; i < this.board.length; i++) {
        if (this.board[i] == 0) {
            as.push(new exports.Action(1+i));
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
        if (n1 == 3) {
            this.winner = 1;
            break;
        }
        if (n2 == 3) {
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


/*
 * PerfectPlayer
 *
 * Rule-based perfect player strategy from
 * Crowley, K. and Siegler, R.S. (1993), Flexible Strategy Use in Young Children's Tic-Tac-Toe.
 * Cognitive Science, 17: 531-561. https://doi.org/10.1207/s15516709cog1704_3
 */
exports.PerfectPlayer = function() {
    mcts.Player.call(this);
};

exports.PerfectPlayer.prototype = Object.create(mcts.Player.prototype);

exports.PerfectPlayer.prototype.winMoves = function(g, p) {
    var moves = [];
    for (var line of lines) {
        var pCount = 0;
        var empty = -1;
        for (var i of line) {
            if (g.board[i] == p) {
                pCount += 1;
            } else if (g.board[i] == 0) {
                empty = i;
            }
        }
        if (pCount == 2 && empty >= 0) moves.push(empty);
    }
    return moves;
};

var forks = [
    // row 1 + columns
    [0, [1, 2], [3, 6]], [1, [0, 2], [4, 7]], [2, [0, 1], [5, 8]],
    // row 1 + diagonals
    [0, [1, 2], [4, 8]], [2, [0, 1], [4, 6]],
    // row 2 + columns
    [3, [4, 5], [0, 6]], [4, [3, 5], [1, 7]], [5, [3, 4], [2, 8]],
    // row 2 + diagonals
    [4, [3, 5], [0, 8]], [4, [3, 5], [2, 6]],
    // row 3 + columns
    [6, [7, 8], [0, 3]], [7, [6, 8], [1, 4]], [8, [6, 7], [2, 5]],
    // row 3 + diagonals
    [8, [6, 7], [0, 4]], [6, [7, 8], [2, 4]],
    // column 1 + diagonals
    [0, [3, 6], [4, 8]], [6, [0, 3], [2, 4]],
    // column 2 + diagonals
    [4, [1, 7], [0, 8]], [4, [1, 7], [2, 6]],
    // column 3 + diagonals
    [8, [2, 5], [0, 4]], [2, [5, 8], [4, 6]],
    // diagonals
    [4, [0, 8], [2, 6]]
];
    
exports.PerfectPlayer.prototype.forkMoves = function(g, p) {
    var moves = [];
    for (var fork of forks) {
        shared = fork[0];
        line1 = fork[1];
        line2 = fork[2];
        if ((g.board[shared] == 0) &&
            ((g.board[line1[0]] == p && g.board[line1[1]] == 0) ||
             (g.board[line1[0]] == 0 && g.board[line1[1]] == p)) &&
            ((g.board[line2[0]] == p && g.board[line2[1]] == 0) ||
             (g.board[line2[0]] == 0 && g.board[line2[1]] == p)) ) {
            moves.push(shared);
        }
    }
    return moves;
};

exports.PerfectPlayer.prototype.forceBlockMoves = function(g, p, avoid) {
    var moves = [];
    for (var line of lines) {
        var pCount = 0;
        var empty = [];
        for (var i of line) {
            if (g.board[i] == p) {
                pCount += 1;
            } else if (g.board[i] == 0) {
                empty.push(i);
            }
        }
        if (pCount == 1 && empty.length == 2) {
            if (avoid.includes(empty[0])) {
                if (!avoid.includes(empty[1])) moves.push(empty[0]);
            } else if (avoid.includes(empty[1])) {
                moves.push(empty[1]);
            } else {
                moves.push(empty[0]);
                moves.push(empty[1]);
            }
        }
    }
    return moves;
};

exports.PerfectPlayer.prototype.oppositeCornerMoves = function(g, p) {
    var moves = [];
    if (g.board[0] == p && g.board[8] == 0) moves.push(8);
    if (g.board[2] == p && g.board[6] == 0) moves.push(6);
    if (g.board[8] == p && g.board[0] == 0) moves.push(0);
    if (g.board[6] == p && g.board[2] == 0) moves.push(2);
    return moves;
}

exports.PerfectPlayer.prototype.emptyCornerMoves = function(g) {
    var moves = [];
    if (g.board[0] == 0) moves.push(0);
    if (g.board[2] == 0) moves.push(2);
    if (g.board[6] == 0) moves.push(6);
    if (g.board[8] == 0) moves.push(8);
    return moves;
}

exports.PerfectPlayer.prototype.emptySideMoves = function(g) {
    var moves = [];
    if (g.board[1] == 0) moves.push(1);
    if (g.board[3] == 0) moves.push(3);
    if (g.board[5] == 0) moves.push(5);
    if (g.board[7] == 0) moves.push(7);
    return moves;
}

exports.PerfectPlayer.prototype.getAction = function(g) {
    // Win
    var moves = this.winMoves(g, g.currentPlayer);
    if (moves.length > 0) return new exports.Action(1+moves[Math.floor(Math.random()*moves.length)]);
    // Block
    var moves = this.winMoves(g, 3-g.currentPlayer);
    if (moves.length > 0) return new exports.Action(1+moves[Math.floor(Math.random()*moves.length)]);
    // Fork
    var moves = this.forkMoves(g, g.currentPlayer);
    if (moves.length > 0) return new exports.Action(1+moves[Math.floor(Math.random()*moves.length)]);
    // Block Fork
    var moves = this.forkMoves(g, 3-g.currentPlayer);
    if (moves.length > 0) {
        // Deny opponent forks by forcing them to block somewhere else
        // (an essential strategy to avoid double-forks)
        var moves2 = this.forceBlockMoves(g, g.currentPlayer, moves);
        if (moves2.length > 0) {
            return new exports.Action(1+moves2[Math.floor(Math.random()*moves2.length)]);
        }
        return new exports.Action(1+moves[Math.floor(Math.random()*moves.length)]);
    }
    // Empty Center
    if (g.board[4] == 0) return new exports.Action(1+4);
    // Opposite Corner
    var moves = this.oppositeCornerMoves(g, 3-g.currentPlayer);
    if (moves.length > 0) return new exports.Action(1+moves[Math.floor(Math.random()*moves.length)]);
    // Empty Corner
    var moves = this.emptyCornerMoves(g);
    if (moves.length > 0) return new exports.Action(1+moves[Math.floor(Math.random()*moves.length)]);
    // Empty Side
    var moves = this.emptySideMoves(g);
    if (moves.length > 0) return new exports.Action(1+moves[Math.floor(Math.random()*moves.length)]);
};


}(typeof exports === 'undefined' ? this.exports_tictactoe = {} : exports, typeof exports === 'undefined' ? function(m) { return this['exports_'+m] } : require));
