
my $verbose = 0;
while ($#ARGV >= 0) {
    $_ = shift @ARGV;
    if (m/^--verbose$/)      { $verbose++; }
    elsif (m/^-v+$/)         { $verbose += length($_)-1; }
    else                     { usage("unknown: $_"); }
}

## perfect
#
#.......
#.......
#.......
#.......
#.......
#.......
#
#currentTurn 1 currentPlayer 1
#moves:  
#Using a 7 x 6 board, a 1.00 GB table, and 12 threads.
#
# . . . . . . .
# . . . . . . .
# . . . . . . .
# . . . . . . .
# . . . . . . .
# . . . . . . .
# 0 1 2 3 4 5 6
#
#0 42
#1 42
#2 42
#3 41
#4 42
#5 42
#6 42
#
#best move: 3
#
#[
#  [ 3, 41, 43 ],
#  [ 0, 42, 42 ],
#  [ 1, 42, 42 ],
#  [ 2, 42, 42 ],
#  [ 4, 42, 42 ],
#  [ 5, 42, 42 ],
#  [ 6, 42, 42 ]
#]
#4

## mcts
#
#.......
#.......
#.......
#.......
#.......
#...X...
#
#currentTurn 2 currentPlayer 2
#[1000 trials; 47 msecs]
#  1 0.37 (47/128)
#  2 0.35 (39/111)
#* 3 0.43 (99/232)
#  4 0.39 (59/153)
#  5 0.37 (50.5/135)
#  6 0.38 (55.5/145)
#  7 0.33 (32/96)
#avgSearchDepth 4.8190
#avgGameDepth 19.8140
#avgBranchingFactor 6.8242
#
#3

my $turn = 0;
my $player = 0;

my $moves = "";

my $move;

while (<>) {
    if (/run ([0-9]+)/) {
        $turn = 0;
        $player = 0;
        $moves = "";
    } elsif (/currentTurn ([0-9]+) currentPlayer ([0-9]+)/) {
        $turn = $1;
        $player = $2;
    } elsif (/^([0-9])$/) {
        $move = $1;
        if ($turn > 0) {
            print $player.",\#".$moves.",".$move."\n";
            $moves = $moves.$move;
        }
    }
}
