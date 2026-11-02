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

N=100000
NN=10
for NN_I in `seq $NN`; do

    gentest nobust ${N} ${NN_I}
    gentest mimicdealer ${N} ${NN_I}
    
done

N=10000000
NN=10
for NN_I in `seq $NN`; do
    
    gentest optimum ${N} ${NN_I}
    
done
