#!/usr/bin/env python3 -u
#coding: utf-8

import numpy as np
import json

#_P_ijk_est = np.zeros((100,100,100))
_P_ijk_est = [[[0 for i in range(100)] for j in range(100)] for k in range(100)]

def P_ijk_est(i, j, k):
    if i+k >= 100:
        return 1.0
    elif j >= 100:
        return 0.0
    else:
        return _P_ijk_est[i][j][k]

def P_ijk_roll(i, j, k):
    return (1.0 - P_ijk_est(j, i, 0)
            + P_ijk_est(i, j, k+2)
            + P_ijk_est(i, j, k+3)
            + P_ijk_est(i, j, k+4)
            + P_ijk_est(i, j, k+5)
            + P_ijk_est(i, j, k+6))/6.0

def P_ijk_hold(i, j, k):
    return 1.0 - P_ijk_est(j, i+k, 0)

def P_ijk(i, j, k):
    return max(P_ijk_roll(i, j, k), P_ijk_hold(i, j, k))

def update(i, j, k):
    est0 = _P_ijk_est[i][j][k]
    _P_ijk_est[i][j][k] = P_ijk(i, j, k)
    return abs(est0 - _P_ijk_est[i][j][k])

while True:
    dmax = 0.0
    for i in range(100):
        for j in range(100):
            for k in range(100-i):
                d = update(i, j, k)
                if d > dmax:
                    dmax = d
    if dmax < 1e-12:
        break
    #print(dmax)

#print(P_ijk(0,0,0))
#print(_P_ijk_est)
#print(json.dumps(_P_ijk_est))

print('''/*
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

exports._p_ijk = '''+json.dumps(_P_ijk_est)+''';
    
}(typeof exports === 'undefined' ? this.exports_pigdata = {} : exports, typeof exports === 'undefined' ? function(m) { return this['exports_'+m] } : require));
''')
