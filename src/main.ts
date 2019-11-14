import {
  typeormMigrationGenerator,
  typeormMigrationParser,
} from './typorm-migrate';
import ora from 'ora';
import chalk from 'chalk';
import * as fs from 'fs';
import { importModule } from './common';
import * as path from 'path';
import * as mkdirp from 'mkdirp';

const PWD = process.env.PWD;
export async function generalMigrateSql(
  migrateName: string,
  typeormConfigPath: string,
  sqlfiledir: string,
) {
  const spinner = ora({
    text: chalk.bgGreen.black('typeorn migrate is generating...\n'),
    color: 'green',
  }).start();
  const typeormConfig = await importModule(
    path.resolve(PWD, typeormConfigPath),
  );
  const dir = path.resolve(PWD, typeormConfig.cli.migrationsDir);
  const r = await typeormMigrationGenerator(
    migrateName,
    typeormConfigPath,
    typeormConfig.cli.migrationsDir,
  );

  const parseRawUpSql = typeormMigrationParser(
    path.resolve(PWD, dir, `${r.migrateName}.ts`),
    'up',
  );
  const parseRawDownSql = typeormMigrationParser(
    path.resolve(PWD, dir, `${r.migrateName}.ts`),
    'down',
  );

  const sqlfileFullPath = path.resolve(PWD, `${sqlfiledir}/${r.migrateName}`);
  mkdirp.sync(sqlfileFullPath);

  fs.writeFileSync(path.resolve(`${sqlfileFullPath}/up.sql`), parseRawUpSql);
  fs.writeFileSync(
    path.resolve(`${sqlfileFullPath}/down.sql`),
    parseRawDownSql,
  );

  spinner.succeed(
    chalk.bgGreen.black(
      `typeorm migrate generation succeed : ${sqlfileFullPath}`,
    ),
  );
  // fs.appendFileSync(sqlfiles.up, ['', parseRawUpSql].join('\n'));
  // fs.appendFileSync(sqlfiles.down, ['', parseRawDownSql].join('\n'));
}
