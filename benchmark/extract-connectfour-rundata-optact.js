
const optparse = require('optparse');
const fs = require('fs');
const exec = require('child_process');

const cfdata = require('connectfourdata');


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

var solverDir = process.env.CONNECTFOUR_SOLVER_DIR;
function optimalMoves(movesStr) {
    var res = cfdata.bestmoveCache[movesStr];
    if (!res) {
        res = exec.execFileSync(solverDir+'/bestmove', [movesStr.split("").map(function(m) { return m-1 }).join("")], {
            stdio: 'pipe',
            encoding: 'utf8',
        });
    }
    var resLines = res.split("\n");
    var resMoves = [];
    var i = 10;
    while (resLines[i].length > 0) {
        var l = resLines[i].split(" ");
        var move = parseInt(l[0]);
        var score = parseInt(l[1]); // -N loss / 0 tie / +N win
        var movesleft = parseInt(l[2]);
        resMoves.push([move, score, movesleft]);
        i += 1;
    }
    resMoves.sort(function(a, b) { return a[1]>b[1]?-1:1; });
    var nbest = 1;
    while (nbest < resMoves.length && resMoves[nbest][1] == resMoves[nbest-1][1]) nbest += 1;
    return resMoves.slice(0,nbest).map(function(m) { return m[0]+1 });
}

for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var r_p = r[0];
    if (r_p == player) {
        var r_moves = r[1].substring(1);
        var r_move = r[2];
        var optMoves = optimalMoves(r_moves);
        console.log(optMoves.includes(r_move)?1:0);
    }
}
