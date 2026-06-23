const app = require('./app');
const { config, connectDatabase, getDatabaseMode } = require('./config');

async function bootstrap() {
  console.log('bootstrap started');
  await connectDatabase();
  console.log('database connected');

  const server = app.listen(config.port, () => {
    console.log(
      `[server] listening on http://localhost:${config.port} (${getDatabaseMode()} mode)`
    );
  });
  server.on('error', (e) => console.error('Server error:', e));
  server.on('close', () => console.log('Server closed'));
}

bootstrap();
