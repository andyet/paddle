# Paddle #

You're up a creek; here's your Paddle. In Javascript, we rely on callback
execution, often times without knowing for sure that it will happen. With
Paddle, you can know. Paddle is a simple way of noting that your code should
reach one of several code-execution points within a timelimit. If the time-
limit is exceeded, an error callback is executed.

Paddle is, simply, a way of creating an error_callback just in case your asynchronous code
does not end up where you think it should in a time limit.

Paddle was inspired by @mde's "You are fucked" section at his 2011 NodeConf talk.

## Examples ##

Node.js famously had an http client
but where occasionally no callback would occur for an HTTP request if the response was too fast.
If I wanted to ensure that my http client callback occurred, I would call `ensure` in Paddle and
`check_in` within the callback. As simple as that!

    var http = require('http'),
        paddle_mod = require('paddle');
    var options = {
        host: 'andyet.net',
        port: 80,
        path: '/team/nathan',
    }

    var paddle = new paddle_mod.Paddle(5);


    setTimeout(function() {
        paddle.stop();
    }, 12000);

    var req = http.get(options, function(res) {
        var http_insurance = paddle.insure(function(res) {
            console.log("The request never had body events!");
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
        }, 9, [res]);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            http_insurance.check_in();
        });
    });
    req.end();
