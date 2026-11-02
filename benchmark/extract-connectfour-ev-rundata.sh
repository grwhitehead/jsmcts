#!/bin/sh

shopt -s nullglob

mkdir -p data

G=connectfour

PS="\
 mcts1000000ev\
"

for p in ${PS}; do
    echo ${p}

    rm -f data/${G}-${p}-perfect-rundata-1
    rm -f data/${G}-${p}-perfect-rundata-2
    for r in runs/${G}-${p}-perfect-*; do
        cat ${r} |perl extract-${G}-rundata.pl >>data/${G}-${p}-perfect-rundata-1
    done
    for r in runs/${G}-perfect-${p}-*; do
        cat ${r} |perl extract-${G}-rundata.pl >>data/${G}-${p}-perfect-rundata-2
    done

done
