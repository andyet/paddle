var paddle_mod = require("./paddle");
var assert = require("assert");


// every second is more often than you probably care to check
var paddle = new paddle_mod.Paddle(1);

var tests = Array();

console.log("Testing...");

paddle.on('check_in', function(ins) {
    tests.push('check_in:' + ins.id);
});

paddle.on('timeout', function(ins) {
    tests.push('timeout:' + ins.id);
});

paddle.insure(function(arg1, arg2, arg3) {
    tests.push(arg1);
    tests.push(arg2);
    tests.push(arg3);
}, 1, Array('test1arg1', 'test1arg2', 'test3arg3'), 'test1id');

var ins = paddle.insure(function(arg1, arg2, arg3) {
    tests.push(arg1);
    tests.push(arg2);
    tests.push(arg3);
}, 1, ['test2arg1', 'test2arg2', 'test2arg3']);

function test() {
    ins.check_in();
}

//simulated callback
test();


setTimeout(function() { 
    paddle.stop(); 
    process.stdout.write("First test should have failed (check arg) ... ");
    process.stdout.flush();
    assert.ok(tests.indexOf('test1arg1') !== -1, "First insure should have failed");
    console.log("OK");
    process.stdout.write("Second test should not have failed (check arg) ... ");
    process.stdout.flush();
    assert.ok(tests.indexOf('test2arg1') == -1, "Second insure should not have failed");
    console.log("OK");
    process.stdout.write("Second test should have made it (check check_in event) ... ");
    process.stdout.flush();
    assert.ok(tests.indexOf('check_in:' + ins.id) !== -1, "Second test should have made it");
    console.log("OK");
    process.stdout.write("First test should have failed (check check_in event) ... ");
    process.stdout.flush();
    assert.ok(tests.indexOf('check_in:test1' + ins.id) == -1, "First test should have failed");
    console.log("OK");
    process.stdout.write("First test should have failed (check timeout event) ... ");
    process.stdout.flush();
    assert.ok(tests.indexOf('timeout:test1id') !== -1, "First test should have failed");
    console.log("OK");
    console.log("Done");

}, 3000);
