const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { CheckLogin } = require('./UserService')
const User = require('../Db/UserSchema');
const Driver = require('../Db/DriverSchema');
const Message = require('../Db/MessageSchema');

module.exports = {
  sendMessage,
  getMessagesFromAnotherPerson,
  getInbox,
};

async function getInbox(req, res) {
  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;


    if (username) {
      // const  getInboxList = await Message.aggregate({$or : [{senderUsername:'ledmago2'},{receiverUsername:'ledmago2'}]});


      const getInboxList = await Message.aggregate(
        [
          {
            $match: {
              $or: [{ senderUsername: username }, { receiverUsername: username }]
            },
          },

          {
            $sort: {
              date: -1,
            },
          },

        ]
      );

      var list = [];

      getInboxList.map((item) => {
        if (item.senderUsername != username && list.indexOf(item.senderUsername) == -1) {
          list.push(item.senderUsername);
        }
        else if (item.receiverUsername != username && list.indexOf(item.receiverUsername) == -1) {
          list.push(item.receiverUsername);
        }
      })


      var resultObject =[];
      var returnResult = list.map(async (item) => {
        var unreadCounter = await Message.count({ receiverUsername: username, senderUsername: item, readed: false });
        resultObject.push({ username: item, unreadedCount: unreadCounter });
      });
      Promise.all(returnResult).then(()=>res.send({ status: 'ok', InboxList: resultObject }));
    }
    else {
      res.send({ status: 'fail', message: 'Parametreler eksik.' });
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e.message }) }
}



async function getMessagesFromAnotherPerson(senderUsername, req, res) {
  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;


    if (username && senderUsername != null) {
      const getMessages = await Message.find({ receiverUsername: username, senderUsername: senderUsername })
      res.send({ status: 'ok', return: getMessages, number: getMessages.length })
    }
    else {
      res.send({ status: 'fail', message: 'Parametreler eksik.' });
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e.message }) }
}

async function sendMessage(receiverUsername, message, receiverUserType, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;

    isReceiverExist = receiverUserType == 'user' ? await User.exists({ username: receiverUsername }) : await Driver.exists({ username: receiverUsername });
    if (username && isReceiverExist == true && username != receiverUsername && receiverUsername != null && message != null && receiverUserType != null) {
      const newMessage = new Message({ senderUsername: username, receiverUsername: receiverUsername, message: message, date: Date.now() })
      newMessage.save();
      res.send({ status: 'ok', message: 'Mesaj gönderildi', return: newMessage })
    }
    else {
      res.send({ status: 'fail', message: 'Parametreler eksik.' });
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e.message }) }
}