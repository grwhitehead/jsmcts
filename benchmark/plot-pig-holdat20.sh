#!/bin/sh

mkdir -p plots

PLAYERS="\
 data/pig-mcts1000-holdat20-wins\
 data/pig-holdat20-holdat20-wins\
 data/pig-mcts10000-holdat20-wins\
 data/pig-mcts100000-holdat20-wins\
 Optimal=0.54\
"

./stats.py $PLAYERS\
           -u -p -n 10000\
           -l labels-pig-holdat20.txt\
           -t "Mean Win Pct vs HoldAt20 Player"\
           -c -s plots/pig-holdat20.pdf 
