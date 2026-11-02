#!/bin/bash

JSMCTSDIR=..

mkdir -p runq
mkdir -p runs

G=blackjack

function gentest() {
    T_P=$1
    T_N=$2
    T_I=$3
    
    T_F=${G}-${T_P}-${T_I}
    echo ${T_F}
    cat <<EOF > runq/${T_F}.sh
(cd ${JSMCTSDIR}; ./run.sh sim${G}.js --benchmark -p ${T_P} -n ${T_N}) > runs/${T_F}
EOF
}

N=1000
NN=10
for NN_I in `seq $NN`; do
    
    PS="mcts1000 mcts1000tps10 mcts1000tps100\
 mcts10000 mcts10000tps10 mcts10000tps100 mcts10000tps1000\
 mcts100000 mcts100000tps10 mcts100000tps100 mcts100000tps1000\
 mcts1000000 mcts1000000tps10 mcts1000000tps100 mcts1000000tps250 mcts1000000tps500 mcts1000000tps1000\
 mcts10000000tps100 mcts10000000tps250 mcts10000000tps500 mcts10000000tps1000"
    for P in ${PS}; do

        gentest ${P} ${N} ${NN_I}

    done
done
