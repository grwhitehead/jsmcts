#!/bin/sh

PLAYERS="\
 data/blackjack-mcts1000tps10-optact\
 data/blackjack-mcts10000tps100-optact\
 data/blackjack-mcts100000tps100-optact\
 data/blackjack-mcts1000000tps250-optact\
 data/blackjack-mcts10000000tps250-optact\
 data/blackjack-nobust-optact\
 data/blackjack-mimicdealer-optact\
 BaldwinOptimum=1\
"

./stats.py $PLAYERS\
           -p -n 100000\
           -l labels-blackjack.txt\
           -t "Player Optimum Action Pct"\
           -c -s plots/blackjack-optact.pdf
