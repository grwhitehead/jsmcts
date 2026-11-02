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


/*
 * Seedable PRNG
 *
 * xorshift128+
 *
 * https://xoshiro.di.unimi.it/xorshift.php
 * https://xoshiro.di.unimi.it/xorshift128plus.c
 *
 * Javascript port from Andreas Madsen
 * https://github.com/AndreasMadsen/xorshift
 */

exports.PRNGSeed = function() {
    // seed must not be zero
    while (true) {
        this.seed0U = Math.random()*2**32 >>> 0;
        this.seed0L = Math.random()*2**32 >>> 0;
        this.seed1U = Math.random()*2**32 >>> 0;
        this.seed1L = Math.random()*2**32 >>> 0;
        if (this.seed0U > 0 || this.seed0L > 0 || this.seed1U > 0 || this.seed1L > 0) break;
    }
}

exports.PRNG = function(seed) {
    if (seed == undefined) seed = new exports.PRNGSeed();
    this._state0U = seed.seed0U;
    this._state0L = seed.seed0L;
    this._state1U = seed.seed1U;
    this._state1L = seed.seed1L;
};

exports.PRNG.prototype.random = function() {
    // uint64_t s1 = s[0]
    var s1U = this._state0U, s1L = this._state0L;
    // uint64_t s0 = s[1]
    var s0U = this._state1U, s0L = this._state1L;
    
    // result = s0 + s1
    var sumL = (s0L >>> 0) + (s1L >>> 0);
    var resU = (s0U + s1U + (sumL / 2 >>> 31)) >>> 0;
    var resL = sumL >>> 0;
    
    // s[0] = s0
    this._state0U = s0U;
    this._state0L = s0L;
    
    // - t1 = [0, 0]
    var t1U = 0, t1L = 0;
    // - t2 = [0, 0]
    var t2U = 0, t2L = 0;
    
    // s1 ^= s1 << 23;
    // :: t1 = s1 << 23
    var a1 = 23;
    var m1 = 0xFFFFFFFF << (32 - a1);
    t1U = (s1U << a1) | ((s1L & m1) >>> (32 - a1));
    t1L = s1L << a1;
    // :: s1 = s1 ^ t1
    s1U = s1U ^ t1U;
    s1L = s1L ^ t1L;
    
    // t1 = ( s1 ^ s0 ^ ( s1 >> 17 ) ^ ( s0 >> 26 ) )
    // :: t1 = s1 ^ s0
    t1U = s1U ^ s0U;
    t1L = s1L ^ s0L;
    // :: t2 = s1 >> 18
    var a2 = 18;
    var m2 = 0xFFFFFFFF >>> (32 - a2);
    t2U = s1U >>> a2;
    t2L = (s1L >>> a2) | ((s1U & m2) << (32 - a2));
    // :: t1 = t1 ^ t2
    t1U = t1U ^ t2U;
    t1L = t1L ^ t2L;
    // :: t2 = s0 >> 5
    var a3 = 5;
    var m3 = 0xFFFFFFFF >>> (32 - a3);
    t2U = s0U >>> a3;
    t2L = (s0L >>> a3) | ((s0U & m3) << (32 - a3));
    // :: t1 = t1 ^ t2
    t1U = t1U ^ t2U;
    t1L = t1L ^ t2L;
    
    // s[1] = t1
    this._state1U = t1U;
    this._state1L = t1L;
    
    // return result normalized [0,1)
    // Math.pow(2, -32) = 2.3283064365386963e-10
    // Math.pow(2, -52) = 2.220446049250313e-16
    return resU * 2.3283064365386963e-10 + (resL >>> 12) * 2.220446049250313e-16;
};


/*
 * Utility function to randomly shuffle an array, rng param is optional
 */
