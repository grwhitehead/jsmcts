
const optparse = require('optparse');
const fs = require('fs');
const mcts = require("mcts");
const game = require("pig");


var switches = [
    ['-p', '--player NUM', '1 or 2'],
];

var parser = new optparse.OptionParser(switches);

parser.banner = 'Usage: ./run.sh rundata2samples.js [options] data.csv';

var player = 0;
parser.on('player', function(opt, value) {
    player = value;
});

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

var p = new game.OptimalPlayer({ trials: 0 });

for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var r_p = r[0];
    if (r_p == player) {
        var r_i = (r_p==1)?r[1]:r[2];
        var r_j = (r_p==1)?r[2]:r[1];
        var r_k = r[3];
        var r_move = r[4];
        if (r_move == "") continue;
        var p_roll = p.p_ijk_roll(r_i, r_j, r_k);
        var p_hold = p.p_ijk_hold(r_i, r_j, r_k);
        if (p_roll > p_hold) {
            console.log((r_move == "ROLL")?1:0);
        } else if (p_hold > p_roll) {
            console.log((r_move == "HOLD")?1:0);
        } else {
            console.log(1);
        }
    }
}
