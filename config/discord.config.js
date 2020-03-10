/**
 * Config file for Discord integration. Here we configure
 * layout for specific messages, channel ids and so on.
 */

const config = {
  messages: {
    serverOnline: {
      title: 'Server is online!',
      description: 'Let\'s play together! Copy the address below' +
        'and pasteit on Minecraft.',
      color: 0x7ED321,
      thumbnail: 'http://www.rw-designer.com/icon-image/5547-64x64x32.png',
    },
  },
  channels: {
    bot: {
      id: '650068712136769575',
    },
    custom1: {
      // chacha
      id: '586831455397609475',
    },
    custom2: {
      // test
      id: '650068712136769575',
    },
  },
};

module.exports = config;
