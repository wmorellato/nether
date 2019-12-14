const getRoom = () => {
    return '5de193272e10c617f55855f1' // server id
}

const socket = io()

socket.emit('join', getRoom(), () => {
    console.log('joined room', getRoom())
})

socket.on('logs', (data) => {
    console.log('logs', data)
})

socket.on('status', (status) => {
    console.log('status', status)
})