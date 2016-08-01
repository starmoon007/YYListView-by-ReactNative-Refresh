/**
 * Created by tdzl2_000 on 2015-08-10.
 */
"use strict";
var cliArgv = require("../lib/index.js");

console.log(cliArgv.parse({}, 'hello world'));
console.log(cliArgv.parse({}, 'hello "world"'));
console.log(cliArgv.parse({}, 'hello "hello world"'));
console.log(cliArgv.parse({}, 'hello "hello "" world"'));
console.log(cliArgv.parse({}, 'hello "hello "" world'));
console.log(cliArgv.parse({}, 'hello "hello " world'));
console.log(cliArgv.parse({}, 'hello"hello "world'));
console.log(cliArgv.parse({}, 'hello world""'));
