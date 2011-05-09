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

/**
 * You're up a creek; here's your Paddle. In Javascript, we rely on callback
 * execution, often times without knowing for sure that it will happen. With
 * Paddle, you can know. Paddle is a simple way of noting that your code should
 * reach one of several code-execution points within a timelimit. If the time-
 * limit is exceeded, an error callback is executed.
 *
 * @param freq: number of seconds between timeout checks
 */
function Paddle(freq) {
    EventEmitter.call(this);
    this.registry = new Object();
    this.insureids = 0;
    if(freq === undefined) {
        this.freq = 5;
    } else {
        this.freq = freq;
    }
    this.run = false;
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

/*
 * Register a new check. If the check times out, error_callback will be called
 * with the optionally specified args. You may specify an id, but one will be
 * created otherwise.
 *
 * @param error_callback: function called when timeout is reached without check-in
 * @param timeout: seconds to wait for check-in
 * @param args: Array of arguments to call error_callback with
 * @param id: optional -- insure will generate one for you
 *
 * @return Object: returns the insurance obj you just created
 * {paddle, error_callback, args, id, timeout, done, check_in}
 *
 */
function insure(error_callback, timeout, args, id) {
    if(id === undefined) {
        ++this.insureids;
        this.insureids %= 65000;
        id = this.insureids;
    }
    expiretime = Date.now() + timeout * 1000;
    var that = this;
    var insurance = {
        paddle: that,
        error_callback: error_callback,
        args: args,
        id: id,
        timeout: expiretime,
        done: false,
        check_in: function() {
            return this.paddle.check_in(this.id);
        }
    }
    //this.registry[id] = [expiretime, error_callback, args];
    this.registry[id] = insurance;
    return insurance;
}

/*
 * Check in with an id or paddle to confirm that your end-execution point occurred. This
 * will cancel the timeout error, and delete the entry for this id.
 *
 * @param id or insurance: id from insure or insure obj
 */
function check_in(id) {
    if(id.id !== undefined) {
        //perhaps this is an insure object
        id = id.id;
    }
    if(id in this.registry) {
        this.emit('check_in', this.registry[id]);
        this.registry[id].done = true;
        delete this.registry[id];
        return true;
    }
    return false;
}

/*
 * Executed internally to occasionally make sure all insurance ids are within
 * their timeouts.
 */
function checkEnsures() {
    var now = Date.now();
    for(var id in this.registry) {
        if(now > this.registry[id].timeout) {
            this.registry[id].error_callback.apply(this, this.registry[id].args);
            this.emit('timeout', this.registry[id]);
            delete this.registry[id];
        }
    }
    if(this.run) {
        setTimeout(function() { this.checkEnsures() }.bind(this), this.freq * 1000);
    }
}

/*
 * Start checking paddle timeouts. Optionally reset frequency.
 *
 * @return bool: true if running, false if it was already running.
 */
function start(freq) {
    if(freq !== undefined) {
        this.freq = freq;
    }
    if(!this.run) {
        this.run = true;
        setTimeout(function() { this.checkEnsures() }.bind(this), this.freq * 1000);
        return true;
    } else {
        return false;
    }
}

/*
 * Stop checking Paddle timeouts.
 * @return bool: true if stopped, false if it was already stopped.
 */
function stop() {
    if(this.run) {
        this.run = false;
        return true;
    } else {
        return true;
    }
}

Paddle.prototype.insure = insure;
Paddle.prototype.check_in = check_in;
Paddle.prototype.checkEnsures = checkEnsures;
Paddle.prototype.start = start;
Paddle.prototype.stop = stop;

exports.Paddle = Paddle;
