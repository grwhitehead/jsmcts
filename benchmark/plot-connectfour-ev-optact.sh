#!/bin/sh

mkdir -p plots

PLAYERS="\
 data/connectfour-mcts1000000-perfect-optact\
 data/connectfour-mcts1000000ev-perfect-optact\
 Perfect=1
"

./stats.py $PLAYERS\
           -p -n 20000\
           -l labels-connectfour.txt\
           -t "Player Perfect Move Pct"

PLAYERS="\
 data/connectfour-mcts1000000-perfect-optact-1\
 data/connectfour-mcts1000000ev-perfect-optact-1\
"

./stats.py $PLAYERS\
           -p -n 20000\
           -l labels-connectfour.txt\
           -t "Player 1 Perfect Move Pct"

PLAYERS="\
 data/connectfour-mcts1000000-perfect-optact-2\
 data/connectfour-mcts1000000ev-perfect-optact-2\
"

./stats.py $PLAYERS\
           -p -n 20000\
           -l labels-connectfour.txt\
           -t "Player 2 Perfect Move Pct"
