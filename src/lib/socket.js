const debug = require('debug')('sockets')

/**
 * The notifications sent by servers/instances are
 * made through rooms named after its _ids and instance ids.
 */
const setupSockets = (io) => {
    io.on('connection', (socket) => {
        debug('client connected', socket.id) 
        socket.emit('logs', 'connected')

        socket.on('join', (room, callback) => {
            debug('joined room', socket.id, room)
            socket.join(room)
            callback()
        })

        socket.on('disconnect', () => {
            debug('client disconnected', socket.id)
            socket.emit('logs', 'disconnected')
        })
    })
}

module.exports = {
    setupSockets
}