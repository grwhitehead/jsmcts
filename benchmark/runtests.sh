#!/bin/sh

if [ $# != 2 ]; then
    echo "usage: runtests.sh <prefix> <parallel>"
    exit 1
fi

PREFIX=$1
PARALLEL=$2

echo "running"
find runq -name ${PREFIX}\*

nohup $SHELL <<EOF &
find runq -name ${PREFIX}\* |xargs -n 1 -P ${PARALLEL} /bin/sh
EOF
