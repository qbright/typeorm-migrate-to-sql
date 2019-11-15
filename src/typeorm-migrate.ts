import { exec } from 'child_process';

import { Project, StringLiteral } from 'ts-morph';

export interface MigrationEnv {
  [key: string]: any;
}
const PWD = process.env.PWD;
//TODO  env

export interface TypeOrmMigrationResult {
  migrateName: string; //生成的typeorm sql
}

const sqlHeader = ['SET AUTOCOMMIT=0;', 'START TRANSACTION;'];
const sqlFooter = ['COMMIT;'];
export function typeormMigrationGenerator(
  migrateName: string,
  configPath: string,
  migrationDir: string,
): Promise<TypeOrmMigrationResult> {
  return new Promise((resolve) => {
    exec(
      `npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate -n ${migrateName} --config ${configPath} -d ${migrationDir}`,
      {
        cwd: PWD,
      },
      async (err, stdout, stderr) => {
        if (err) {
          console.error(err);
        } else {
          // console.log(`${path.resolve(PWD, configPath)}`);
          // const ORMConfig = await import(`${path.resolve(PWD, configPath)}`);
          // console.log(ORMConfig);
        
          resolve({
            migrateName: stdout
              .match(/[\d]{13}-(\w.*)\.ts/gim)[0]
              .replace(/\.ts/, ''),
          });
        }
      },
    );
  });
}

export function typeormMigrationParser(filePath: string, methodName: string) {
  const project = new Project();
  project.addSourceFilesAtPaths(filePath);

  const sourceFile = project.getSourceFileOrThrow(filePath);

  const temp = [];
  sourceFile
    .getClasses()[0]
    .getMethod(methodName)
    .getBody()
    .forEachDescendantAsArray()
    .forEach((item) => {
      if (item instanceof StringLiteral) {
        temp.push(item.getFullText().replace(/\"/gim, '') + ';');
      }
    });

  const fullContent = [].concat(sqlHeader, temp, sqlFooter);
  return fullContent.join('\n');
}
