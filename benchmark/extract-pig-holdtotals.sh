#!/bin/sh

shopt -s nullglob

mkdir -p data

PS="\
 holdat20\
 mcts1000000\
 optimal\
"

for p in ${PS}; do
    echo ${p}
    
    cat data/pig-${p}-optimal-rundata-1\
        |perl extract-pig-rundata-holdtotals.pl -p 1 >data/pig-${p}-optimal-holdtotals
    cat data/pig-${p}-optimal-rundata-2\
        |perl extract-pig-rundata-holdtotals.pl -p 2 >>data/pig-${p}-optimal-holdtotals

done

