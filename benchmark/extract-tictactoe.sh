#!/bin/sh

shopt -s nullglob

mkdir -p data

G=tictactoe

PS="\
 perfect\
 random\
 mcts10\
 mcts100\
 mcts1000\
"

for p in ${PS}; do
    echo ${p}

    rm -f data/${G}-${p}-perfect-draws
    for r in runs/${G}-${p}-perfect-*; do
        cat ${r} |./extract-wins.pl --draw >>data/${G}-${p}-perfect-draws
    done
    
done

./stats.py -p data/${G}-*-perfect-draws
