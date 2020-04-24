const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const {authenticate,create} = require('../Controllers/userService');

route.post('/', async (req, res) => {
    res.clearCookie('userHash');
    res.send('Log Outed Successfully').status(202)
});

module.exports = route;