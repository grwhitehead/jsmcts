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

const optparse = require('optparse');
const mcts = require("mcts");
const game = require("pig");

var switches = [
    ['-g', '--goal NUMBER', 'Goal score (default 100)'],
    ['-n', '--nruns NUMBER', 'Number of runs'],
    ['-p', '--player NAME', 'Player'],
    ['--benchmark', 'Benchmark']
];

var availablePlayers = {
    "random": function() { return new mcts.RandomPlayer(); },
    "holdat20": function() { return new game.HoldAtNPlayer(20); },
    "keeppaceendrace": function() { return new game.KeepPaceEndRacePlayer(21,8,29); },
    "optimal": function() { return new game.OptimalPlayer(); },

    "mcts10": function() { return new mcts.MCTSPlayer({ nTrials: 10 }); },
    "mcts100": function() { return new mcts.MCTSPlayer({ nTrials: 100 }); },
    "mcts1000": function() { return new mcts.MCTSPlayer({ nTrials: 1000 }); },
    "mcts10000": function() { return new mcts.MCTSPlayer({ nTrials: 10000 }); },
    "mcts100000": function() { return new mcts.MCTSPlayer({ nTrials: 100000 }); },
    "mcts1000000": function() { return new mcts.MCTSPlayer({ nTrials: 1000000 }); },
};

var benchmarkPlayers = {
    /*
     * benchmark testing
     */
    "random": function() { return new mcts.RandomPlayer(); },
    "holdat20": function() { return new game.HoldAtNPlayer(20); },
    "keeppaceendrace": function() { return new game.KeepPaceEndRacePlayer(21,8,29); },
    "optimal": function() { return new game.OptimalPlayer(); },
    
    "mcts1000": function() { return new mcts.MCTSPlayer({ nTrials: 1000 }); },
    "mcts1000tps10": function() { return new mcts.MCTSPlayer({ nTrials: 1000, nTrialsPerSeed: 10 }); },
    "mcts1000tps100": function() { return new mcts.MCTSPlayer({ nTrials: 1000, nTrialsPerSeed: 100 }); },
 
    "mcts10000": function() { return new mcts.MCTSPlayer({ nTrials: 10000 }); },
    "mcts10000tps10": function() { return new mcts.MCTSPlayer({ nTrials: 10000, nTrialsPerSeed: 10 }); },
    "mcts10000tps100": function() { return new mcts.MCTSPlayer({ nTrials: 10000, nTrialsPerSeed: 100 }); },
    "mcts10000tps1000": function() { return new mcts.MCTSPlayer({ nTrials: 10000, nTrialsPerSeed: 1000 }); },
 
    "mcts100000": function() { return new mcts.MCTSPlayer({ nTrials: 100000 }); },
    "mcts100000tps10": function() { return new mcts.MCTSPlayer({ nTrials: 100000, nTrialsPerSeed: 10 }); },
    "mcts100000tps100": function() { return new mcts.MCTSPlayer({ nTrials: 100000, nTrialsPerSeed: 100 }); },
    "mcts100000tps1000": function() { return new mcts.MCTSPlayer({ nTrials: 100000, nTrialsPerSeed: 1000 }); },
    
    "mcts1000000": function() { return new mcts.MCTSPlayer({ nTrials: 1000000 }); },
    "mcts1000000tps10": function() { return new mcts.MCTSPlayer({ nTrials: 1000000, nTrialsPerSeed: 10 }); },
    "mcts1000000tps100": function() { return new mcts.MCTSPlayer({ nTrials: 1000000, nTrialsPerSeed: 100 }); },
    "mcts1000000tps1000": function() { return new mcts.MCTSPlayer({ nTrials: 1000000, nTrialsPerSeed: 1000 }); },
};

var parser = new optparse.OptionParser(switches);

parser.banner = 'Usage: ./run.sh simpig.js [options]';

var goal = 100;
parser.on('goal', function(opt, value) {
    goal = value;
});

var nruns = 1;
parser.on('nruns', function(opt, value) {
    nruns = value;
});

var players = [];
parser.on('player', function(opt, value) {
    players.push(value);
});

parser.on('benchmark', function(opt) {
    availablePlayers = benchmarkPlayers;
});

parser.parse(process.argv)

if (players.length == 0) {
    console.log(parser.toString()+
                Object.keys(availablePlayers).reduce((previousValue, currentValue) => previousValue+"\n  "+currentValue, "\n\nAvailable players:"));
    return;
}


var wins = [0, 0, 0];

for (var n = 1; n <= nruns; n++) {
    console.log("\nrun "+n+"\n");

    var g = new game.Game({ goalScore: goal });

    if (g.nPlayers != players.length) {
        console.log("ERROR: need "+g.nPlayers+" players, "+players.length+" specified");
        return;
    }
    var ps = players.map(function(name) {
        if (availablePlayers.hasOwnProperty(name))
            return availablePlayers[name]();
        if (name.startsWith("mcts{")) {
            // parse mcts player parameters encoded in player name
            // mcts{"nTrials":1000000,"nTrialsPerSeed":100,"c":14,"maxPlayoutDepth":5,"evaluationFunc":"*game.simpleEvaluationFunc"}
            return new mcts.MCTSPlayer(
                JSON.parse(name.substr(4), (k,v) => (typeof v == 'string' && v.startsWith('*'))?eval(v.substr(1)):v )
            );
        }
        console.log("ERROR: unknown player: "+name);
        return null;
    });
    if (ps.includes(null)) {
        return;
    }

    ps[0].searchCallback = mcts.searchCallback;
    ps[1].searchCallback = mcts.searchCallback;

    mcts.playgame(g, ps);
        
    wins[g.winner]++;
    console.log("\ndraw,"+players+"\n"+wins+"\n"+wins.map(function(v){return (1.0*v/n).toFixed(2)}));
}
