const ec2InstanceId = 'i-00a5f48d5272fb98f'

var instanceState = {
    InstanceId: 'i-00a5f48d5272fb98f',
    InstanceType: 'foobar',
    Platform: 'linux',
    PublicDnsName: 'foobar.com',
    PublicIpAddress: '127.0.0.1',
    State: {
        Name: 'stopped'
    },
    Tags: [{ Name: 'Foobar' }]
}

const updateInstanceState = (state) => {
    instanceState.State.Name = state
}

function EC2() {
    this.describeInstances = function (params, callback) {
        if (params.InstanceIds && params.InstanceIds[0] !== ec2InstanceId)
            return callback({ error: 'invalid instance id' }, null)
        
        if (instanceState.State.Name === 'running')
            instanceState.PublicDnsName = 'ec2-1.0.0.127.chacha.com'
        
        if (instanceState.State.Name === 'stopped' || instanceState.State.Name === 'pending')
            instanceState.PublicDnsName = '' 

        callback(null, {
            Reservations: [
                {
                    Instances: [instanceState]
                }
            ]
        })
    },
    this.startInstances = function (params, callback) {
        if (params.InstanceIds && params.InstanceIds[0] !== ec2InstanceId)
            return callback({ error: 'invalid instance id' }, null)

        callback(null, {
            StartingInstances: [
                {
                    CurrentState: {
                        Code: 0,
                        Name: "pending"
                    },
                    InstanceId: ec2InstanceId,
                    PreviousState: {
                        Code: 80,
                        Name: "stopped"
                    }
                }
            ]
        })

        updateInstanceState('running')
    },
    this.stopInstances = function (params, callback) {
        if (params.InstanceIds && params.InstanceIds[0] !== ec2InstanceId)
            return callback({ error: 'invalid instance id' }, null)

        callback(null, {
            StoppingInstances: [
                {
                    CurrentState: {
                        Code: 0,
                        Name: "stopping"
                    },
                    InstanceId: ec2InstanceId,
                    PreviousState: {
                        Code: 80,
                        Name: "running"
                    }
                }
            ]
        })

        updateInstanceState('stopped')
    },
    this.rebootInstances = function (params, callback) {
        if (params.InstanceIds && params.InstanceIds[0] !== ec2InstanceId)
            return callback({ error: 'invalid instance id' }, null)

        callback(null, {
            RebootingInstances: [
                {
                    CurrentState: {
                        Code: 0,
                        Name: "rebooting"
                    },
                    InstanceId: ec2InstanceId,
                    PreviousState: {
                        Code: 80,
                        Name: "running"
                    }
                }
            ]
        })
    }
}

module.exports = {
    EC2,
    ec2InstanceId,
    updateInstanceState
}

