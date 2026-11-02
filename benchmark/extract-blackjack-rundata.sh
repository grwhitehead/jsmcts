#!/bin/sh

shopt -s nullglob

mkdir -p data

G=blackjack

PS="\
 mimicdealer\
 nobust\
 mcts1000tps10\
 mcts10000tps100\
 mcts100000tps100\
 mcts1000000tps250\
 mcts10000000tps250\
"

for p in ${PS}; do
    echo ${p}
    
    rm -f data/${G}-${p}-rundata
    for r in runs/${G}-${p}-*; do
        cat ${r} |perl extract-${G}-rundata.pl >>data/${G}-${p}-rundata
    done

done
