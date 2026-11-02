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

N=1000
NN=10
for NN_I in `seq $NN`; do

    gentest holdat20 holdat20 ${N} ${NN_I}
    
    PS="mcts1000 mcts10000 mcts100000"
    for P in ${PS}; do

        gentest ${P} holdat20 ${N} ${NN_I}
        gentest holdat20 ${P} ${N} ${NN_I}

    done
done
