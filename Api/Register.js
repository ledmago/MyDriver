const express = require('express');
const mongoose = require('mongoose');
const User = require('../Db/UserLoginSchema');
const route = express.Router();
const {authenticate,create} = require('../Controllers/userService');

route.post('/', async (req, res) => {
  const Username = req.body.username;
  const Password = req.body.password;
  const FirstName = req.body.firstName;
  const LastName = req.body.lastName;
  const Email = req.body.password;
  const Phone = req.body.phone;
  const Gender = req.body.gender;
  
await create({ username: Username,password:Password,firstName:FirstName,lastName:LastName,email:Email,phone:Phone,gender:Gender},req,res);

});

module.exports = route;