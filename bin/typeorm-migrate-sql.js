#!/usr/bin/env node

const { generalMigrateSql } = require('../dist/main');
const args = require('args');

args
  .option('name', 'the name of the migrate')
  .option('config', 'the typeorm config')
  .option('dir', 'the dir of the sql to store');

const { name, config, dir } = args.parse(process.argv);

if (!name) {
  throw new Error('name arg is required');
} else if (!config) {
  throw new Error('config arg is required');
} else if (!dir) {
  throw new Error('dir arg is required');
}

generalMigrateSql(name, config, dir);
