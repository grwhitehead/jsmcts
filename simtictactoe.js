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
const game = require("tictactoe");

var switches = [
    ['-n', '--nruns NUMBER', 'Number of runs'],
    ['-p', '--player NAME', 'Player']
];

var availablePlayers = {
    "random": function() { return new mcts.RandomPlayer(); },
    "mcts10": function() { return new mcts.MCTSPlayer({ nTrials: 10 }); },
    "mcts100": function() { return new mcts.MCTSPlayer({ nTrials: 100 }); },
    "mcts1000": function() { return new mcts.MCTSPlayer({ nTrials: 1000 }); },
    "mcts10000": function() { return new mcts.MCTSPlayer({ nTrials: 10000 }); },
    "mcts100000": function() { return new mcts.MCTSPlayer({ nTrials: 100000 }); },
    "perfect": function() { return new game.PerfectPlayer(); }
};

var parser = new optparse.OptionParser(switches);

parser.banner = 'Usage: ./run.sh simtictactoe.js [options]';

var nruns = 1;
parser.on('nruns', function(opt, value) {
    nruns = value;
});

var players = [];
parser.on('player', function(opt, value) {
    players.push(value);
});

parser.parse(process.argv)

if (players.length == 0) {
    console.log(parser.toString()+
                Object.keys(availablePlayers).reduce((previousValue, currentValue) => previousValue+"\n  "+currentValue, "\n\nAvailable players:"));
    return;
}


var wins = [0, 0, 0];

for (var n = 1; n <= nruns; n++) {
    console.log("\nrun "+n);

    var g = new game.Game();

    if (g.nPlayers != players.length) {
        console.log("ERROR: need "+g.nPlayers+" players, "+players.length+" specified");
        return;
    }
    var ps = players.map(function(name) {
        if (availablePlayers.hasOwnProperty(name))
            return availablePlayers[name]();
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
