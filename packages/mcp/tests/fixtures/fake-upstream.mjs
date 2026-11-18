// Stand-in upstream used by the relay lifecycle tests. Behaviour is selected by argv[2].
const mode = process.argv[2];
const keepAlive = () => setInterval(() => {}, 1000);

switch (mode) {
  case 'echo':
    // Raw byte echo; exits naturally when stdin ends.
    process.stderr.write(`fake-upstream stderr ${process.argv.slice(3).join(' ')}\n`);
    process.stdin.pipe(process.stdout);
    break;
  case 'exit-code':
    process.exit(Number(process.argv[3]));
    break;
  case 'self-signal':
    process.kill(process.pid, 'SIGTERM');
    keepAlive();
    break;
  case 'trap': {
    const codes = { SIGINT: 21, SIGTERM: 22, SIGHUP: 23 };
    for (const [signal, code] of Object.entries(codes)) {
      process.on(signal, () => {
        process.stderr.write(`got ${signal}\n`);
        process.exit(code);
      });
    }
    process.stdin.resume();
    keepAlive();
    process.stdout.write('ready\n');
    break;
  }
  case 'hang':
    // Ignores stdin EOF, but dies on SIGTERM (default action).
    process.stdin.resume();
    keepAlive();
    process.stdout.write('ready\n');
    break;
  case 'stubborn':
    // Ignores stdin EOF and SIGTERM; only SIGKILL stops it.
    process.on('SIGTERM', () => process.stderr.write('ignoring SIGTERM\n'));
    process.stdin.resume();
    keepAlive();
    process.stdout.write('ready\n');
    break;
  default:
    process.stderr.write(`unknown mode ${mode}\n`);
    process.exit(99);
}
