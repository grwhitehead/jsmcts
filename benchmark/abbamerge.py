#!/usr/bin/env python3
#coding: utf-8

from optparse import OptionParser
import sys
import numpy as np
import ast
import matplotlib.pyplot as plt
import matplotlib.ticker as plt_ticker


def main():
    parser = OptionParser("usage: %prog [options] game-p1-p2-1 game-p1-p2-2")
    parser.add_option("-v", action="store_true", dest="verbose", default=False, help="verbose output")
    parser.add_option("-n", action="store", type="int", dest="n", default=None, help="number of samples to output")
    (opts, args) = parser.parse_args()

    if len(args) != 2:
        parser.print_help()
        return

    def readdata(f):
        samples1 = np.loadtxt(f, delimiter=",", dtype=[('value', float)])
        samples2 = samples1.astype(object)
        samples = np.array([*samples2])
        return samples

    samples1 = readdata(args[0])
    samples2 = readdata(args[1])
    n = min(len(samples1),len(samples2))
    if opts.n:
        n = min((int)(opts.n/2), n)
    if opts.verbose:
        print(args[0], len(samples1))
        print(args[1], len(samples2))
        print(n);
        return

    for i in range(n):
        print(samples1[i][0])
        print(samples2[i][0])
    
if __name__ == "__main__":
    main()
