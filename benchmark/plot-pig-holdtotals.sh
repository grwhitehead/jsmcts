#!/bin/sh

EXT=pdf

./scatter.py data/pig-holdat20-optimal-holdtotals\
             -n 100000\
             -t "HoldAt20 Player Hold Totals"\
             -s plots/pig-holdat20-optimal-holdtotals.${EXT}

./scatter.py data/pig-mcts1000000-optimal-holdtotals\
             -n 100000\
             -t "MCTS1000000 Player Hold Totals"\
             -s plots/pig-mcts1000000-optimal-holdtotals.${EXT}

./scatter.py data/pig-optimal-optimal-holdtotals\
             -n 100000\
             -t "Optimal Player Hold Totals"\
             -s plots/pig-optimal-optimal-holdtotals.${EXT}
