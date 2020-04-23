const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { CheckLogin } = require('./UserService')
const User = require('../Db/UserSchema');
const Driver = require('../Db/DriverSchema');
const PromotionCode = require('../Db/PromotionSchema');

module.exports = {
  usePromotionCode

};

async function usePromotionCode(code, req, res) {
  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    const promotionCode = await PromotionCode.findOne({ code: code, used: false });

    if (promotionCode && code != null) // Only can access drivers
    {


      const updateUser = userType == 'user' ? await User.findOne({ username: username }) : await Driver.findOne({ username: username });
      updateUser.balance = updateUser.balance + promotionCode.amount;
      updateUser.save();

      promotionCode.used = true;
      promotionCode.username = username;
      promotionCode.save()


      res.send({ status: 'ok', message: 'Kod başarıyla kullanıldı', return: { balance: updateUser.balance } });

    }
    else {
      res.send({ status: 'fail', message: 'Yanlış Kod izin yok' });
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e.message }) }
}
