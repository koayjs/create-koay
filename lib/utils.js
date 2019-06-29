'use strict';

const spawn = require('cross-spawn');

function runAsync(command, args, options) {
  const cp = spawn(command, args, options);

  const promise = new Promise((resolve, reject) => {
    const { stdout, stderr } = cp;

    if (stdout) {
      stdout.pipe(process.stdout);
    }
    if (stderr) {
      stderr.pipe(process.stderr);
    }

    cp
      .once('error', reject)
      .once('close', (code) => {
        code === 0 ? resolve(code) : reject(code);
      });
  });

  promise.cp = cp;

  return promise;
}

function runSync(command, args, options) {
  return spawn.sync(command, args, options);
}

exports.runAsync = runAsync;
exports.runSync = runSync;
