#!/bin/sh

shopt -s nullglob

mkdir -p data

G=pig

PS="\
 optimal\
 holdat20\
 keeppaceendrace\
 random\
 mcts1000\
 mcts10000\
 mcts100000\
 mcts1000000\
"

for p in ${PS}; do
    echo ${p}

    rm -f data/${G}-${p}-optimal-wins
    rm -f data/${G}-${p}-optimal-wins-1
    rm -f data/${G}-${p}-optimal-wins-2
    for r in runs/${G}-${p}-optimal-*; do
        cat ${r} |./extract-wins.pl --player 1 >>data/${G}-${p}-optimal-wins-1
    done
    for r in runs/${G}-optimal-${p}-*; do
        cat ${r} |./extract-wins.pl --player 2 >>data/${G}-${p}-optimal-wins-2
    done
    if [ -f data/${G}-${p}-optimal-wins-1 ]; then
        cat data/${G}-${p}-optimal-wins-1 >>data/${G}-${p}-optimal-wins
    fi
    if [ -f data/${G}-${p}-optimal-wins-2 ]; then
        cat data/${G}-${p}-optimal-wins-2 >>data/${G}-${p}-optimal-wins
    fi
    
done

./stats.py -p data/${G}-*-optimal-wins
