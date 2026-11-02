#!/bin/sh

EXT=png

mkdir -p plots

./stats.py data/blackjack-mimicdealer-winnings\
           -l labels-blackjack.txt\
           -t "MimicDealer Player Winnings per Hand"\
           -c -s plots/blackjack-mimicdealer-hist.${EXT}
./stats.py data/blackjack-optimum-winnings\
           -l labels-blackjack.txt\
           -t "BaldwinOptimum Player Winnings per Hand"\
           -c -s plots/blackjack-optimum-hist.${EXT}
./stats.py data/blackjack-mcts10000000tps250-winnings\
           -l labels-blackjack.txt\
           -t "MCTS10000000tps250 Player Winnings per Hand"\
           -c -s plots/blackjack-mcts10000000tps250-hist.${EXT}
