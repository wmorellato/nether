/* eslint prefer-promise-reject-errors: 0 */

const util = require('util');
const debug = require('debug')('aws:ec2');
const AWS = require('aws-sdk');

const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

const describeInstances = util.promisify(ec2.describeInstances.bind(ec2));
const startInstances = util.promisify(ec2.startInstances.bind(ec2));
const stopInstances = util.promisify(ec2.stopInstances.bind(ec2));
const rebootInstances = util.promisify(ec2.rebootInstances.bind(ec2));

const INSTANCE_ACTIONS = {
  START: 'start',
  STOP: 'stop',
  RESTART: 'restart',
};

/**
 * Perform an action on the instance given by @instanceId
 * @param {*} instanceId
 * @param {*} action
 */
async function manageInstance(instanceId, action) {
  let response = undefined;
  let pendingInstances = undefined;

  return new Promise(async (resolve, reject) => {
    try {
      if (!instanceId || !action) {
        throw new Error('invalid request');
      }

      switch (action) {
        case INSTANCE_ACTIONS.START:
          response = await startInstances({ InstanceIds: [instanceId] });
          pendingInstances = response.StartingInstances;

          break;
        case INSTANCE_ACTIONS.STOP:
          response = await stopInstances({ InstanceIds: [instanceId] });
          pendingInstances = response.StoppingInstances;

          break;
        case INSTANCE_ACTIONS.RESTART:
          response = await rebootInstances({ InstanceIds: [instanceId] });
          pendingInstances = response.RebootingInstances;

          break;
        default:
          throw new Error('invalid action');
      }

      pendingInstances.forEach((instance) => {
        if (instance.InstanceId === instanceId) {
          resolve({
            ec2InstanceId: instance.InstanceId,
            state: instance.CurrentState.Name,
          });
        }
      });
    } catch (e) {
      debug(e);
      reject({ error: e.message });
    }
  });
}

/**
 * Get basic info for the instance given by @instanceId
 * @param {*} instancesIds
 */
async function getInstancesInfo(instancesIds) {
  const response = [];

  return new Promise(async (resolve, reject) => {
    try {
      const data = await describeInstances({ InstanceIds: instancesIds });

      data.Reservations.forEach((r) => {
        const instance = r.Instances[0];

        // filtering unnecessary info
        const info = {
          ec2InstanceId: instance.InstanceId,
          instanceType: instance.InstanceType,
          platform: instance.Platform,
          hostname: instance.PublicDnsName,
          publicIp: instance.PublicIpAddress,
          state: instance.State.Name,
        };

        instance.Tags.forEach((tag) => {
          if (tag.Key === 'Name') {
            info.instanceName = tag.Value;
          }
        });

        response.push(info);
      });

      resolve(response);
    } catch (e) {
      reject({ error: e.message });
    }
  });
}

module.exports = {
  INSTANCE_ACTIONS,
  manageInstance,
  getInstancesInfo,
};
