const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const route = express.Router();
const { increase_decreaseBalance,changePassword, changeEmail, updateLocation, addCard, addIban, addVehicle } = require('../Controllers/UserService');

route.post('/increaseBalance', async (req, res) => {
    await increase_decreaseBalance(req.body.token, req, res);
});
route.post('/decreaseBalance', async (req, res) => {
    await increase_decreaseBalance(req.body.token, req, res);
});
route.post('/ChangePassword', async (req, res) => {
    await changePassword(req.body.newPassword, req.body.password, req, res);
});
route.post('/ChangeEmail', async (req, res) => {
    await changeEmail(req.body.email, req, res);
});
route.post('/updateLocation', async (req, res) => {
    await updateLocation(req.body.latitude, req.body.longitude, req, res);
});
route.post('/addCard', async (req, res) => {
    await addCard(req.body.cardNumber, req.body.expireDate, req.body.cc, req.body.placeHolder, req, res);
});
route.post('/addIban', async (req, res) => {
    await addIban(req.body.iban, req.body.placeHolder, req.body.bank, req, res);
});
route.post('/addVehicle', async (req, res) => {
    await addVehicle(req.body.plaka, req.body.marka, req.body.model, req.body.yil, req.body.renk, req, res);
});
route.get('/jwt', async (req, res) => {
    const jwt2 = await jwt.sign({
        username: 'ledmago2',
        amount:50,
        operation:'decrease',
    }, 'secretKey00009', { expiresIn: 7 });
    res.json(jwt2);
});

route.get('/jwtverify/:jwt', async (req, res) => {
    res.send(await jwt.verify(req.params.jwt, 'data'));
});
module.exports = route;