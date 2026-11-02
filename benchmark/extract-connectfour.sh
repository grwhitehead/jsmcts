#!/bin/sh

shopt -s nullglob

mkdir -p data

G=connectfour

PS="\
 perfect\
 random\
 mcts1000\
 mcts10000\
 mcts100000\
 mcts1000000\
"

for p in ${PS}; do
    echo ${p}

    rm -f data/${G}-${p}-perfect-wins
    for r in runs/${G}-${p}-perfect-*; do
        cat ${r} |./extract-wins.pl >>data/${G}-${p}-perfect-wins
    done
    
    rm -f data/${G}-perfect-${p}-movecount
    for r in runs/${G}-perfect-${p}-*; do
        cat ${r} |./extract-movecount.pl >>data/${G}-perfect-${p}-movecount
    done

done

./stats.py -p data/${G}-*-perfect-wins

./stats.py data/${G}-perfect-*-movecount
