#!/bin/bash

JSMCTSDIR=..

mkdir -p runq
mkdir -p runs

G=connectfour

function gentest() {
    T_P1=$1
    T_P2=$2
    T_N=$3
    T_I=$4
    
    T_F=${G}-${T_P1}-${T_P2}-${T_I}
    echo ${T_F}
    cat <<EOF > runq/${T_F}.sh
(cd ${JSMCTSDIR}; ./run.sh sim${G}.js -p ${T_P1} -p ${T_P2} -n ${T_N}) > runs/${T_F}
EOF
}

N=100
NN=10
for NN_I in `seq $NN`; do

    PS="mcts1000000ev"
    PS="mcts100000crm10ev mcts1000000crm10ev"
    PS="mcts100000crm5ev mcts1000000crm5ev"
    for P in ${PS}; do

        gentest ${P} perfect ${N} ${NN_I}
        gentest perfect ${P} ${N} ${NN_I}

    done
done
