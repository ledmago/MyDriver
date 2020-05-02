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
  setReadedAllMessage,
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
        if (item.senderUsername != username &&  list.find(item2=> item2.username == item.senderUsername) == null) {
          var senderObj = {};
          senderObj.username = item.senderUsername;
          senderObj.userType = item.senderUsertype;
          list.push(senderObj);
        }
        else if (item.receiverUsername != username && list.find(item2=> item2.username == item.receiverUsername) == null) {
          
          var senderObj = {};
          senderObj.username = item.receiverUsername;
          senderObj.userType = item.receiverUsertype;
          list.push(senderObj);
        }
      })


      var resultObject = [];
      var returnResult = list.map(async (item) => {
        getUserNameByType = null;
      try { getUserNameByType = item.userType == 'driver' ? await Driver.findOne({username:item.username}): await User.findOne({username:item.username});
        if(getUserNameByType.username == null) {/* Kullanıcı silinmişse yada database de yoksa error Handler olamsı lazım */}
        var unreadCounter = await Message.countDocuments({ receiverUsername: username, senderUsername: item.username, readed: false });
        var lastMessage = await Message.findOne( {$or:[{$and:[{receiverUsername:username},{senderUsername:item.username}]},{$and:[{receiverUsername:item.username},{senderUsername:username}]}]}).sort({date:-1})
        resultObject.push({ username: item.username,userType:item.userType,firstName:getUserNameByType.firstName,lastName:getUserNameByType.lastName, unreadedCount: unreadCounter,lastMessage:lastMessage,lastSender:lastMessage.senderUsername == username ? 'self':'stranger' });
      }catch(e){}
      });
      Promise.all(returnResult).then(() => res.send({ status: 'ok', InboxList: resultObject }));
    }
    else {
      res.send({ status: 'fail', message: 'Parametreler eksik.' });
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e.message }) }
}


async function setReadedAllMessage(senderUsername, req, res) {
  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;


    if (username && senderUsername != null) {
      const getMessages = await Message.updateMany({senderUsername:senderUsername,receiverUsername:username,readed:false},{readed:true});
      res.send({ status: 'ok', return: getMessages, number: getMessages.length })
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
      const getMessages = await Message.find({$or:[{$and:[{receiverUsername:username},{senderUsername:senderUsername}]},{$and:[{receiverUsername:senderUsername},{senderUsername:username}]}]}).sort({date:-1})
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
      const newMessage = new Message({ senderUsername: username, senderUsertype: userType, receiverUsername: receiverUsername, receiverUsertype: receiverUserType, message: message, date: Date.now() })
      newMessage.save();
      res.send({ status: 'ok', message: 'Mesaj gönderildi', return: newMessage })
    }
    else {
      res.send({ status: 'fail', message: 'Parametreler eksik.' });
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e.message }) }
}