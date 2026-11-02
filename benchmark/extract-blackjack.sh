#!/bin/sh

shopt -s nullglob

mkdir -p data

G=blackjack

PS="\
 optimum\
 nobust\
 mimicdealer\
 random\
 mcts1000tps10\
 mcts10000tps100\
 mcts100000tps100\
 mcts1000000tps100\
 mcts1000000tps250\
 mcts10000000tps100\
"

for p in ${PS}; do
    echo ${p}

    rm -f data/${G}-${p}-winnings
    for r in runs/${G}-${p}-*; do
        cat ${r} |./extract-winnings.pl >>data/${G}-${p}-winnings
    done

done

./stats.py data/${G}-*-winnings
