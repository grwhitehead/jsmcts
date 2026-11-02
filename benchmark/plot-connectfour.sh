#!/bin/sh

EXT=png

mkdir -p plots

PLAYERS="\
 data/connectfour-perfect-perfect-wins\
 Perfect=1\
"

./stats.py $PLAYERS\
           -u -p\
           -l labels-connectfour.txt\
           -t "Mean Win Pct vs Perfect Second Player"

PLAYERS="\
 data/connectfour-random-perfect-wins\
 data/connectfour-mcts1000-perfect-wins\
 data/connectfour-mcts10000-perfect-wins\
 data/connectfour-mcts100000-perfect-wins\
 data/connectfour-mcts1000000-perfect-wins\
 Perfect=1
"

./stats.py $PLAYERS\
           -u -p\
           -l labels-connectfour.txt\
           -t "Mean Win Pct vs Perfect Second Player"\
           -c -s plots/connectfour-other-v-perfect.${EXT}

PLAYERS="\
 data/connectfour-perfect-perfect-movecount\
 Perfect=41
"

./stats.py $PLAYERS\
           -u\
           -l labels-connectfour.txt\
           -t "Mean Moves to Win vs Perfect First Player"

PLAYERS="\
 data/connectfour-perfect-random-movecount\
 data/connectfour-perfect-mcts1000-movecount\
 data/connectfour-perfect-mcts10000-movecount\
 data/connectfour-perfect-mcts100000-movecount\
 data/connectfour-perfect-mcts1000000-movecount\
 Perfect=41
"

./stats.py $PLAYERS\
           -l labels-connectfour.txt\
           -t "Mean Moves to Win vs Perfect First Player"\
           -c -s plots/connectfour-perfect-v-other-movecount.${EXT}
