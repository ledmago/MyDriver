const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const { sendMessage,getMessagesFromAnotherPerson,getInbox,setReadedAllMessage} = require('../Controllers/Message');

route.post('/sendMessage', async (req, res) => {

  const { receiverUsername,message,receiverUserType } = req.body;
  await sendMessage(receiverUsername, message, receiverUserType,req, res);

});

route.post('/setReadedAllMessage', async (req, res) => {

  const { senderUsername } = req.body;
  await setReadedAllMessage(senderUsername,req, res);

});

route.post('/getMessages', async (req, res) => {

  const { senderUsername,} = req.body;
  await getMessagesFromAnotherPerson(senderUsername,req, res);

});
route.post('/getInbox', async (req, res) => {

  await getInbox(req, res);

});
module.exports = route;