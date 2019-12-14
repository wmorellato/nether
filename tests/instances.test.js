/**
 * @jest-environment node
 */

/**
 * ATTENTION:
 * 
 * 1. For this test to work you have to set the update rate of
 * the InstanceMonitor class to be 1s max so Jest can have the
 * expected response in time.
 */

const request = require('supertest')
const app = require('../src/app')
const Server = require('../src/models/server')
const { EVENTS, registerEventCallback, unregisterEventCallback } = require('../src/lib/aws/ec2_monitor')
const { setupDatabase, serverOneId, userOne, userOneId } = require('./fixtures/db')
const { ec2InstanceId, updateInstanceState } = require('./__mocks__/aws-sdk')

beforeEach(setupDatabase)

test('should get instances', async () => {
    const response = await request(app)
        .get('/instances')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body[0].ec2InstanceId).toBe(ec2InstanceId)
})

describe('testing monitor', () => {
    afterAll(() => {
        updateInstanceState('stopped')
    })

    test('should notify online', async (done) => {
        updateInstanceState('stopped')
        registerEventCallback(EVENTS.ONLINE, onlineCallback)

        async function onlineCallback(info) {
            expect(info.ec2InstanceId).toBe(ec2InstanceId)

            const server = await Server.findById(serverOneId)
            expect(server.hostname).toBe('ec2-1.0.0.127.chacha.com')

            unregisterEventCallback(EVENTS.ONLINE, onlineCallback)
            done()
        }

        await request(app)
            .get(`/instances/${ec2InstanceId}/start`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
    })

    test('should notify offline', async (done) => {
        registerEventCallback(EVENTS.OFFLINE, offlineCallback)

        async function offlineCallback(info) {
            expect(info.ec2InstanceId).toBe(ec2InstanceId)
            
            const server = await Server.findById(serverOneId)
            expect(server.hostname).toBe('')

            unregisterEventCallback(EVENTS.OFFLINE, offlineCallback)
            done()
        }

        await request(app)
            .get(`/instances/${ec2InstanceId}/stop`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
    })

    test('should notify status update', async (done) => {
        registerEventCallback(EVENTS.STATUS, statusCallback)

        function statusCallback(status) {
            expect(status.ec2InstanceId).toBe(ec2InstanceId)
            unregisterEventCallback(EVENTS.STATUS, statusCallback)
            done()
        }

        await request(app)
            .get(`/instances/${ec2InstanceId}/start`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)
    })
})

test('should reject all requests', async () => {
    await request(app)
        .get('/instances')
        .send()
        .expect(401)
    
    await request(app)
        .get(`/instances/${ec2InstanceId}/start`)
        .send()
        .expect(401)

    await request(app)
        .get(`/instances/${ec2InstanceId}/stop`)
        .send()
        .expect(401)
            
    await request(app)
        .get(`/instances/${ec2InstanceId}/start`)
        .send()
        .expect(401)
})