import { ConfigModule } from '@nestjs/config';
import { spawn } from 'child_process';

// Load environment variables from .env
ConfigModule.forRoot();

const child = spawn('./node_modules/.bin/migrate', [
  '--dbConnectionUri',
  process.env.MONGO_URL,
  '--md',
  'src/database/migrations',
  ...process.argv.slice(2),
]);

child.stdout.on('data', (data) => console.log(String(data)));

child.stderr.on('data', (data) => console.log(String(data)));

child.on('exit', process.exit);

// Send data to child process (e.g. keypress)
process.stdin.on('data', (data) => child.stdin.write(String(data)));
