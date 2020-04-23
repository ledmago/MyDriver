const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const { sendMessage,getMessagesFromAnotherPerson} = require('../Controllers/Message');

route.post('/sendMessage', async (req, res) => {

  const { receiverUsername,message,receiverUserType } = req.body;
  await sendMessage(receiverUsername, message, receiverUserType,req, res);

});

route.get('/getMessages', async (req, res) => {

  const { senderUsername,} = req.body;
  await getMessagesFromAnotherPerson(senderUsername,req, res);

});
module.exports = route;