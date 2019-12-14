const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Server = require('../../src/models/server')
const { ec2InstanceId } = require('../__mocks__/aws-sdk')

const serverOneId = new mongoose.Types.ObjectId()
const serverOne = {
    _id: serverOneId,
    ec2InstanceId,
    hostname: '',
    user: 'ubuntu',
    // guess what, another fake pk
    sshKey: '-----BEGIN RSA PRIVATE KEY-----MIIEpQIBAAKCAQEAvhm/0j4Hzm0wMZKRri3Nd+fmApLThXuyriR+CqiEONkXNNgt7B6usy65EhAPpByo58vNrYeIkBAdzWrtt5j1blQiYfZYhKcGHrBhjbK8WNBnHuG5FepD04tZaaHjlzJ9J1zayKtU1AiZjl8pKmnU7n6Jo6sGhgYcPilUBmPfB0nFlvr0uc4xUrWg2Fl0h3Ww1JlNhnMfLK/wOjaSHLgNw6yiixyG1TJAcrlzNJ1pHXFExAHw7j2nBcgwDUCNLgAnMWFN8FB6ibN6CFt7NCWtOLueAqU7FphwurBqCqcRH+gyOF23ZtmiupsyzCojTniZ0PpMWrDWgZ9aAqA+1BbfyQIDAQABAoIBAQCRCHQgotKx2vv51ijvCmLIKFSDgiF+pXEdCxpeZ1L5TCc4WfYvPvlqGyt3bGmCe5shvYud6Nl3j9Qs9HeIq1oUYnwY4SmHiyZQI6FJyiOIXvdNyEi9P42fx6DfxnMs14hEj8Mbdhux6R2+UTvG8BdUHZZFGCZR+jdx9XX1qhxuIbiwzQG4979FjDnGAQ5AG5rEGXIDOTt7UuWlZDLpUtiO6LD9tJt47oO6IHOX1u4uOGz1yYCkjyjdTL0oGaEHaiaVTJ10QsjPoGrLWh+T7EXPxALClnhMfyjc4XfnnU5YSm3/yEeG2N6j4kcvw2/g/jm74ONulAEMVZDKfC+Y3NVBAoGBAO9lRDNEAw4317tBs/9L65E/yf32o/wSN8tRf/dgO89CJzvX2SFxw5Jw4ULo1QphRETJ3iWD7LL2lpY60VVijzCyg1hTjdD9BJQXgEnTgJI5qZyiJrt6rp0j+gyGy/XImbl9PnRdvaWdjqhczJdiNyJYxdnpxubJKrxmOXPt0ZqDAoGBAMtJMh1DCVqpGlt1va852caeIItMac8Ht8qCQ0zsyeUKUjOhny5uxKGC2NsOiNnqlzFiTxjr6igtuKInL9jYFOUhoC16MF5AsjQdO0+dslOflU9ptC6oKcdSLKIeFaYqsna2a6fiMf9CkEsZtGIz8ggBsbTMi1Iazr4NDphUObrDAoGBAMj7fsd/iQUt0ttubNyf85SNNlsV71SYQulachHQZEY75s5yB+PxK91NEYFoEjvVr0gFJpDeciFJruFPXiHOTiL3LBhChaR4V5ixJk5U1/Nrn79VzyjE9cYNx0cvABtIH+8/e+icLrTVU0h8KHPLzDf0yZ6KiyeEqnFjbUar2bZbAoGBAK3XDlAPv7QT4EJOUcPDCQTcvJ/i3Kj6xKUcEiURaLkTJ9ymxmuB+DGcIQDzevsvRayJ0n8lOV/E+E2+afKQTQgqUW6tBol4T7HsKzJAnKYiaq7jiZIEFIvZ5PLfl/3K15xaWbL/E15ssNGXAeOvG80Y69lK88utZW4vL5vaF7ZAoGAfoH1IMgYmZOK5M6/nSNtfEciPrEMBwEsQGXOhtdVf6Ul6OmScEU8BAOcwiWjUr1iS3Y9eYce6t4F3ZZf9zSuA5eaXuRkeJaOwFMwklNuezNGY1Y6ZVgHSyw/+CXag6aWwa+43qVFON1t5G5GXKvnI+W0FyTKleOENe3LSzAvrW4=-----END RSA PRIVATE KEY-----',
    serverPort: 25565,
    jar: 'paper-000',
    world: 'Server One',
    plugins: []
}

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    email: 'test@test.com',
    password: 'password',
    tokens: [{
        token: jwt.sign({ _id: userOneId, admin: true }, process.env.JWT_SECRET)
    }]
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Server.deleteMany()

    await new User(userOne).save()
    await new Server(serverOne).save()
}

module.exports = {
    ec2InstanceId,
    serverOneId,
    setupDatabase,
    userOneId,
    userOne
}