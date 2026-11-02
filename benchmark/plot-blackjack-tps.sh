#!/bin/sh

mkdir -p plots


PLAYERS="\
 data/blackjack-mcts1000-winnings\
 data/blackjack-mcts1000tps10-winnings\
 data/blackjack-mcts1000tps100-winnings\
 data/blackjack-mcts10000-winnings\
 data/blackjack-mcts10000tps10-winnings\
 data/blackjack-mcts10000tps100-winnings\
 data/blackjack-mcts10000tps250-winnings\
 data/blackjack-mcts10000tps500-winnings\
 data/blackjack-mcts10000tps1000-winnings\
 data/blackjack-mcts100000-winnings\
 data/blackjack-mcts100000tps10-winnings\
 data/blackjack-mcts100000tps100-winnings\
 data/blackjack-mcts100000tps250-winnings\
 data/blackjack-mcts100000tps500-winnings\
 data/blackjack-mcts100000tps1000-winnings\
 data/blackjack-mcts1000000-winnings\
 data/blackjack-mcts1000000tps10-winnings\
 data/blackjack-mcts1000000tps100-winnings\
 data/blackjack-mcts1000000tps250-winnings\
 data/blackjack-mcts1000000tps500-winnings\
 data/blackjack-mcts1000000tps1000-winnings\
 data/blackjack-mcts10000000tps100-winnings\
 data/blackjack-mcts10000000tps250-winnings\
 data/blackjack-mcts10000000tps500-winnings\
 data/blackjack-mcts10000000tps1000-winnings\
"

./stats.py $PLAYERS\
           -u -n 10000\
           -l labels-blackjack-tps.txt\
           -t "Mean Winnings per Hand"

