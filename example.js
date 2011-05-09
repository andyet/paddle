var http = require('http'),
    paddle_mod = require('./paddle');
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
