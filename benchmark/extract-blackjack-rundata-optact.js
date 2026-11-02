
const optparse = require('optparse');
const fs = require('fs');
const mcts = require("mcts");
const game = require("blackjack");


var switches = [
];

var parser = new optparse.OptionParser(switches);

parser.banner = 'Usage: ./run.sh rundata2samples.js [options] data.csv';

var datafile;
parser.on(2, function(opt) {
    datafile = opt;
});

parser.parse(process.argv)

var data = [];
try {
    if (datafile) {
        data = fs.readFileSync(datafile, 'utf8').
            trim().split(/\r?\n/).
            map(function(l){return l.split(",").map(function(v){return /^\d+$/.test(v)?Number(v):v})});
    } else {
        data = fs.readFileSync(0).toString().
            trim().split(/\r?\n/).
            map(function(l){return l.split(",").map(function(v){return /^\d+$/.test(v)?Number(v):v})});
    }
} catch (err) {
    console.error(err);
}

var p = new game.OptimumPlayer();

function parseCards(s) {
    return s.substring(1).split("").map(function (v) { return (v=='0')?10:parseInt(v); })
}

for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var g = { currentTurn: 1, currentPlayer: 1, bet2: r[0], bet: r[1], hand: parseCards(r[2]),  dealer: parseCards(r[3]) };
    var a = p.getAction(g);
    console.log((a.toString() == r[4])?1:0);
}
