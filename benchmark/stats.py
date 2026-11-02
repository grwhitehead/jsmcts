#!/usr/bin/env python3
#coding: utf-8

from optparse import OptionParser
import sys
import numpy as np
import ast
import matplotlib.pyplot as plt
import matplotlib.ticker as plt_ticker


def main():
    parser = OptionParser("usage: %prog [options] files")
    parser.add_option("-v", action="store_true", dest="verbose", default=False, help="verbose output")
    parser.add_option("-n", action="store", type="int", dest="n", default=None, help="number of samples to plot")
    parser.add_option("--oneminus", action="store_true", dest="oneminus", default=False, help="plot 1-sample")
    parser.add_option("-l", action="store", dest="labels", default=None, help="labels")
    parser.add_option("-u", action="store_true", dest="unsorted", default=False, help="unsorted (use argument order)")
    parser.add_option("-p", action="store_true", dest="pct", default=False, help="format as %")
    parser.add_option("-c", action="store_true", dest="chart", default=False, help="generate bar chart (default no chart)")
    parser.add_option("-t", action="store", dest="title", default=None, help="title")
    parser.add_option("-s", action="store", dest="savefile", default=None, help="save to file")
    (opts, args) = parser.parse_args()

    if len(args) == 0:
        parser.print_help()
        return

    labels = None
    if (opts.labels):
        with open(opts.labels, "r") as data:
            labels = ast.literal_eval(data.read())
    
    data = []
    for fpath in args:
        if '=' in fpath:
            name,value = fpath.split('=')
            label = labels[name] if opts.labels and name in labels else name
            data += [(label, 0, value, 0)]
        else:
            fname = fpath.split("/")[-1];
            label = labels[fname] if opts.labels and fname in labels else fname
            samples = np.loadtxt(fpath)
            if len(samples) == 0:
                continue
            if opts.n:
                samples = samples[:opts.n]
            if opts.oneminus:
                samples = 1-samples
            data += [(label, len(samples), np.mean(samples), np.std(samples)/np.sqrt(len(samples)))]
            
    data = np.array(data, dtype=[('name', object), ('samples', int), ('mean', float), ('stderr', float)])
    if not opts.unsorted:
        data.sort(axis=0, order='mean')
    if opts.verbose:
        print(data)

    print("|Player|Samples|Mean|Standard Error|")
    print("|---|---|---|---|")
    for i in range(len(data)):
        if opts.pct:
            if data[i][1] == 0:
                print("|{}||{:.2f}||".format(data[i][0], 100*data[i][2]))
            else:
                print("|{}|{}|{:.2f}|{:.2f}|".format(data[i][0], data[i][1], 100*data[i][2], 100*data[i][3]))
        else:
            if data[i][1] == 0:
                print("|{}||{:.4f}||".format(data[i][0], data[i][2]))
            else:
                print("|{}|{}|{:.4f}|{:.4f}|".format(data[i][0], data[i][1], data[i][2], data[i][3]))

    if opts.chart:
        fig = plt.figure()
        fig.set_tight_layout(True)

        if opts.title:
            plt.title(opts.title)

        if len(data) == 1:
            # for blackjack histograms
            plt.hist(samples, 13, range=[-3,3.5], align='left')
            plt.gca().yaxis.set_major_formatter(plt_ticker.PercentFormatter(len(samples)))
            plt.gca().set_ylim([0,len(samples)/2])

            
        else:
            plt.bar(range(len(data)), data[:]['mean'], yerr=data[:]['stderr'], capsize=5, tick_label=[labels[n] if opts.labels and n in labels else n for n in data[:]['name']])
            plt.xticks(rotation=45, ha="right")
            if opts.pct:
                plt.gca().yaxis.set_major_formatter(plt_ticker.PercentFormatter(1))

        if opts.savefile:
            plt.savefig(opts.savefile);
        else:
            plt.show()
        
if __name__ == "__main__":
    main()
