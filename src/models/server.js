/**
 * Model for a Minecraft Server. The info here is not supposed
 * to be edited ingame and at the same time is related to the
 * server configuration. Also (as it is with "port") it contains
 * the info necessary to connect to that server or check its status.
 */

 const mongoose = require('mongoose')
 const CryptoJS = require('crypto-js')

 const serverSchema = new mongoose.Schema({
    ec2InstanceId: {
        type: String,
        required: true
    },
    hostname: {
        type: String
    },
    user: {
        type: String,
        required: true
    },
    sshKey: {
        type: String,
        required: true
    },
    serverPort: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 1 || value > 65535)
                throw new Error('invalid port')
        }
    },
    jar: {
        type: String,
        required: true
    },
    world: {
        type: String,
        required: true
    },
    plugins: [{
        name: {
            type: String,
            required: true
        },
        jarName: {
            type: String,
            required: true
        },
        enabled: {
            type: Boolean,
            required: true,
            default: true
        }
    }]
 }, {
    timestamps: true
 })

 serverSchema.pre('save', function(next) {
    const server = this

    if (server.isModified('sshKey')) {
        server.sshKey = CryptoJS.AES.encrypt(server.sshKey, process.env.SSHKEY_ENCRYPTION_KEY)
    }

    next()
})

serverSchema.methods.getSshKey = function () {
    const server = this

    const decSshKey = CryptoJS.AES.decrypt(server.sshKey, process.env.SSHKEY_ENCRYPTION_KEY)
    return decSshKey.toString(CryptoJS.enc.Utf8)
}

serverSchema.methods.toJSON = function () {
    const server = this
    const serverObject = server.toObject()

    delete serverObject.user
    delete serverObject.sshKey

    return serverObject
}

 const Server = mongoose.model('Server', serverSchema)

 module.exports = Server