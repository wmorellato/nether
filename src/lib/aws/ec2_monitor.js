const debug = require('debug')('aws:ec2_monitor');
const { getInstancesInfo } = require('./ec2');
const Server = require('../../models/server');

const UPDATE_INTERVAL = 10 * 1000;

const EVENTS = {
  STATUS: 'status',
  ONLINE: 'running',
  OFFLINE: 'stopped',
};

const STATES = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  PENDING: 'pending',
};

/**
 * This will hold callbacks to be called once the instance
 * is updated.
 */
const eventCallbacks = {};

/**
 * @param {*} event
 * @param {*} callback
 */
function registerEventCallback(event, callback) {
  if (!eventCallbacks[event]) {
    eventCallbacks[event] = new Set();
  }

  eventCallbacks[event].add(callback);
}

/**
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
 * This class monitors a running EC2 instance and notify
 * updates on the instance through callbacks registered by
 * other modules.
 */
class InstanceMonitor {
  /**
   * @param {*} io: SocketIO
   * @param {*} ec2InstanceId
   */
  constructor(io, ec2InstanceId) {
    this.io = io;
    this.info = { ec2InstanceId, state: 'pending' };
    this.ec2InstanceId = ec2InstanceId;
  }

  /**
   * Start monitoring for events
   */
  startMonitoring() {
    this.intervalId = setInterval(() => {
      this.updateServerStatus();
    }, UPDATE_INTERVAL);
  }

  /**
   * Send notifications to all registered event handlers.
   */
  async updateServerStatus() {
    const instances = await getInstancesInfo([this.ec2InstanceId]);

    if (instances.length === 0) {
      return;
    }

    const updtInfo = instances[0];

    if (JSON.stringify(this.info) !== JSON.stringify(updtInfo)) {
      if (this.info.state !== updtInfo.state &&
        updtInfo.state === STATES.RUNNING) {
        debug(this.ec2InstanceId, 'running');
        this.updateInstanceHostname(updtInfo.ec2InstanceId, updtInfo.hostname);

        if (eventCallbacks[EVENTS.ONLINE]) {
          eventCallbacks[EVENTS.ONLINE]
              .forEach((callback) => callback(updtInfo));
        }
      }

      if (this.info.state !== updtInfo.state &&
        updtInfo.state === STATES.STOPPED) {
        debug(this.ec2InstanceId, 'stopped');
        this.updateInstanceHostname(updtInfo.ec2InstanceId, updtInfo.hostname);

        if (eventCallbacks[EVENTS.OFFLINE]) {
          eventCallbacks[EVENTS.OFFLINE]
              .forEach((callback) => callback(updtInfo));
        }

        clearInterval(this.intervalId);
      }

      if (eventCallbacks[EVENTS.STATUS]) {
        eventCallbacks[EVENTS.STATUS].forEach((callback) => callback(updtInfo));
      }

      this.info = updtInfo;
      this.io.to(this.ec2InstanceId).emit('status', updtInfo);
    }
  }

  /**
   * @param {*} ec2InstanceId
   * @param {*} hostname
   */
  async updateInstanceHostname(ec2InstanceId, hostname) {
    await Server.updateOne({ ec2InstanceId }, { hostname });
  }
}

module.exports = {
  EVENTS,
  registerEventCallback,
  unregisterEventCallback,
  InstanceMonitor,
};
