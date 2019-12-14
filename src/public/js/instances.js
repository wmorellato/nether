const socket = io()

socket.on('status', (info) => {
    console.log(info)

    if (info.state === 'running')
        alert('instance running!!')
})

function startInstance(ec2InstanceId) {
    console.log('start', ec2InstanceId)

    socket.emit('join', ec2InstanceId, () => {
        console.log('joined room')
    })

    $.get(`/instances/${ec2InstanceId}/start`, (r) => {
        console.log(r)
    })
}