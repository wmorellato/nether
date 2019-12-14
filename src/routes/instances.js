const auth = require('../middlewares/auth')
const debug = require('debug')('routes:instances')
const express = require('express')
const { INSTANCE_ACTIONS, manageInstance, getInstancesInfo } = require('../lib/aws/ec2')
const { InstanceMonitor } = require('../lib/aws/ec2_monitor')
const instancesRouter = new express.Router()

instancesRouter.get('/instances', auth, async (req, res) => {
    try {
        // passing undefined to getInstancesInfo to get all instances
        const response = await getInstancesInfo()
        
        // this is for when we need to render a webpage and
        // pass the response. For now, sending only the data
        // res.render('instances', { instances: response })

        res.send(response)
    } catch (e) {
        console.error(e)
        res.status(500).send({ error: e.message })
    }
})

instancesRouter.post('/instances/create', auth, async (req, res) => {
    try {
        throw new Error('Not implemented')
    } catch (e) {
        console.error(e)
        res.status(500).send({ error: e.message })
    }
})

instancesRouter.get('/instances/:eid/start', auth, async (req, res) => {
    try {
        const ec2InstanceId = req.params.eid
        const io = req.app.get('io')
        
        if (!io)
            throw new Error('socket.io server could not be found')

        if (!ec2InstanceId)
            throw new Error('invalid instance id')
        
        const response = await manageInstance(ec2InstanceId, INSTANCE_ACTIONS.START)
        res.send(response)

        new InstanceMonitor(io, ec2InstanceId).startMonitoring()
    } catch (e) {
        console.error(e)
        res.status(500).send({ error: e.message })
    }
})

instancesRouter.get('/instances/:eid/stop', auth, async (req, res) => {
    try {
        const ec2InstanceId = req.params.eid

        if (!ec2InstanceId)
            throw new Error('invalid instance id')
        
        const response = await manageInstance(ec2InstanceId, INSTANCE_ACTIONS.STOP)
        res.send(response)
    } catch (e) {
        console.error(e)
        res.status(500).send({ error: e.message })
    }
})

instancesRouter.get('/instances/:eid/restart', auth, async (req, res) => {
    try {
        const ec2InstanceId = req.params.eid

        if (!ec2InstanceId)
            throw new Error('invalid instance id')
        
        const response = manageInstance(ec2InstanceId, INSTANCE_ACTIONS.RESTART)
        res.send(response)
    } catch (e) {
        console.error(e)
        res.status(500).send({ error: e.message })
    }
})

module.exports = instancesRouter