const debug = require('debug')('minecraft:monitor');
// const config = require('../../../config/server.config');
const { openLogsSession } = require('./manager');
const { getServerInfo } = require('./remote');

const UPDATE_INTERVAL = 1 * 1000;
const EVENTS = {
  STATUS: 'status',
  ONLINE: 'online',
  OFFLINE: 'offline',
  PLAYER_LOGGED_IN: 'player_login',
  PLAYER_LOGGED_OUT: 'player_logout',
  PLAYER_DIED: 'player_died',
};
const DEATH_MESSAGES = [
  'went up in flames',
  'burned to death',
  'tried to swim in lava',
  'suffocated in a wall',
  'drowned',
  'starved to death',
  'was pricked to death',
  'hit the ground too hard',
  'fell out of the world',
  'died',
  'blew up',
  'was killed by magic',
  'was slain by',
  'was shot by',
  'was fireballed by',
  'was pummeled by',
  'was killed by',
];

/**
 * This will hold callbacks to be called once the server
 * is updated.
 */
const eventCallbacks = {};

/**
 * Function used to register callbacks for notification
 * events.
 * @param {EVENTS} event
 * @param {*} callback
 */
function registerEventCallback(event, callback) {
  if (!eventCallbacks[event]) {
    eventCallbacks[event] = new Set();
  }

  eventCallbacks[event].add(callback);
}

/**
 * Unregister callback for notifications.
 * @param {*} event
 * @param {*} callback
 */
function unregisterEventCallback(event, callback) {
  if (!eventCallbacks[event] || eventCallbacks[event].length === 0) {
    return;
  }

  eventCallbacks[event].delete(callback), callback;
}

/**
 * This class monitors a running Minecraft server and notify
 * updates on the server through callbacks registered by
 * other modules.
 *
 * Also monitors the server logs. This can be used to a wide
 * range of notifications (player logon/logout, player death,
 * events and so on)
 */
class ServerMonitor {
  /**
   * Create a new ServerMonitor instance.
   * @param {*} server
   * @param {*} io
   * @param {*} online
   */
  constructor(server, io, online) {
    this.io = io;
    this.info = { online: undefined };
    this.server = server;
    // too expensive, wait until the server is up
    this.queryDeathMessages = false;
  }

  /**
   * Start the monitoring process. Called upon
   * startServer command.
   */
  startMonitoring() {
    openLogsSession(this.io, this.server, this.logHandler.bind(this));
    this.intervalId = setInterval(() => {
      this.updateServerStatus();
    }, UPDATE_INTERVAL);
  }

  /**
   * Called periodically to check server status. Calls
   * the registered callbacks for incoming events.
   */
  async updateServerStatus() {
    const updtInfo = await getServerInfo(this.server.hostname,
        this.server.serverPort);

    if (JSON.stringify(this.info) !== JSON.stringify(updtInfo)) {
      if (this.info.online === false && updtInfo.online === true) {
        debug(this.server._id, 'online');

        if (eventCallbacks[EVENTS.ONLINE]) {
          eventCallbacks[EVENTS.ONLINE]
              .forEach((callback) => callback(this.server, updtInfo));
        }

        this.queryDeathMessages = true;
      }

      if (this.info.online === true && updtInfo.online === false) {
        debug(this.server._id, 'offline');

        if (eventCallbacks[EVENTS.OFFLINE]) {
          eventCallbacks[EVENTS.OFFLINE]
              .forEach((callback) => callback(this.server, updtInfo));
        }

        clearInterval(this.intervalId);
      }

      if (eventCallbacks[EVENTS.STATUS]) {
        eventCallbacks[EVENTS.STATUS]
            .forEach((callback) => callback(this.server, updtInfo));
      }

      this.info = updtInfo;
      this.io.to(this.server._id).emit('status', updtInfo);
    }
  }

  /**
   * Log parser. Sends events related to server
   * messages (player deaths, player login etc)
   * @param {*} err
   * @param {*} log
   */
  async logHandler(err, log) {
    if (err) {
      return;
    }

    if (this.queryDeathMessages) {
      for (let i = 0; i < DEATH_MESSAGES.length; i++) {
        if (log.includes(DEATH_MESSAGES[i])) {
          eventCallbacks[EVENTS.PLAYER_DIED]
              .forEach((callback) => callback(log));
          break;
        }
      }
    }
  }
}

module.exports = {
  EVENTS,
  registerEventCallback,
  unregisterEventCallback,
  ServerMonitor,
};
