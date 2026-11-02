#!/bin/sh

shopt -s nullglob

mkdir -p data

G=blackjack

PS="\
 mcts1000 mcts1000tps10 mcts1000tps100\
 mcts10000 mcts10000tps10 mcts10000tps100 mcts10000tps250 mcts10000tps500 mcts10000tps1000\
 mcts100000 mcts100000tps10 mcts100000tps100 mcts100000tps250 mcts10000tps500 mcts100000tps1000\
 mcts1000000 mcts1000000tps10 mcts1000000tps100 mcts1000000tps250 mcts1000000tps500 mcts1000000tps1000\
 mcts10000000tps100 mcts10000000tps250 mcts10000000tps500 mcts10000000tps1000\
"

for p in ${PS}; do
    echo ${p}

    rm -f data/${G}-${p}-winnings
    for r in runs/${G}-${p}-*; do
        cat ${r} |./extract-winnings.pl >>data/${G}-${p}-winnings
    done

done

./stats.py data/${G}-*-winnings
