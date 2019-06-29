'use strict';

const { join } = require('path');
const { existsSync, statSync, readdirSync, mkdirSync, unlinkSync } = require('fs');
const { emptyDir, removeSync } = require('fs-extra');
const { prompt } = require('inquirer');
const Console = require('clrsole');
const { runAsync } = require('./utils');

const logger = new Console('koay-cli');
const { output } = Console;
const templates = [
  { name: 'none', pkg: 'koay-template' },
  { name: 'jQuery', pkg: 'koay-jquery-template' },
  { name: 'Vue', pkg: 'koay-vue-template' },
  { name: 'React', pkg: 'koay-react-template' }
];

module.exports = function (project) {
  prompt([{
    name: 'tpl',
    type: 'list',
    message: 'Select a template to develop web sites?',
    choices: templates.map(n => `${n.name} (${n.pkg})`)
  }]).then(({ tpl }) => {
    const { pkg } = templates.find(n => tpl.indexOf(n.name) === 0);
    const projectDir = join(process.cwd(), project);

    // 目录是否存在
    if (existsSync(projectDir)) {
      const stat = statSync(projectDir);
      // 判断这是个目录
      if (stat.isDirectory(projectDir)) {
        // 判断是否是空目录
        if (readdirSync(projectDir).length !== 0) {
          return prompt([{
            name: 'isEmpty',
            type: 'list',
            message: `Directory "${project}" exists. Do you want to empty the directory?`,
            choices: ['Yes', 'No']
          }]).then(({ isEmpty }) => {
            // 选择清空
            if (isEmpty === 'Yes') {
              return emptyDir(projectDir).then(() => {
                logger.info(`Directory "${projectDir}" has been empty.`);
                return {
                  pkg,
                  dir: projectDir
                };
              });
            } else {
              return Promise.reject(new Error(`Directory "${projectDir}" is not empty.`));
            }
          });
        }
      }
    } else {
      // 创建目录
      mkdirSync(projectDir);
    }

    return {
      pkg,
      dir: projectDir
    };
  }).then(({ pkg, dir }) => {
    // 在线下载模版
    const nodeModulesDir = join(dir, 'node_modules');

    // 进程结束前删除生成的文件
    process.once('beforeExit', () => {
      try {
        removeSync(nodeModulesDir);
      } catch (e) { }
      try {
        unlinkSync(join(dir, 'package-lock.json'));
      } catch (e) { }
    });

    return runAsync('npm', ['install', '--prefix', dir, pkg], { stdio: 'inherit' })
      .then(() => {
        // 创建新工程
        return require(join(nodeModulesDir, pkg))(project, dir);
      });
  }).then(() => {

    const content = `
Project "${project}" has been created.

  Usage:

    $ cd ${project} && npm install
`;
    output.green(content);
  }).catch((e) => {
    logger.error(`create failed: ${e}`);
  });
};
