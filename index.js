#!/usr/bin/env node

'use strict';

const { Command } = require('commander');
const Console = require('clrsole');
const VERSION = require('./package.json').version;

const logger = new Console('koay-cli');
const { output } = Console;
const program = new Command();

program
  .name('koay')
  .version(VERSION, '-v, --version')
  .usage('<command> [options]')
  .on('--help', () => {
    const content = `
  Examples:

    $ koay create hello
    $ koay -h
`;
    output.green(content);
  });

const createCommand = program.command('create');
createCommand.missingArgument = function (name) {
  logger.error(`missing required argument <${name}>
  `);
  program.help();
  process.exit(1);
};
createCommand
  .arguments('<project-directory>')
  .description('create a Koa application generator')
  .action(require('./lib/create'));

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
