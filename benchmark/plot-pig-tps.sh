#!/bin/sh

mkdir -p plots

PLAYERS="\
 data/pig-mcts1000-mcts1000-wins\
 data/pig-mcts1000tps10-mcts1000-wins\
 data/pig-mcts1000tps100-mcts1000-wins\
"

./stats.py $PLAYERS\
           -u -p -n 1000\
           -l labels-pig-tps.txt\
           -t "Mean Win Pct vs MCTS Player"

PLAYERS="\
 data/pig-mcts10000-mcts10000-wins\
 data/pig-mcts10000tps10-mcts10000-wins\
 data/pig-mcts10000tps100-mcts10000-wins\
 data/pig-mcts10000tps1000-mcts10000-wins\
"

./stats.py $PLAYERS\
           -u -p -n 1000\
           -l labels-pig-tps.txt\
           -t "Mean Win Pct vs MCTS Player"
PLAYERS="\
 data/pig-mcts100000-mcts100000-wins\
 data/pig-mcts100000tps10-mcts100000-wins\
 data/pig-mcts100000tps100-mcts100000-wins\
 data/pig-mcts100000tps1000-mcts100000-wins\
"

./stats.py $PLAYERS\
           -u -p -n 1000\
           -l labels-pig-tps.txt\
           -t "Mean Win Pct vs MCTS Player"
