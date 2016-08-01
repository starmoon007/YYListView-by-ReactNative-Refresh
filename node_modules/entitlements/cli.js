#!/usr/bin/env node
'use strict';

var pkg = require('./package.json');
var entitlements = require('./');
var argv = process.argv.slice(2);

function help() {
  console.log([
    '',
      '  ' + pkg.description,
    '',
    '  Example',
    '    entitlements ./Payload/Facebook.app/',
    '',
    '    => { "application-identifier": "com.facebook.facebook",',
    '         "get-task-allow":false,',
    '         ... }'
  ].join('\n'));
}

if (argv.indexOf('--help') !== -1) {
  help();
  return;
}

if (argv.indexOf('--version') !== -1) {
  console.log(pkg.version);
  return;
}


entitlements(argv[0], function(error, data){
  if(error){
    throw error;
  }

  console.log(JSON.stringify(data, null, 4));
});
