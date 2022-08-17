/*
 * MIT License
 *
 * Copyright (c) 2022 Greg Whitehead
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


/*
 * base classes for MCTS games (see example code)
 */

exports.Action = function() {
};

exports.Action.prototype.toString = function() {
    throw "not implemented";
};


exports.Game = function(nPlayers) {
    this.nPlayers = nPlayers;

    this.currentTurn = 1;
    this.currentPlayer = 1;
    this.winner = -1;
};

exports.Game.prototype.copyGame = function() {
    var g = new exports.Game(this.nPlayers);
    g.currentTurn = this.currentTurn;
    g.currentPlayer = this.currentPlayer;
    g.winner = this.winner;
    return g;
};

exports.Game.prototype.toString = function() {
    if (this.winner == -1) {
        return "currentTurn "+this.currentTurn+" currentPlayer "+this.currentPlayer;
    } else if (this.winner == 0) {
        return "draw";
    } else {
        return "winner "+this.winner;
    }
};

exports.Game.prototype.isGameOver = function() {
    return this.winner >= 0;
};

exports.Game.prototype.allActions = function() {
    return [];
};

exports.Game.prototype.doAction = function(a) {
};


exports.Player = function() {
};

exports.Player.prototype.getAction = function(g) {
    throw "not implemented";
};


/*
 * random player
 */

exports.RandomPlayer = function() {
    exports.Player.call(this);
};

exports.RandomPlayer.prototype = Object.create(exports.Player.prototype);

exports.RandomPlayer.prototype.getAction = function(g) {
    var as = g.allActions();
    if (as.length > 0) {
        return as[Math.floor(Math.random()*as.length)];
    }
};


/*
 * MCTS player
 */

exports.MCTSNode = function(g, a) {
    this.player = g.currentPlayer;
    this.action = a;
    this.count = 0;
    this.values = new Array(g.nPlayers).fill(0);
    this.children = null;

    this.cumSearchDepth = 0;
    this.cumGameDepth = 0;
};

exports.MCTSNode.prototype.toString = function() {
    return this.action.toString()+" "+(1.0*this.values[this.player-1]/this.count).toFixed(2)+" ("+(this.values[this.player-1])+"/"+this.count+")";
};

/*
 * Select child for exploration using UCT Algorithm
 *
 * c = 2*Cp/sqrt(2), where Cp is the exploration constant
 *
 * For rewards in range [0,1] Cp = 1/sqrt(2) and c = 1.0
 *
 */
exports.MCTSNode.prototype.selectChild = function(c) {
    var sa = null;
    var sv;
    for (var i = 0; i < this.children.length; i++) {
        var a = this.children[i];
        var v = (1.0*a.values[a.player-1])/(1+a.count)
            + c*Math.sqrt(Math.log(1+this.count)/(1+a.count))
            + Math.random()*1e-6;
        if (sa == null || v > sv) {
            sa = a;
            sv = v;
        }
    }
    return sa;
};

exports.MCTSNode.prototype.updateValue = function(pi, v) {
    this.count++;
    this.values[pi-1] += v;
};

exports.MCTSNode.prototype.updateValues = function(v) {
    this.count++;
    for (var i = 0; i < this.values.length; i++) {
      this.values[i] += v;
    }
};


exports.MCTSPlayer = function(nTrials) {
    exports.Player.call(this);
    this.nTrials = nTrials;

    this.C = 1.0; // see MCTSNode selectChild
};

exports.MCTSPlayer.prototype = Object.create(exports.Player.prototype);

/*
 * synchronous interface (for node command line)
 *
 * runs nTrials and returns best action found
 */
exports.MCTSPlayer.prototype.getAction = function(g) {
    var state = this.startThinking(g);
    this.continueThinking(state, this.nTrials);
    return this.stopThinking(state);
}

/*
 * asynchronous interface (for web pages)
 *
 * runs nTrials, a few at a time, can stop at any point and get best action found so far
 *
 * startThinking - set up and return search state
 * continueThinking - run at most nt more trials, return true if more trials to run
 * stopThinking - return best action found so far
 */
