#!/bin/sh

mkdir -p plots

PLAYERS="\
 data/pig-mcts1000-optimal-optact\
 data/pig-mcts10000-optimal-optact\
 data/pig-mcts100000-optimal-optact\
 data/pig-mcts1000000-optimal-optact\
 data/pig-holdat20-optimal-optact\
 data/pig-keeppaceendrace-optimal-optact\
 Optimal=1\
"

./stats.py $PLAYERS\
           -p -n 400000\
           -l labels-pig.txt\
           -t "Player Optimal Action Pct"\
           -c -s plots/pig-optact.pdf
