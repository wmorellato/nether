/* eslint-disable new-cap */
/* eslint-disable camelcase */
const net = require('net');
const node_ssh = require('node-ssh');

/**
 * Function to execute commands on an instance using
 * SSH.
 * @param {*} host
 * @param {*} username
 * @param {*} privateKey
 * @param {*} cwd
 * @param {*} command
 * @return {Promise}
 */
function runCommand(host, username, privateKey, cwd, command) {
  const ssh = new node_ssh();

  if (!cwd) {
    cwd = `/home/${username}/minecraft/`;
  }

  return ssh.connect({
    host,
    username,
    privateKey,
  }).then(() => {
    return ssh.execCommand(command, { cwd });
  });
}

/**
 * This function gets basic info from a Minecraft server while
 * at the same time checking its state. Uses the Minecraft
 * protocol [1]
 *
 * Refs:
 *      [1] https://wiki.vg/Protocol
 *
 * @param {*} address
 * @param {*} port
 * @return {Promise}
 */
function getServerInfo(address, port) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(3000);

    client.connect(port, address, () => {
      const buffer = Buffer.from([0xFE, 0x01]);
      client.write(buffer);
    });

    client.on('data', (data) => {
      const serverInfoBin = data.toString().split('\x00\x00\x00');

      if (serverInfoBin) {
        resolve({
          online: true,
          version: serverInfoBin[2].replace(/\u0000/g, ''),
          motd: serverInfoBin[3].replace(/\u0000/g, ''),
          onlinePlayers: serverInfoBin[4].replace(/\u0000/g, ''),
          maxPlayers: serverInfoBin[5].replace(/\u0000/g, ''),
        });
      } else {
        resolve({ online: false });
      }
    });

    client.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        resolve({ online: false });
      } else {
        reject(err);
      }
    });

    client.on('timeout', () => {
      resolve({ online: false });
    });
  });
}

module.exports = {
  runCommand,
  getServerInfo,
};
