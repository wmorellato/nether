const app = require('../src/app')
const request = require('supertest')
const User = require('../src/models/user')
const { setupDatabase,  userOne, userOneId } = require('./fixtures/db')

beforeEach(setupDatabase)

test('should sign up new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Wes',
        email: 'wes@mor.com',
        password: 'fa09ff1029j349'
    }).expect(201)

    // assert that db was changed
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // assertions about the response
    expect(response.body).toMatchObject({
        user: {
            email: 'wes@mor.com'
        }
    })

    expect(user.password).not.toBe('fa09ff1029j349')
})

test('should log in existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const token = response.body.token
    const user = await User.findById(response.body.user._id)

    expect(response.body.token).toBe(user.tokens[1].token)
})

test('should not log in nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: '12345678'
    }).expect(400)
})