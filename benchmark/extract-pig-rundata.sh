#!/bin/sh

shopt -s nullglob

mkdir -p data

G=pig

PS="\
 optimal\
 keeppaceendrace\
 holdat20\
 mcts1000\
 mcts10000\
 mcts100000\
 mcts1000000\
"

for p in ${PS}; do
    echo ${p}

    rm -f data/${G}-${p}-optimal-rundata-1
    rm -f data/${G}-${p}-optimal-rundata-2
    for r in runs/${G}-${p}-optimal-*; do
        cat ${r} |perl extract-${G}-rundata.pl >>data/${G}-${p}-optimal-rundata-1
    done
    for r in runs/${G}-optimal-${p}-*; do
        cat ${r} |perl extract-${G}-rundata.pl >>data/${G}-${p}-optimal-rundata-2
    done

done
