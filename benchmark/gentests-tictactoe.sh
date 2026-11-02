#!/bin/bash

JSMCTSDIR=..

mkdir -p runq
mkdir -p runs

G=tictactoe

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

N=1000
NN=10
for NN_I in `seq $NN`; do
    
    gentest perfect perfect ${N} ${NN_I}
    
    gentest random perfect ${N} ${NN_I}
    
    PS="mcts10 mcts100 mcts1000"
    for P in ${PS}; do
        
        gentest ${P} perfect ${N} ${NN_I}
        
    done
done
