// Connect to Mongo
require('./db/mongoose');
const hbs = require('hbs');
const path = require('path');
const { setupSockets } = require('./lib/socket');
const express = require('express');
// const debug = require('debug')('app');

const instancesRouter = require('./routes/instances');
const serversRouter = require('./routes/servers');
const usersRouter = require('./routes/user');

// Initialize express
const app = express();
const io = require('socket.io')();

// Setting up the console listener
app.set('io', io);
setupSockets(io);

// Defining paths
const publicDir = path.join(__dirname, './public');
const viewsPath = path.join(__dirname, './views');
const partialsPath = path.join(__dirname, './views/partials');

// Set up handlebars
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

// Setup express
// > public dir, maybe I will change this to 'dist' in production
app.use(express.static(publicDir));
app.use(express.json());

// Setup routes
app.use(instancesRouter);
app.use(serversRouter);
app.use(usersRouter);

module.exports = app;
