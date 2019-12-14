const net = require('net')
const node_ssh = require('node-ssh')

const SERVER_ACTIONS = {
    START: 'start',
    STOP: 'stop',
    RESTART: 'restart',
    GET_LOGS: 'logs',
    LIST_SCREENS: 'ls_screens'
}

/**
 * Command builder
 */
const getCommand = (action, server) => {
    switch (action) {
        case SERVER_ACTIONS.START:
            return `screen -dmS ${server._id} ./start.sh`
        case SERVER_ACTIONS.STOP:
            return `screen -S ${server._id} -p 0 -X stuff "stop^M"`
        case SERVER_ACTIONS.RESTART:
            return `screen -S ${server._id} -p 0 -X stuff "restart^M"`
        case SERVER_ACTIONS.GET_LOGS:
            return `tail -n0 -F logs/latest.log`
        case SERVER_ACTIONS.LIST_SCREENS:
            return `screen -ls`
    }
}

/**
 * Private function to execute commands on an instance using
 * SSH.
 */
const runCommand = (host, username, privateKey, cwd, command) => {
    const ssh = new node_ssh()

    if (!cwd)
        cwd = `/home/${username}/mc/`

    return ssh.connect({
        host,
        username,
        privateKey
    })
    .then(() => { return ssh.execCommand(command, { cwd }) })
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
 */
const getServerInfo = (address, port) => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket()
        client.setTimeout(3000)
        
        client.connect(port, address, () => {
            const buffer = Buffer.from([ 0xFE, 0x01 ])
            client.write(buffer)
        })
        
        client.on('data', (data) => {
            var serverInfoBin = data.toString().split("\x00\x00\x00");

            if(serverInfoBin) {
                resolve({
                    online: true,
                    version: serverInfoBin[2].replace(/\u0000/g,''),
                    motd: serverInfoBin[3].replace(/\u0000/g,''),
                    onlinePlayers: serverInfoBin[4].replace(/\u0000/g,''),
                    maxPlayers: serverInfoBin[5].replace(/\u0000/g,'')
                })
            }
            else {
                resolve({ online: false })
            }
        })

        client.on('error', (err) => {
            if (err.code === 'ECONNREFUSED')
                resolve({ online: false })
            else
                reject(err)
        })

        client.on('timeout', () => {
            resolve({ online: false })
        })
    })
}

/**
 * The server is started in a separate screen in the remote instance
 * named after its _id in MongoDB. This allows to issue commands to
 * multiple servers (in case someone crazy wants more than one in a
 * single instance).
 */
const startServer = (server) => {
    const clearSshKey = server.getSshKey()

    // first we check if the server is already running
    return runCommand(server.hostname, server.user, clearSshKey, undefined, getCommand(SERVER_ACTIONS.LIST_SCREENS))
        .then((r) => {
            if (!r)
                throw new Error('error executing command ls')

            const stdout = r.stdout

            var screens = [ ...stdout.matchAll(/^\t(\d+)\.(\w+)\t/gm) ]
            for (var i = 0; i < screens.length; i++) {
                if (server._id.toString() === screens[i][2]) {
                    throw new Error(`server with _id ${server._id} already running`)
                }
            }

            return runCommand(server.hostname, server.user, clearSshKey, undefined, getCommand(SERVER_ACTIONS.START, server))
        })
}

const stopServer = async (server) => {
    const clearSshKey = server.getSshKey()
    const command = getCommand(SERVER_ACTIONS.STOP, server)

    return runCommand(server.hostname, server.user, clearSshKey, undefined, command)
}

const restartServer = async (server) => {
    const clearSshKey = server.getSshKey()
    const command = getCommand(SERVER_ACTIONS.RESTART, server)

    return runCommand(server.hostname, server.user, clearSshKey, undefined, command)
}

/**
 * This function will send the SSH command to get the logs
 * and then emit the messages to the socket.io room 'ObjectId' of
 * the server. Anytime a client connects to the /console
 * page, we insert her in this room.
 */
const openLogsSession = async (io, server, callback) => {
    const ssh = new node_ssh()
    const cwd = `/home/${server.user}/mc/`

    ssh.connect({
        host: server.hostname,
        username: server.user,
        privateKey: server.getSshKey()
    })
    .then(() => {
        ssh.exec(getCommand(SERVER_ACTIONS.GET_LOGS), [], {
            cwd,
            onStdout(chunk) {
                io.to(server._id).emit('logs', { message: chunk.toString('utf8') })
                callback(undefined, chunk.toString('utf8'))
            },
            onStderr(chunk) {
                io.to(server._id).emit('logs', { error: chunk.toString('utf8') })
                callback(chunk.toString('utf8'), undefined)
            }
        })
    })
    .catch((e) => {
        console.error(e)
        io.to(server._id).emit('logs', 'could not connect to server')
    })
}

module.exports = {
    SERVER_ACTIONS,
    getServerInfo,
    startServer,
    stopServer,
    restartServer,
    openLogsSession
}