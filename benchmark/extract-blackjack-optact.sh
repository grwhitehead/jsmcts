#!/bin/sh

JSMCTSDIR=..

mkdir -p data

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
    
    cat data/blackjack-${p}-rundata\
        |NODE_PATH=${JSMCTSDIR}/js node extract-blackjack-rundata-optact.js >data/blackjack-${p}-optact

done

./stats.py data/blackjack-*-optact -p
