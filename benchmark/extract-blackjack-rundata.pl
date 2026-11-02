
my $verbose = 0;
while ($#ARGV >= 0) {
    $_ = shift @ARGV;
    if (m/^--verbose$/)      { $verbose++; }
    elsif (m/^-v+$/)         { $verbose += length($_)-1; }
    else                     { usage("unknown: $_"); }
}

## optimal
#
#bet: 1
#hand: 6,10 (16)
#dealer: 10,*
#currentTurn 1 currentPlayer 1
#HIT
#bet: 1
#hand: 6,10,2 (18)
#dealer: 10,*
#currentTurn 1 currentPlayer 1
#STAND

## optimal
#
#bet: 1
#hand: 8,8 (16)
#dealer: 6,*
#currentTurn 1 currentPlayer 1
#SPLIT
#bet: 1
#->hand: 8,10 (18)
#bet2: 1
#hand2: 8,10 (18)
#dealer: 6,*
#currentTurn 1 currentPlayer 1
#STAND
#bet: 1
#hand: 8,10 (18)
#bet2: 1
#->hand2: 8,10 (18)
#dealer: 6,*
#currentTurn 2 currentPlayer 1
#STAND

## mcts
#
#bet: 1
#hand: 10,9 (19)
#dealer: 8,*
#currentTurn 1 currentPlayer 1
#[10000000 trials; 10069 msecs]
#* STAND 0.79 (7882403.5/9999868)
#  DOUBLE 0.41 (43.5/107)
#  HIT 0.00 (0/25)
#avgSearchDepth 1.0000
#avgGameDepth 1.0000
#avgBranchingFactor 3.0000
#
#STAND

my $turn = 0;
my $player = 0;
my $bet = 0;
my $bet2 = 0;
my $hand;
my $dealer;

my $move;

while (<>) {
    if (/run ([0-9]+)/) {
        $turn = 0;
        $player = 0;
        $bet = 0;
        $bet2 = 0;
    } elsif (/bet: ([0-9]+)/) {
        $bet = $1;
    } elsif (/hand: ([0-9,]+)/) {
        $hand = $1;
        $hand =~ s/10/0/g;
        $hand =~ s/,//g;
    } elsif (/bet2: ([0-9]+)/) {
        $bet2 = $1;
    } elsif (/->hand2: ([0-9,]+)/) {
        $bet = $bet2;
        $hand = $1;
        $hand =~ s/10/0/g;
        $hand =~ s/,//g;
    } elsif (/dealer: ([0-9]+)/) {
        $dealer = $1;
        $dealer =~ s/10/0/g;
    } elsif (/currentTurn ([0-9]+) currentPlayer ([0-9]+)/) {
        $turn = $1;
        $player = $2;
    } elsif (/^(STAND|DOUBLE|SPLIT|HIT)$/) {
        $move = $1;
        if ($turn > 0) {
            print $bet2.",".$bet.",\#".$hand.",\#".$dealer.",".$move."\n";
        }
    }
}
