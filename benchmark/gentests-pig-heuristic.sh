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
NN=50
for NN_I in `seq $NN`; do

    gentest optimal optimal ${N} ${NN_I}

    gentest holdat20 optimal ${N} ${NN_I}
    gentest optimal holdat20 ${N} ${NN_I}

    gentest keeppaceendrace optimal ${N} ${NN_I}
    gentest optimal keeppaceendrace ${N} ${NN_I}
done
