const express = require('express');
const mongoose = require('mongoose');
const User = require('../Db/UserLoginSchema');
const route = express.Router();
const {authenticate,create} = require('../Controllers/userService');

route.get('/:username/:password', async (req, res) => {
  const Username = req.params.username;
  const Password = req.params.password;
res.send(await authenticate({ username: Username,password:Password,firstName:'FIRAT',lastName:'Dogan'},req,res));

});

route.get('/', async (req, res) => {

res.send(await authenticate({username:null,password:null},req,res));

});

module.exports = route;