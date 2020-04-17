const express = require('express');
const mongoose = require('mongoose');
const User = require('../Db/UserLoginSchema');
const route = express.Router();
const {authenticate,create} = require('../Controllers/userService');

route.get('/', async (req, res) => {
    res.clearCookie('userHash');
    res.send('Log Outed Successfully').status(202)
});

module.exports = route;