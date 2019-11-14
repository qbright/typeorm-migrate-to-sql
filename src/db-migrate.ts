import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
const PWD = process.env.PWD;
const tempfile = require('tempfile');

function generalDbConfig(typeOrmConfig) {
  return {
    dev: {
      driver: 'mysql',
      host: typeOrmConfig.host,
      port: typeOrmConfig.port,
      user: typeOrmConfig.username,
      password: typeOrmConfig.password,
      database: typeOrmConfig.database,
      multipleStatements: true,
    },
  };
}

export interface SQLFILES {
  up: string;
  down: string;
}

export async function dbmigrateGenerator(
  migrateName,
  typeOrmConfig,
  migrationDir,
): Promise<SQLFILES> {
  const dbMigrateConfig = generalDbConfig(typeOrmConfig);

  const dbMigrateConfigTempFile = tempfile('.json');

  fs.writeFileSync(
    dbMigrateConfigTempFile,
    JSON.stringify(dbMigrateConfig, null, 2),
  );

  return new Promise((resolve) => {
    exec(
      `node node_modules/db-migrate/bin/db-migrate  create ${migrateName} --sql-file --migrations-dir ${migrationDir}`,
      {
        cwd: PWD,
      },
      async (err, stdout, stderr) => {
        const jsfile = stdout.match(/(\/.*.js)/gim)[0];
        let jsfileContent = fs.readFileSync(jsfile, 'UTF-8');
        jsfileContent = jsfileContent.replace(
          /console\.log\(\'received\ data\: '\ \+ data\)\;/gim,
          '',
        );

        fs.writeFileSync(jsfile, jsfileContent);

        const upsqlfile = stdout.match(/(\/.*\-up\.sql)/gim);
        const downsqlfile = stdout.match(/(\/.*\-down\.sql)/gim);
        resolve({
          up: upsqlfile[0],
          down: downsqlfile[0],
        });
      },
    );
  });
}

export function cleanGeneralRun() {}

export async function dbmigrateRun(
  migrateName,
  method,
  typeOrmConfig,
  migrationDir,
) {
  console.log(111111111111111111111111111111111111, method);
  const dbMigrateConfig = generalDbConfig(typeOrmConfig);
  await new Promise((resolve) => {
    exec(
      `node node_modules/db-migrate/bin/db-migrate  ${method}  --sql-file --dry-run --migrations-dir ${migrationDir}`,
      {
        cwd: PWD,
      },
      async (err, stdout, stderr) => {
        stdout = stdout
          .replace(/\[INFO\].*$/gim, '')
          .replace(/\/*.* \*\/$/gim, '');

        let insertMigrateMatch = stdout.match(/INSERT INTO `migrations`.*$/gim);
        let upMigrateMatch = stdout.match(/DELETE FROM `migrations`.*$/gim);
        if (!insertMigrateMatch) {
          // down
        } else {
          // up
          const insertMigrate = insertMigrateMatch[0];
          const insertSql = insertMigrate.match(
            /INSERT INTO `migrations` .*\)/,
          )[0];
          const params = insertMigrate
            .match(/\[(.*?)\]/gim)[0]
            .match(/\'(.*?)\'/gim);

          let c = 0;
          const targetSql = insertSql.replace(/\?/gim, () => {
            return params[c++];
          });

          const ss = stdout.replace(/INSERT INTO `migrations`.*$/gim, '');
          console.log(ss);
          resolve({
            fileName: params[0],
            method,
            content: ss,
          });
        }
      },
    );
  });
}
