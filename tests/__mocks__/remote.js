var online = true

const setServerStatus = (val) => {
    online = val
}

const SERVER_ACTIONS = {
    START: 'start',
    STOP: 'stop',
    RESTART: 'restart',
    GET_LOGS: 'logs',
    LIST_SCREENS: 'ls_screens'
}

const getServerInfo = (address, port) => {
    return new Promise((resolve, reject) => {
        if (online)
            resolve({
                online,
                version: '1.14.4',
                motd: 'A motd',
                onlinePlayers: 1234,
                maxPlayers: 9999
            })
        else
            resolve({ online })
    })
}

const startServer = (server) => {
    online = true

    return new Promise((resolve, reject) => {
        resolve(0)
    })
}

const stopServer = (server) => {
    online = false

    return new Promise((resolve, reject) => {
        resolve(0)
    })
}

const restartServer = (server) => {
    return new Promise((resolve, reject) => {
        resolve(0)
    })
}

const openLogsSession = async (io, server, callback) => {
    const messages = ['Foo tried to swim in lava', 'Foo was killed by']

    setInterval(() => {
        callback(messages[Math.floor(Math.random()*messages.length)])
    }, 3000)
}

module.exports = {
    SERVER_ACTIONS,
    getServerInfo,
    startServer,
    stopServer,
    restartServer,
    openLogsSession,
    setServerStatus
}