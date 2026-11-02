#!/usr/bin/env python3
#coding: utf-8

from optparse import OptionParser
import sys
import numpy as np
import ast
import matplotlib.pyplot as plt
import matplotlib.ticker as plt_ticker


def main():
    parser = OptionParser("usage: %prog [options] file")
    parser.add_option("-v", action="store_true", dest="verbose", default=False, help="verbose output")
    parser.add_option("-n", action="store", type="int", dest="n", default=None, help="number of samples to plot")
    parser.add_option("-t", action="store", dest="title", default=None, help="title")
    parser.add_option("-s", action="store", dest="savefile", default=None, help="save to file")
    (opts, args) = parser.parse_args()

    if len(args) != 1:
        parser.print_help()
        return

    samples = np.loadtxt(args[0], delimiter=",")
    if opts.n:
        samples = samples[:opts.n]
    if opts.verbose:
        print(samples)

    fig = plt.figure()
    fig.set_tight_layout(True)
    plt.tick_params(
        axis='x',
        which='both',
        bottom=False,
        top=False,
        labelbottom=False)
    plt.tick_params(
        axis='y',
        which='both',
        left=False,
        right=False,
        labelleft=False)

    if opts.title:
        plt.title(opts.title)

    if len(samples[0]) == 3:
        ax = fig.add_subplot(projection='3d')
        ax.view_init(elev=15, azim=-100, roll=0)
        ax.scatter(samples[:,0],samples[:,1],samples[:,2])
        plt.gca().set_xlim([0,100])
        plt.gca().set_ylim([0,100])
        plt.gca().set_zlim([0,100])
        ax.set_xlabel('$Score$')
        ax.set_ylabel('$Opp Score$')
        ax.set_zlabel(r'$Hold Total$')
    else:
        ax = fig.add_subplot()
        ax.scatter(samples[:,0],samples[:,1])
        plt.gca().set_xlim([0,100])
        plt.gca().set_ylim([0,100])
        ax.set_xlabel('$Opp Score$')
        ax.set_ylabel('$Hold Total$')

    if opts.savefile:
        plt.savefig(opts.savefile);
    else:
        plt.show()
        
if __name__ == "__main__":
    main()
