const debug = require('debug')('discord:bot');
const config = require('../../../config/discord.config');
const {
  EVENTS,
  registerEventCallback,
} = require('../minecraft/server_monitor');
const {
  Client,
  RichEmbed,
} = require('discord.js');
const client = new Client();

/**
 * Simple text message to given channel.
 * @param {*} message
 */
function sendSimpleMessage(message) {
  client.channels.find((ch) => ch.id === CHANNEL_ID).send(message);
}

/**
 * @param {*} server
 * @param {*} serverInfo
 */
function sendOnlineNotification(server, serverInfo) {
  params = config.messages.serverOnline;

  const embed = new RichEmbed()
      .setTitle(params.title)
      .setColor(params.color)
      .setThumbnail(params.thumbnail)
      .setDescription(params.description)
      .addField('Address', `**${server.hostname}:${server.serverPort}**`);

  client.channels.find((ch) => ch.id === config.channels.bot.id).send(embed);
}

/**
 * @param {*} server
 * @param {*} serverInfo
 */
function updateServerStatus(server, serverInfo) {
  if (serverInfo.online) {
    client.user.setPresence({
      game: {
        // this should be in the config file
        name: `: ${serverInfo.onlinePlayers} player(s) online`,
        type: 'PLAYING',
      },
      status: 'online',
    });
  } else {
    client.user.setPresence({
      game: {},
      status: 'invisible',
    });
  }
}

/**
 * @param {*} callback
 */
function setupBot(callback) {
  client.on('ready', () => {
    debug('bot ready');
    callback();
  });

  client.login(process.env.BOT_KEY);

  registerEventCallback(EVENTS.STATUS, updateServerStatus);
  registerEventCallback(EVENTS.ONLINE, sendOnlineNotification);
  registerEventCallback(EVENTS.PLAYER_DIED, sendSimpleMessage);
}

module.exports = {
  setupBot,
  updateServerStatus,
  sendOnlineNotification,
};
