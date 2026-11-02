#!/bin/sh

EXT=png

mkdir -p plots

PLAYERS="\
 data/blackjack-nobust-winnings
 NoBust=-0.08\
 data/blackjack-mimicdealer-winnings
 MimicDealer=-0.057\
"

./stats.py $PLAYERS\
           -u -n 1000000\
           -l labels-blackjack.txt\
           -t "Mean Winnings per Hand"

PLAYERS="\
 data/blackjack-optimum-winnings
 BaldwinOptimum=0.0009\
"

./stats.py $PLAYERS\
           -u -n 100000000\
           -l labels-blackjack.txt\
           -t "Mean Winnings per Hand"

PLAYERS="\
 data/blackjack-random-winnings\
 data/blackjack-mcts1000tps10-winnings\
 data/blackjack-mcts10000tps100-winnings\
 data/blackjack-mcts100000tps100-winnings\
 data/blackjack-mcts1000000tps250-winnings\
 data/blackjack-mcts10000000tps250-winnings\
 NoBust=-0.08\
 MimicDealer=-0.057\
 BaldwinOptimum=0.0009\
"

./stats.py $PLAYERS\
           -n 100000\
           -l labels-blackjack.txt\
           -t "Mean Winnings per Hand"\
           -c -s plots/blackjack.${EXT}
