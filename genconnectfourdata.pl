#!/usr/bin/env perl

#
# build connectfour bestmoveCache from run data
#
# cat runs/connectfour-*perfect* |./genconnectfourdata.pl >js/connectfourdata.js
#

my $verbose = 0;
while ($#ARGV >= 0) {
    $_ = shift @ARGV;
    if (m/^--verbose$/)      { $verbose++; }
    elsif (m/^-v+$/)         { $verbose += length($_)-1; }
    else                     { usage("unknown: $_"); }
}

## perfect
#.......
#.......
#.......
#.......
#.......
#.......
#
#currentTurn 1 currentPlayer 1
#moves:  
#Using a 7 x 6 board, a 1.00 GB table, and 12 threads.
#
# . . . . . . .
# . . . . . . .
# . . . . . . .
# . . . . . . .
# . . . . . . .
# . . . . . . .
# 0 1 2 3 4 5 6
#
#0 42
#1 42
#2 42
#3 41
#4 42
#5 42
#6 42
#
#best move: 3
#
#[
#  [ 3, 41, 43 ],
#  [ 0, 42, 42 ],
#  [ 1, 42, 42 ],
#  [ 2, 42, 42 ],
#  [ 4, 42, 42 ],
#  [ 5, 42, 42 ],
#  [ 6, 42, 42 ]
#]
#4

## perfect sigma
#.......
#.......
#.......
#.......
#.......
#.......
#
#currentTurn 1 currentPlayer 1
#moves:  
#Using a 7 x 6 board, a 1.00 GB table, and 12 threads.
#
# . . . . . . .
# . . . . . . .
# . . . . . . .
# . . . . . . .
# . . . . . . .
# . . . . . . .
# 0 1 2 3 4 5 6
#
#0 42
#1 42
#2 42
#3 41
#4 42
#5 42
#6 42
#
#best move: 3
#
#[
#  [ 3, 41, 43 ],
#  [ 0, 42, 42 ],
#  [ 1, 42, 42 ],
#  [ 2, 42, 42 ],
#  [ 4, 42, 42 ],
#  [ 5, 42, 42 ],
#  [ 6, 42, 42 ]
#]
#rand 0
#4

my %cache;

my $state = 0;
my $moves = "";

while (<>) {
    if ($state == 0) {
        if (/^moves:[ ]+([0-9]*)/) {
            $moves = $1;
            if (length($moves) < 20 && !$cache{$moves}) {
                if ($verbose) {
                    print $moves."\n";
                }
                $cache{$moves} = "";
                $state = 1;
            }
        }
    } else {
        $cache{$moves} .= $_;
        if (/^best move:/) {
            if ($verbose) {
                print $cache{$moves};
            }
            $state = 0;
        }
    }
}

print <<'EOL';
/*
 * MIT License
 *
 * Copyright (c) 2022-2023 Greg Whitehead
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function(exports, require){

exports.bestmoveCache = {
EOL

for my $key (keys %cache) {
    print "'".$key."': \`".$cache{$key}."\`,\n";
}

print <<'EOL';
};

}(typeof exports === 'undefined' ? this.exports_connectfourdata = {} : exports, typeof exports === 'undefined' ? function(m) { return this['exports_'+m] } : require));
EOL

