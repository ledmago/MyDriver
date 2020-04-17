const express = require('express');
const mongoose = require('mongoose');
const User = require('../DB/User');
const route = express.Router();

route.get('/:firstName/:lastName', async (req, res) => {

  let user = {};
  user.firstName = req.params.firstName;
  user.lastName = req.params.lastName;
  let userModel = new User(user);
  await userModel.save();
  res.json(userModel);
});

module.exports = route;