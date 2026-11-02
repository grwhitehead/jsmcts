#!/bin/sh

shopt -s nullglob

JSMCTSDIR=..

mkdir -p data

PS="\
 mcts1000000ev\
"

for p in ${PS}; do
    echo ${p}
    
    cat data/connectfour-${p}-perfect-rundata-1\
        |NODE_PATH=${JSMCTSDIR}/js node extract-connectfour-rundata-optact.js -p 1 >data/connectfour-${p}-perfect-optact-1
    cat data/connectfour-${p}-perfect-rundata-2\
        |NODE_PATH=${JSMCTSDIR}/js node extract-connectfour-rundata-optact.js -p 2 >data/connectfour-${p}-perfect-optact-2
    ./abbamerge.py data/connectfour-${p}-perfect-optact-1 data/connectfour-${p}-perfect-optact-2 >data/connectfour-${p}-perfect-optact

done

./stats.py data/connectfour-*-optact -p
