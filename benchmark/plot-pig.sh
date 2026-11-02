#!/bin/sh

mkdir -p plots

PLAYERS="\
 data/pig-holdat20-optimal-wins\
 HoldAt20=0.46\
 data/pig-keeppaceendrace-optimal-wins\
 KeepPaceEndRace=0.4954
 data/pig-optimal-optimal-wins\
 Optimal=0.5\
"

./stats.py $PLAYERS\
           -u -p\
           -l labels-pig.txt\
           -t "Mean Win Pct vs Optimal Player"

PLAYERS="\
 data/pig-random-optimal-wins\
 data/pig-mcts1000-optimal-wins\
 data/pig-mcts10000-optimal-wins\
 data/pig-mcts100000-optimal-wins\
 data/pig-mcts1000000-optimal-wins\
 HoldAt20=0.46\
 KeepPaceEndRace=0.4954
 Optimal=0.5\
"

./stats.py $PLAYERS\
           -p -n 10000\
           -l labels-pig.txt\
           -t "Mean Win Pct vs Optimal Player"\
           -c -s plots/pig.pdf