exports.MCTSPlayer.prototype.startThinking = function(g) {
    var state = { game: g, turn: g.currentTurn, root: new exports.MCTSNode(g, null), best: null, time: 0, avgSearchDepth: 0, avgGameDepth: 0 };
    var root = state.root;
    if (!root.children) {
        root.children = g.allActions().map(function (a) { return new exports.MCTSNode(g, a) });
    }
    if (this.searchCallback) {
        this.searchCallback(state);
    }
    return state;
}
exports.MCTSPlayer.prototype.continueThinking = function(state, nt) {
    var g = state.game;
    var root = state.root;
    if (root.children.length <= 1 || root.count >= this.nTrials) {
        return false;
    }
    var t0 = root.count;
    var t1 = Math.min(this.nTrials, root.count+nt);
    var time0 = Date.now();
    for (var t = t0; t < t1; t++) {
        var tg = g.copyGame(); // copy current game state for new trial
        var vns = [root]; // track visited nodes
        // select next child to explore
        var n = root.selectChild(this.C);
        vns.push(n);
        tg.doAction(n.action);
        // repeat to frontier of explored game tree
        while (!tg.isGameOver() && n.children) {
            n = n.selectChild(this.C);
            vns.push(n);
            tg.doAction(n.action);
        }
        // if game isn't over, expand frontier node and select a child to explore
        if (!tg.isGameOver()) {
            n.children = tg.allActions().map(function (a) { return new exports.MCTSNode(tg, a) });
            n = n.selectChild(this.C);
            vns.push(n);
            tg.doAction(n.action);
        }
        var searchDepth = tg.currentTurn;
        // random playout to end of game
        while (!tg.isGameOver()) {
            var rp_as = tg.allActions();
            var rp_a = rp_as[Math.floor(Math.random()*rp_as.length)];
            tg.doAction(rp_a);
        }
        var gameDepth = tg.currentTurn;
        // apply rewards to visited nodes
        for (var i = 0; i < vns.length; i++) {
            if (tg.winner > 0) {
                vns[i].updateValue(tg.winner, 1.0);
            } else {
                vns[i].updateValues(0.5);
            }
            vns[i].cumSearchDepth += searchDepth;
            vns[i].cumGameDepth += gameDepth;
        }
    }
    state.time += Date.now()-time0;
    if (root.count > 0) {
        state.avgSearchDepth = (1.0*root.cumSearchDepth/root.count)-state.turn+1;
        state.avgGameDepth = (1.0*root.cumGameDepth/root.count)-state.turn+1;
    }
    if (this.searchCallback) {
        this.searchCallback(state);
    }
    return (root.count < this.nTrials);
}
exports.MCTSPlayer.prototype.stopThinking = function(state) {
    var g = state.game;
    var root = state.root;
    if (root.children.length > 0) {
        state.best = root.selectChild(0);
    }
    if (this.searchCallback) {
        this.searchCallback(state);
    }
    return (state.best == null)? null : state.best.action;
}


exports.searchCallback = function(state) {
    if (state.best) {
        console.log("["+state.root.count+" trials; "+state.time+" msecs]");
        for (var i = 0; i < state.root.children.length; i++) {
            var n = state.root.children[i];
            console.log((n === state.best?"*":" ")+" "+n.toString());
        }
        console.log("avgSearchDepth "+state.avgSearchDepth.toFixed(4)+
                    "\navgGameDepth "+state.avgGameDepth.toFixed(4)+
                    "\n");
    }
}


exports.playgame = function(g, ps) {
    while (!g.isGameOver()) {
        console.log(g.toString());
        var a = ps[g.currentPlayer-1].getAction(g);
        g.doAction(a);
    }
    console.log(g.toString());
}


}(typeof exports === 'undefined' ? this.exports_mcts = {} : exports, typeof exports === 'undefined' ? function(m) { return this['exports_'+m] } : require));
