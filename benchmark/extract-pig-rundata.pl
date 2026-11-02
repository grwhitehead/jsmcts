
my $verbose = 0;
while ($#ARGV >= 0) {
    $_ = shift @ARGV;
    if (m/^--verbose$/)      { $verbose++; }
    elsif (m/^-v+$/)         { $verbose += length($_)-1; }
    else                     { usage("unknown: $_"); }
}

## optimal
#
#player: 1* / 2
#rolls:  / 
#total: 0 / 0
#score: 0 / 0
#currentTurn 1 currentPlayer 1
#ROLL

## mcts
#
# player: 1* / 2
# rolls: 5 / 
# total: 5 / 0
# score: 0 / 0
# currentTurn 1 currentPlayer 1
# [10000000 trials; 2404205 msecs]
# * ROLL 0.59 (5899586/9996022)
#   HOLD 0.53 (2100/3978)
# avgSearchDepth 44.3574
# avgGameDepth 89.5309
# avgBranchingFactor 1.5967
#
# ROLL

my $turn = 0;
my $player = 0;
my $totals = [0,0];
my $scores = [0,0];

my $move;

while (<>) {
    if (/run ([0-9]+)/) {
        $turn = 0;
        $player = 0;
        $totals = [0,0];
        $scores = [0,0];
    } elsif (/total: ([0-9]+) \/ ([0-9]+)/) {
        $totals[0] = $1;
        $totals[1] = $2;
    } elsif (/score: ([0-9]+) \/ ([0-9]+)/) {
        $scores[0] = $1;
        $scores[1] = $2;
    } elsif (/currentTurn ([0-9]+) currentPlayer ([0-9]+)/) {
        $turn = $1;
        $player = $2;
    } elsif (/^(ROLL|HOLD)$/) {
        $move = $1;
        if ($turn > 0) {
            print $player.",".$scores[0].",".$scores[1].",".$totals[$player-1].",",$move."\n";
        }
    }
}
