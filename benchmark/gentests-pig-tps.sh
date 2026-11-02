#!/bin/bash

JSMCTSDIR=..

mkdir -p runq
mkdir -p runs

G=pig

function gentest() {
    T_P1=$1
    T_P2=$2
    T_N=$3
    T_I=$4
    
    T_F=${G}-${T_P1}-${T_P2}-${T_I}
    echo ${T_F}
    cat <<EOF > runq/${T_F}.sh
(cd ${JSMCTSDIR}; ./run.sh sim${G}.js --benchmark -p ${T_P1} -p ${T_P2} -n ${T_N}) > runs/${T_F}
EOF
}

N=100
NN=10
for NN_I in `seq $NN`; do

    PS="mcts1000 mcts1000tps10 mcts1000tps100"
    for P in ${PS}; do

        gentest ${P} mcts1000 ${N} ${NN_I}
        gentest mcts1000 ${P} ${N} ${NN_I}

    done

    PS="mcts10000 mcts10000tps10 mcts10000tps100 mcts10000tps1000"
    for P in ${PS}; do

        gentest ${P} mcts10000 ${N} ${NN_I}
        gentest mcts10000 ${P} ${N} ${NN_I}

    done
    
    PS="mcts100000 mcts100000tps10 mcts100000tps100 mcts100000tps1000"
    for P in ${PS}; do

        gentest ${P} mcts100000 ${N} ${NN_I}
        gentest mcts100000 ${P} ${N} ${NN_I}

    done
done
