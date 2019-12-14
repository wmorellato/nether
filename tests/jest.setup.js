require('dotenv').config({
    path: `config/env/test.env`,
})

jest.setTimeout(5000)

module.exports = {
    testEnvironment: 'node'
}