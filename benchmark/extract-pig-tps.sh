#!/bin/sh

shopt -s nullglob

mkdir -p data

G=pig

PS="mcts1000 mcts1000tps10 mcts1000tps100"
for p in ${PS}; do
    echo ${p}

    rm -f data/${G}-${p}-mcts1000-wins
    rm -f data/${G}-${p}-mcts1000-wins-1
    rm -f data/${G}-${p}-mcts1000-wins-2
    for r in runs/${G}-${p}-mcts1000-*; do
        cat ${r} |./extract-wins.pl --player 1 >>data/${G}-${p}-mcts1000-wins-1
    done
    for r in runs/${G}-mcts1000-${p}-*; do
        cat ${r} |./extract-wins.pl --player 2 >>data/${G}-${p}-mcts1000-wins-2
    done
    if [ -f data/${G}-${p}-mcts1000-wins-1 ]; then
        cat data/${G}-${p}-mcts1000-wins-1 >>data/${G}-${p}-mcts1000-wins
    fi
    if [ -f data/${G}-${p}-mcts1000-wins-2 ]; then
        cat data/${G}-${p}-mcts1000-wins-2 >>data/${G}-${p}-mcts1000-wins
    fi
    
done

PS="mcts10000 mcts10000tps10 mcts10000tps100 mcts10000tps1000"
for p in ${PS}; do
    echo ${p}

    rm -f data/${G}-${p}-mcts10000-wins
    rm -f data/${G}-${p}-mcts10000-wins-1
    rm -f data/${G}-${p}-mcts10000-wins-2
    for r in runs/${G}-${p}-mcts10000-*; do
        cat ${r} |./extract-wins.pl --player 1 >>data/${G}-${p}-mcts10000-wins-1
    done
    for r in runs/${G}-mcts10000-${p}-*; do
        cat ${r} |./extract-wins.pl --player 2 >>data/${G}-${p}-mcts10000-wins-2
    done
    if [ -f data/${G}-${p}-mcts10000-wins-1 ]; then
        cat data/${G}-${p}-mcts10000-wins-1 >>data/${G}-${p}-mcts10000-wins
    fi
    if [ -f data/${G}-${p}-mcts10000-wins-2 ]; then
        cat data/${G}-${p}-mcts10000-wins-2 >>data/${G}-${p}-mcts10000-wins
    fi
    
done

PS="mcts100000 mcts100000tps10 mcts100000tps100 mcts100000tps1000"
for p in ${PS}; do
    echo ${p}

    rm -f data/${G}-${p}-mcts100000-wins
    rm -f data/${G}-${p}-mcts100000-wins-1
    rm -f data/${G}-${p}-mcts100000-wins-2
    for r in runs/${G}-${p}-mcts100000-*; do
        cat ${r} |./extract-wins.pl --player 1 >>data/${G}-${p}-mcts100000-wins-1
    done
    for r in runs/${G}-mcts100000-${p}-*; do
        cat ${r} |./extract-wins.pl --player 2 >>data/${G}-${p}-mcts100000-wins-2
    done
    if [ -f data/${G}-${p}-mcts100000-wins-1 ]; then
        cat data/${G}-${p}-mcts100000-wins-1 >>data/${G}-${p}-mcts100000-wins
    fi
    if [ -f data/${G}-${p}-mcts100000-wins-2 ]; then
        cat data/${G}-${p}-mcts100000-wins-2 >>data/${G}-${p}-mcts100000-wins
    fi
    
done

./stats.py -p data/${G}-*-mcts1000-wins
./stats.py -p data/${G}-*-mcts10000-wins
./stats.py -p data/${G}-*-mcts100000-wins
