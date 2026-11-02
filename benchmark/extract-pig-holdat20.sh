#!/bin/sh

shopt -s nullglob

mkdir -p data

G=pig

PS="\
 holdat20
 mcts1000\
 mcts10000\
 mcts100000\
"

for p in ${PS}; do
    echo ${p}
    
    rm -f data/${G}-${p}-holdat20-wins
    rm -f data/${G}-${p}-holdat20-wins-1
    rm -f data/${G}-${p}-holdat20-wins-2
    for r in runs/${G}-${p}-holdat20-*; do
        cat ${r} |./extract-wins.pl --player 1 >>data/${G}-${p}-holdat20-wins-1
    done
    for r in runs/${G}-holdat20-${p}-*; do
        cat ${r} |./extract-wins.pl --player 2 >>data/${G}-${p}-holdat20-wins-2
    done
    if [ -f data/${G}-${p}-holdat20-wins-1 ]; then
        cat data/${G}-${p}-holdat20-wins-1 >>data/${G}-${p}-holdat20-wins
    fi
    if [ -f data/${G}-${p}-holdat20-wins-2 ]; then
        cat data/${G}-${p}-holdat20-wins-2 >>data/${G}-${p}-holdat20-wins
    fi
    
done

./stats.py -p data/${G}-*-holdat20-wins
