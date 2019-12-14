const socket = io()

socket.on('status', (info) => {
    console.log(info)
    
    if (info.online)
        alert('server running!!')
})

function startInstance(serverId) {
    console.log('start', serverId)

    socket.emit('join', serverId, () => {
        console.log('joined room')
    })

    $.get(`/servers/${serverId}/start`, (r) => {
        console.log(r)
    })
}