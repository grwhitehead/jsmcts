#!/bin/sh

mkdir -p plots

PLAYERS="\
 data/tictactoe-perfect-perfect-draws\
 Perfect=1\
"

./stats.py $PLAYERS\
           -u -p\
           -l labels-tictactoe.txt\
           -t "Mean Draw Pct vs Perfect Play"\

PLAYERS="\
 data/tictactoe-random-perfect-draws\
 data/tictactoe-mcts10-perfect-draws\
 data/tictactoe-mcts100-perfect-draws\
 data/tictactoe-mcts1000-perfect-draws\
 Perfect=1\
"

./stats.py $PLAYERS\
           -p\
           -l labels-tictactoe.txt\
           -t "Mean Draw Pct vs Perfect Play"\
           -c -s plots/tictactoe.pdf
