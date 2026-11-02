#!/bin/sh

shopt -s nullglob

JSMCTSDIR=..

mkdir -p data

PS="\
 holdat20\
 keeppaceendrace\
 mcts1000\
 mcts10000\
 mcts100000\
 mcts1000000\
"

for p in ${PS}; do
    echo ${p}
    
    cat data/pig-${p}-optimal-rundata-1\
        |NODE_PATH=${JSMCTSDIR}/js node extract-pig-rundata-optact.js -p 1 >data/pig-${p}-optimal-optact-1
    cat data/pig-${p}-optimal-rundata-2\
        |NODE_PATH=${JSMCTSDIR}/js node extract-pig-rundata-optact.js -p 2 >data/pig-${p}-optimal-optact-2
    ./abbamerge.py data/pig-${p}-optimal-optact-1 data/pig-${p}-optimal-optact-2 >data/pig-${p}-optimal-optact

done

./stats.py data/pig-*-optact -p
