# typeorm-migrate-to-sql

通过 typeorm 直接生成 sql 语句

## Usage

有以下两种用法:

### cli

直接通过命令行进行调用

`npx typeorm-sql -n migrateName -c typeormConfigPath -d sql general dir`

### api
直接通过API 进行调用

`(alias) function generalMigrateSql(migrateName: string, typeormConfigPath: string, sqlfiledir: string): Promise<void>
`

eg:
``````
import { generalMigrateSql } from 'typeorm-migrate-to-sql';
generalMigrateSql(
  'testMigrate',
  './src/config/typeorm.config.ts',
  './migration-sql/',
);
``````

## notice

1. typeormConfig 里面需要注意几个事情,在当前版本(0.2.20)中, `export`暴露出来的名称必须为 `ORMConfig` , 即 `export = ORMConfig`

2. 如果 typeormConfig 为 ts 语法格式,在调用的时候需要进行转换，可以如下编写 `npm script`:

   `"migrate": "cross-env SERVER_NODE_ENV=development ts-node -r tsconfig-paths/register ./node_modules/typeorm-migrate-to-sql/bin/typeorm-migrate-sql.js -c ./src/config/typeorm.config.ts -d ./migration-sql/"`

   `"migrate:general": "npm run migrate -- -n"`

   调用的时候只需要 `npm run migrate:general migrateName`

3. **特别提醒** 生成的语句中只包含typeorm生成的`up`、`down` 语句，没有和migrate状态有关的信息sql，比如migrate表格信息插入等等
