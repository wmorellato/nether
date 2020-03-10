const auth = require('../middlewares/auth');
const debug = require('debug')('routes:servers');
const express = require('express');
const Server = require('../models/server');
const { ServerMonitor } = require('../lib/minecraft/server_monitor');
const {
  screenExists,
  startServer,
  stopServer,
  restartServer,
  updateJar,
} = require('../lib/minecraft/manager');

const serversRouter = new express.Router();

serversRouter.get('/servers', auth, async (req, res) => {
  try {
    const response = [];
    const servers = await Server.find();

    servers.forEach((server) => {
      response.push(server.toJSON());
    });

    // this is for when we need to render a webpage and
    // pass the response. For now, sending only the data
    // res.render('servers', { servers: response })

    res.send(response);
  } catch (e) {
    debug(e);
    res.status(500).send({ error: e.message });
  }
});

serversRouter.post('/servers/create', auth, async (req, res) => {
  try {
    const data = req.body;
    const server = await new Server(data).save();

    res.status(201).send(server);
  } catch (e) {
    debug(e);
    res.status(500).send({ error: e.message });
  }
});

serversRouter.get('/servers/:id/start', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const io = req.app.get('io');
    const server = await Server.findById(_id);

    if (!io) {
      throw new Error('socket.io server could not be found');
    }

    if (!server) {
      throw new Error('could not find specified server');
    }

    await startServer(server);

    // this may not be the best way to check if the command
    // was succesful. Maybe I should respond to the client
    // asap and then inform it in case of errors
    if (await screenExists(server) === true) {
      res.send({ server: server._id, status: 'starting' });
      new ServerMonitor(server, io).startMonitoring();
    } else {
      throw new Error('could not start server');
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: e.message });
  }
});

serversRouter.get('/servers/:id/stop', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const server = await Server.findById(_id);

    if (!server) {
      throw new Error('could not find specified server');
    }

    await stopServer(server);
    res.send({ server: server._id, status: 'stopping' });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: e.message });
  }
});

serversRouter.get('/servers/:id/restart', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const server = await Server.findById(_id);

    if (!server) {
      throw new Error('could not find specified server');
    }

    restartServer();
    res.send({ server: server._id, status: 'restarting' });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: e.message });
  }
});

serversRouter.get('/servers/:id/console', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const server = await Server.findById(_id);

    if (!server) {
      throw new Error('could not find specified server');
    }

    res.render('console');
  } catch (e) {
    debug(e);
    res.status(500).send({ error: e.message });
  }
});

serversRouter.post('/servers/update', auth, async (req, res) => {
  try {
    const _id = req.body.id;
    const jarUrl = req.body.jarUrl;

    if (!_id) {
      throw new Error('invalid server id');
    }

    const server = await Server.findById(_id);

    if (!server) {
      throw new Error('could not find specified server');
    }

    await updateJar(server, jarUrl);
    res.send({ server: server._id, status: 'updating' });
  } catch (e) {
    debug(e);
    res.status(500).send({ error: e.message });
  }
});

module.exports = serversRouter;