exports.shuffleArray = function(array, rng) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(((rng == undefined)?Math.random():rng.random()) * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


/*
 * base classes for MCTS games (see example code)
 */

exports.Action = function() {
};

exports.Action.prototype.toString = function() {
    throw "not implemented";
};


exports.Game = function(o, rng) {
    if (o instanceof exports.Game) {
        // copy game
        this.nondeterministic = o.nondeterministic;
        this.nPlayers = o.nPlayers;
        this.currentTurn = o.currentTurn;
        this.currentPlayer = o.currentPlayer;
        this.winner = o.winner;
    } else {
        // initialize new game
        this.nondeterministic = o.nondeterministic;
        this.nPlayers = o.nPlayers;
        this.currentTurn = 1;
        this.currentPlayer = 1;
        this.winner = -1;
    }
    if (this.nondeterministic) {
        if (rng == undefined) rng = new exports.PRNG();
        this.rng = rng;
    }
};

exports.Game.prototype.copyGame = function(rng) {
    return new exports.Game(this, rng);
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
    this.values = new Array(g.nPlayers).fill(0.0);
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
 * c is the exploration constant, pass zero for final selection
 */
exports.MCTSNode.prototype.selectChild = function(c) {
    // currently selected child and value
    var sa = null;
    var sv;
    // break ties by visiting children in randomly shuffled order
    var cidx = new Array(this.children.length);
    for (var i = 0; i < cidx.length; i++) cidx[i] = i;
    exports.shuffleArray(cidx);
    for (var i = 0; i < cidx.length; i++) {
        var a = this.children[cidx[i]];
        var v = 0;
        if (a.count == 0) {
            if (c > 0) {
                // make sure all nodes are explored at least once (v infinity)
                return a;
            } else {
                // assign unvisited nodes zero in the final selection process
            }
        } else {
            // calculate value for visited nodes
            v = (1.0*a.values[a.player-1])/a.count
                + c*Math.sqrt(Math.log(this.count)/a.count);
        }
        // update selection if we find a higher value
        if (sa == null || v > sv) {
            sa = a;
            sv = v;
        }
    }
    return sa;
};

exports.MCTSNode.prototype.updateValues = function(rewards) {
    this.count++;
    for (var i = 0; i < this.values.length; i++) {
      this.values[i] += rewards[i];
    }
};

exports.MCTSPlayer = function(config) {
    exports.Player.call(this);

    // number of trials to run, required parameter
    if (config.nTrials == undefined) {
        throw "nTrials required";
    }
    this.nTrials = config.nTrials;

    // exploration constant, see MCTSNode selectChild (defaults to sqrt(2) for rewards [0,1])
    if (config.c == undefined) {
        this.c = Math.sqrt(2);
    } else {
        this.c = config.c;
    }
    if (config.cMult != undefined) {
        this.c *= config.cMult;
    }
    if (config.cRootMult != undefined) {
        this.cRootMult = config.cRootMult;
    } else {
        this.cRootMult = 1;
    }

    // ensemble uct is used for nondeterministic games to avoid inconsistent game trees
    // ensembleKeyFunc generates a key for the current game state that is used to map the different game states that result
    // from executing nondeterministic actions to separate game subtrees which are then averaged together
    if (config.ensembleKeyFunc) {
        this.ensembleKeyFunc = config.ensembleKeyFunc;
    } else {
        // default ensembleKeyFunc ensures one game subtree per currentPlayer+actionList, the minimum to ensure consistency
        this.ensembleKeyFunc = function(g) { return ""+g.currentPlayer+":"+g.allActions() };
    }
    
    // determinization is used for nondeterministic games if nTrialsPerSeed is provided
    // nTrialsPerSeed trials are run with the same PRNG seed on a game subtree, with separate subtrees for each seed that
    // are then averaged together
    if (config.nTrialsPerSeed != undefined) {
        if (config.nTrialsPerSeed < 1) {
            this.nTrialsPerSeed = Math.ceil(this.nTrials * config.nTrialsPerSeed);
        } else {
            this.nTrialsPerSeed = config.nTrialsPerSeed;
        }
    }

    // evaluationFunc is optional and uses game-specific knowledge to rate player advantage mid-game or at game end (should return an array of values, one for each player, that sum to 1.0)
    if (config.evaluationFunc != undefined) {
        this.evaluationFunc = config.evaluationFunc;
    }

    // early playout termination (default is to run random playout to end of game)
    this.maxPlayoutDepth = config.maxPlayoutDepth;
    if (this.maxPlayoutDepth) {
        // requires evaluationFunc
        if (this.evaluationFunc == undefined) {
            throw "evaluationFunc required with maxPlayoutDepth";
        }
    }

    // rewardsFunc is called at game end to calculate player rewards (should return an array of values, one for each player, that sum to 1.0)
    // overridden by evaluationFunc if provided
    if (config.evaluationFunc != undefined) {
        this.rewardsFunc = this.evaluationFunc;
    } else if (config.rewardsFunc != undefined) {
        this.rewardsFunc = config.rewardsFunc;
    } else {
        // default rewardsFunc
        this.rewardsFunc = function(g) {
            if (g.winner > 0) {
                // we had a winner
                var rewards = new Array(g.nPlayers).fill(0.0);
                if (g.winner <= g.nPlayers) {
                    rewards[g.winner-1] = 1.0;
                }
                return rewards;
            } else {
                // we had a draw
                return new Array(g.nPlayers).fill(0.5);
            }
        };
    }
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
    var state = { game: g, turn: g.currentTurn, root: new exports.MCTSNode(g, null), best: null, time: 0, avgSearchDepth: 0, avgGameDepth: 0, avgBranchingFactor: 0 };
    var root = state.root;
    root.cumSearchDepth = 0;
    root.cumGameDepth = 0;
    root.cumBranchingFactor = 0;
    root.children = g.allActions().map(function (a) { return new exports.MCTSNode(g, a) });
    if (this.searchCallback) {
        this.searchCallback(state);
    }
    return state;
}
exports.MCTSPlayer.prototype.continueThinking = function(state, nt) {
    var g = state.game;
    // use ensemble uct or determinization to avoid inconsistent game trees
    var nondeterministicEnsemble = g.nondeterministic && this.nTrialsPerSeed == undefined;
    var root = state.root;
    if (root.children.length <= 1 || root.count >= this.nTrials) {
        return false;
    }
    var t0 = root.count;
    var t1 = Math.min(this.nTrials, root.count+nt);
    var time0 = Date.now();
    for (var t = t0; t < t1; t++) {
        var tg; // copy current game state for new trial
        if (g.nondeterministic) {
            if (this.nTrialsPerSeed != undefined) {
                // use determinization, running nTrialsPerSeed with the same PRNG seed
                if (root.count % this.nTrialsPerSeed == 0) {
                    state.seed = new exports.PRNGSeed();
                    if (root.children) {
                        // clear children on seed change
                        for (var i = 0; i < root.children.length; i++) {
                            root.children[i].children = null;
                        }
                    }
                }
            }
            tg = g.copyGame(new exports.PRNG(state.seed));
        } else {
            tg = g.copyGame();
        }
        var vns = [root]; // track visited nodes
        var branches = root.children.length;
        // select next child to explore
        var n = root.selectChild(this.c*this.cRootMult);
        vns.push(n);
        tg.doAction(n.action);
        if (nondeterministicEnsemble) {
            // use ensemble uct with separate subtrees per ensembleKey
            if (n.children == null) {
                n.children = {};
            }
            // ensembleKeyFunc maps game states to ensemble tree nodes
            var ek = this.ensembleKeyFunc(tg);
            if (n.children[ek] == undefined) {
                // duplicate this node for the new game state
                n.children[ek] = new exports.MCTSNode(tg, n.action);
            }
            // switch to the version of this node matching the current game state
            n = n.children[ek];
            vns.push(n);
        }
        var depth = 1;
        // repeat to frontier of explored game tree
        while (!tg.isGameOver() && n.children) {
            branches += n.children.length;
            n = n.selectChild(this.c);
            vns.push(n);
            tg.doAction(n.action);
            if (nondeterministicEnsemble) {
                if (n.children == null) {
                    n.children = {};
                }
                var ek = this.ensembleKeyFunc(tg);
                if (n.children[ek] == undefined) {
                    n.children[ek] = new exports.MCTSNode(tg, n.action);
                }
                n = n.children[ek];
                vns.push(n);
            }
            depth += 1;
        }
        // if game isn't over, expand frontier node and select a child to explore
        if (!tg.isGameOver()) {
            n.children = tg.allActions().map(function (a) { return new exports.MCTSNode(tg, a) });
            branches += n.children.length;
            n = n.selectChild(this.c);
            vns.push(n);
            tg.doAction(n.action);
            if (nondeterministicEnsemble) {
                if (n.children == null) {
                    n.children = {};
                }
                var ek = this.ensembleKeyFunc(tg);
                if (n.children[ek] == undefined) {
                    n.children[ek] = new exports.MCTSNode(tg, n.action);
                }
                n = n.children[ek];
                vns.push(n);
            }
            depth += 1;
        }
        var searchDepth = depth;
        // random playout to end of game
        while (!tg.isGameOver()) {
            if (this.maxPlayoutDepth && depth-searchDepth >= this.maxPlayoutDepth) break;
            var rp_as = tg.allActions();
            branches += rp_as.length;
            var rp_a = rp_as[Math.floor(Math.random()*rp_as.length)];
            tg.doAction(rp_a);
            depth += 1;
        }
        var gameDepth = depth;
        // apply rewards to visited nodes
        var rewards = this.rewardsFunc(tg);
        for (var i = 0; i < vns.length; i++) {
            vns[i].updateValues(rewards);
        }
        root.cumSearchDepth += searchDepth;
        root.cumGameDepth += gameDepth;
        root.cumBranchingFactor += (1.0*branches/gameDepth);
    }
    state.time += Date.now()-time0;
    if (root.count > 0) {
        state.avgSearchDepth = (1.0*root.cumSearchDepth/root.count);
        state.avgGameDepth = (1.0*root.cumGameDepth/root.count);
        state.avgBranchingFactor = (1.0*root.cumBranchingFactor/root.count);
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
        state.best = root.selectChild("", 0);
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
                    "\navgBranchingFactor "+state.avgBranchingFactor.toFixed(4)+
                    "\n");
    }
}


exports.playgame = function(g, ps) {
    console.log(g.toString());
    while (!g.isGameOver()) {
        var a = ps[g.currentPlayer-1].getAction(g);
        console.log(a.toString());
        g.doAction(a);
        console.log(g.toString());
    }
}


}(typeof exports === 'undefined' ? this.exports_mcts = {} : exports, typeof exports === 'undefined' ? function(m) { return this['exports_'+m] } : require));
