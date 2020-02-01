const url = require('url')
const debug = require('debug')('minecraft:manager')
const node_ssh = require('node-ssh')
const { runCommand, getServerInfo } = require('./remote')
const { getLatestVersion, SERVER_FLAVORS } = require('./utils/server_flavors')

const SERVER_ACTIONS = {
    START: 'start',
    STOP: 'stop',
    RESTART: 'restart',
    GET_LOGS: 'logs',
    LIST_SCREENS: 'ls_screens',
    DOWNLOAD_JAR: 'download_jar',
    REPLACE_JAR: 'replace_jar'
}

/**
 * Command builder
 */
const getCommand = (action, server, args) => {
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
        case SERVER_ACTIONS.DOWNLOAD_JAR:
            return `wget ${args.url} -O bin/${args.jarName} && chmod +x bin/${args.jarName}`
        case SERVER_ACTIONS.REPLACE_JAR:
            return `sed -i -E "s/^JAR_NAME=.*$/JAR_NAME=${args.jarName}/" start.sh`
    }
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
    const cwd = `/home/${server.user}/minecraft/`

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

const updateJar = async (server, jarUrl) => {
    const clearSshKey = server.getSshKey()
    const serverInfo = await getServerInfo(server.hostname, server.serverPort)
    var jarName, downloadCommand = '', replaceCommand = ''

    // we actually can, but the user will need to restart
    // the server anyway, so...
    if (serverInfo.online)
        throw new Error('can\'t update jar while server is online')
    
    if (jarUrl) {
        var path = url.parse(jarUrl).pathname

        if (path) {
            var parts = path.split('/')
            jarName = parts[parts.length - 1] + '.jar'
        } else {
            jarName = 'server.jar'
        }

        replaceCommand = getCommand(SERVER_ACTIONS.REPLACE_JAR, server, { jarName })
        downloadCommand = getCommand(SERVER_ACTIONS.DOWNLOAD_JAR, server, { url: jarUrl, jarName })
    } else {
        // fix this, create another field for Server type
        var versionInfo = await getLatestVersion(SERVER_FLAVORS.PAPER)

        jarName = `${versionInfo.flavor}-${versionInfo.version}-${versionInfo.build}.jar`

        replaceCommand = getCommand(SERVER_ACTIONS.REPLACE_JAR, server, { jarName })
        downloadCommand = getCommand(SERVER_ACTIONS.DOWNLOAD_JAR, server, { url: versionInfo.url, jarName })
    }

    debug(`replacing old jar from ${server._id} with new jar file ${jarName}`)
    
    debug(`running command ${downloadCommand}`)
    return runCommand(server.hostname, server.user, clearSshKey, undefined, downloadCommand)
        .then(() => {
            // the jar name replacement should only take place
            // if the download was successful, otherwise it would
            // break the startup script
            debug(`running command ${replaceCommand}`)
            runCommand(server.hostname, server.user, clearSshKey, undefined, replaceCommand)
        })
}

module.exports = {
    SERVER_ACTIONS,
    startServer,
    stopServer,
    restartServer,
    openLogsSession,
    updateJar
}