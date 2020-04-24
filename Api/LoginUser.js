const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const {authenticateUser} = require('../Controllers/userService');

route.post('/', async (req, res) => {
  const Username = req.body.username;
  const Password = req.body.password;
await authenticateUser({ username: Username,password:Password,firstName:'FIRAT',lastName:'Dogan'},req,res);

});



// route.get('/', async (req, res) => {

// res.send(await authenticate({username:null,password:null},req,res));

// });

module.exports = route;