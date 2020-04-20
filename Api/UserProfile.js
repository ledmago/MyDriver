const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const { increaseBalance, changePassword,changeEmail,updateLocation,addCard } = require('../Controllers/userService');

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
route.post('/addCard', async (req, res) => {

     await addCard(req.body.cardNumber,req.body.expireDate,req.body.cc,req.body.placeHolder, req, res);

});
module.exports = route;