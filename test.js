var paddle_mod = require("./paddle");
var assert = require("assert");


// every second is more often than you probably care to check
var paddle = new paddle_mod.Paddle(1);

var tests = Array();

console.log("Testing...");

paddle.on('madeit', function(id) {
    tests.push('madeit:' + id);
});

paddle.on('timeout', function(id) {
    tests.push('timeout:' + id);
});

paddle.ensure(function(arg1, arg2, arg3) {
    tests.push(arg1);
    tests.push(arg2);
    tests.push(arg3);
}, 1, Array('test1arg1', 'test1arg2', 'test3arg3'), 'test1id');

var pid = paddle.ensure(function(arg1, arg2, arg3) {
    tests.push(arg1);
    tests.push(arg2);
    tests.push(arg3);
}, 1, ['test2arg1', 'test2arg2', 'test2arg3']);

function test() {
    paddle.madeit(pid);
}

//simulated callback
test();


setTimeout(function() { 
    paddle.stop(); 
    console.log("First test should have failed (check arg)...");
    assert.ok(tests.indexOf('test1arg1') !== -1, "First ensure should have failed");
    console.log("Second test should not have failed (check arg) ...");
    assert.ok(tests.indexOf('test2arg1') == -1, "Second ensure should not have failed");
    console.log("Second test should have made it (check madeit event) ...");
    assert.ok(tests.indexOf('madeit:' + pid) !== -1, "Second test should have made it");
    console.log("First test should have failed (check madeit event) ...");
    assert.ok(tests.indexOf('madeit:test1' + pid) == -1, "First test should have failed");
    console.log("First test should have failed (check timeout event) ...");
    assert.ok(tests.indexOf('timeout:test1id') !== -1, "First test should have failed");
    console.log("Done");

}, 3000);
