const express = require('express');
const mongoose = require('mongoose');
const User = require('../Db/UserLoginSchema');
const route = express.Router();
const {authenticate,create} = require('../Controllers/userService');

route.get('/', async (req, res) => {
  const Username = req.body.username;
  const Password = req.body.password;
res.send(await authenticate({ username: Username,password:Password,firstName:'FIRAT',lastName:'Dogan'},req,res));

});

// route.get('/', async (req, res) => {

// res.send(await authenticate({username:null,password:null},req,res));

// });

module.exports = route;