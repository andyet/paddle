/**
* Written by Nathan Fritz. Copyright © 2011 by &yet, LLC. Released under the
* terms of the MIT License:
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/ 

var EventEmitter = require("events").EventEmitter;

function Paddle(freq) {
    EventEmitter.call(this);
    this.registry = new Object();
    this.ensureids = 0;
    if(freq === undefined) {
        this.freq = 5;
    } else {
        this.freq = freq;
    }
    this.run = true;
    this.start();
}

//extend Paddle with EventEmitter
Paddle.super_ = EventEmitter;
Paddle.prototype = Object.create(EventEmitter.prototype, {
    constructor: {
        value: Paddle,
        enumerable: false
    }
});

function ensure(error_callback, timeout, args, id) {
    if(id === undefined) {
        ++this.ensureids;
        this.ensureids %= 65000;
        id = this.ensureids;
    }
    expiretime = Date.now() + timeout;
    this.registry[id] = [expiretime, error_callback, args];
    return id;
}

function madeit(id) {
    if(id in this.registry) {
        this.emit('madeit', id);
        delete this.registry[id];
        return true;
    }
    return false;
}

function checkEnsures() {
    var now = Date.now();
    for(var id in this.registry) {
        if(now > this.registry[id][0]) {
            this.registry[id][1].apply(this, this.registry[id][2]);
            this.emit('timeout', id);
            delete this.registry[id];
        }
    }
    if(this.run) {
        setTimeout(function() { this.checkEnsures() }.bind(this), this.freq * 1000);
    }
}

function stop() {
    this.run = false;
}

function start() {
    this.run = true;
    setTimeout(function() { this.checkEnsures() }.bind(this), this.freq * 1000);
}

Paddle.prototype.ensure = ensure;
Paddle.prototype.madeit = madeit;
Paddle.prototype.checkEnsures = checkEnsures;
Paddle.prototype.start = start;
Paddle.prototype.stop = stop;

exports.Paddle = Paddle;
