// const debug = require('debug')('routes:user');
const express = require('express');
const User = require('../models/user');
const auth = require('../middlewares/auth');

const usersRouter = new express.Router();

usersRouter.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.createAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: e.message });
  }
});

usersRouter.post('/users/login', async (req, res) => {
  try {
    const user = await User
        .findByCredentials(req.body.email, req.body.password);
    const token = await user.createAuthToken();

    res.send({ user, token });
  } catch (e) {
    console.error(e);
    res.status(400).send({ error: e.message });
  }
});

usersRouter.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();

    res.send();
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: e.message });
  }
});

module.exports = usersRouter;
