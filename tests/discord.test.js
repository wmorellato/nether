/**
 * @jest-environment node
 */

/**
 * This is a simple test for Discord bots.
 */

const { sendOnlineNotification, updateServerStatus, setupBot } = require('../src/lib/discord/bot')

test('should update bot status', (done) => {
    const testOnline = true

    setupBot(() => {
        if (testOnline)
            updateServerStatus({
                online: true,
                version: '1.14.4',
                motd: 'A message',
                onlinePlayers: 3,
                maxPlayers: 20
            })
        else
            updateServerStatus({ online: false })

        done()
    })
})

test('should send online notification message', () => {
    sendOnlineNotification({ hostname: '127.0.0.1', port: 25565 })
})