const { setupBot } = require('./lib/discord/bot');
const app = require('./app');
const port = process.env.PORT || 8000;

const server = require('http').createServer(app);
app.get('io').attach(server);

/**
 * Initializing the Discord bot.
 */
setupBot(() => {
  console.log('bot ready');
});

exports.server = server.listen(port, () => {
  console.log('app listening on port', port);
});
