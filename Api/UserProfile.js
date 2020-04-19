const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const { increaseBalance, changePassword,changeEmail,updateLocation } = require('../Controllers/userService');

route.post('/increaseBalance', async (req, res) => {
    await increaseBalance(req.body.token, req, res);

});
route.post('/ChangePassword', async (req, res) => {
    await changePassword(req.body.newPassword, req.body.password, req, res);

});
route.post('/ChangeEmail', async (req, res) => {
    await changeEmail(req.body.email, req, res);

});
route.post('/updateLocation', async (req, res) => {
    await updateLocation(req.body.latitude,req.body.longitude, req, res);

});
module.exports = route;