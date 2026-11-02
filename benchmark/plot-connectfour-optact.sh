#!/bin/sh

mkdir -p plots

PLAYERS="\
 data/connectfour-mcts1000-perfect-optact\
 data/connectfour-mcts10000-perfect-optact\
 data/connectfour-mcts100000-perfect-optact\
 data/connectfour-mcts1000000-perfect-optact\
 Perfect=1
"

./stats.py $PLAYERS\
           -p -n 20000\
           -l labels-connectfour.txt\
           -t "Player Perfect Move Pct"\
           -c -s plots/connectfour-optact.pdf
