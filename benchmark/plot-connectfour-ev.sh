#!/bin/sh

EXT=png

mkdir -p plots

PLAYERS="\
 data/connectfour-mcts1000000-perfect-wins\
 data/connectfour-mcts1000000ev-perfect-wins\
 Perfect=1\
"

./stats.py $PLAYERS\
           -u -p\
           -l labels-connectfour.txt\
           -t "Mean Win Pct vs Perfect Second Player"\
           -c -s plots/connectfour-mcts1000000ev-v-perfect.${EXT}

PLAYERS="\
 data/connectfour-perfect-mcts1000000-movecount\
 data/connectfour-perfect-mcts1000000ev-movecount\
 Perfect=41
"

./stats.py $PLAYERS\
           -l labels-connectfour.txt\
           -t "Mean Moves to Win vs Perfect First Player"
