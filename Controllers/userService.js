const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Db/UserSchema');
const Driver = require('../Db/DriverSchema');
const PaymentLog = require('../Db/PaymentLogSchema');
var image = require('express-image');

module.exports = {
  authenticateUser,
  authenticateDriver,
  getAll,
  getById,
  registerUser,
  registerDriver,
  increase_decreaseBalance,
  changePassword,
  changeEmail,
  updateLocation,
  addCard,
  deleteCard,
  getCreditCards,
  addIban,
  deleteIban,
  addVehicle,
  deleteVehicle,
  CheckLogin,
  uploadProfilePhoto,
  getProfilePicture,
  addPaymentLog,
  getPaymentLog,
  saveLocation,
};






/*

  Login & Register Functions

*/

var createHash = (username, res, userType) => {
  var userHashToken = jwt.sign({ username: username, userType: userType }, config.secret);
  res.cookie('userHash', userHashToken);

}
async function CheckLogin(userHash) {
  try {
    if (userHash) {
      var result = jwt.verify(userHash, config.secret);

      const user = result.userType == 'user' ? await User.findOne({ username: result.username }) : await Driver.findOne({ username: result.username })
      if (user) {
        userWithoutHash = user;
        // user.hash = ''
        return userWithoutHash;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }
  catch (e) {
    return false;
  }

}
var findUserByCookie = async (userHash, res, username, password, userType) => {
  try {
    if (userHash) {
      var result = jwt.verify(userHash, config.secret);

      const user = result.userType == 'user' ? await User.findOne({ username: result.username }) : await Driver.findOne({ username: result.username })
      if (user) {
        userWithoutHash = user;
        // user.hash = ''
        res.send(userWithoutHash);
      }
      else {
        res.clearCookie('userHash');
        if (username == null || password == null) {
          res.status(403).send({ status: 'fail', message: 'username or password is incorrect' });
        }
        else {
          // Eğer bir hata varsa cookie'sini sil

          if (userHash.userType == 'driver') this.authenticateDriver(username, password); else this.authenticateLogin(username, password);
        }


      }



    }
  }
  catch (e) {
    res.send({ status: 'fail', message: 'Your account is not found ', error: e });
  }
}
async function authenticateDriver({ username, password } = null, req, res) {

  if (!req.cookies.userHash) {

    if (username != null && password != null) {
      const user = await Driver.findOne({ username });
      if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        createHash(username, res, 'driver');
        res.send(userWithoutHash).status(202);
      }
      else { res.status(403).send({ status: 'fail', message: 'username or password is wrong' }) }


    }
    else { res.status(403).send({ status: 'fail', message: 'username or password is wrong' }) }
  }
  else {
    res.send(await findUserByCookie(req.cookies.userHash, res, username, password));
  }
}
async function authenticateUser({ username, password } = null, req, res) {

  if (!req.cookies.userHash) {

    if (username != null && password != null) {
      const user = await User.findOne({ username });
      if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        createHash(username, res, 'user');
        res.send(userWithoutHash).status(202);
      }
      else { res.status(403).send({ status: 'fail', message: 'username or password is wrong' }) }


    }
    else { res.status(403).send({ status: 'fail', message: 'username or password is wrong' }) }
  }
  else {
    res.send(await findUserByCookie(req.cookies.userHash, res, username, password));
  }
}
// Validating Functions

function ValidateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return (true)
  } else { return (false) }

}
var isThereEmailAlready = async (email, usertype) => {
  var search = usertype == 'user' ? await User.findOne({ email: email }) : await Driver.findOne({ email: email });
  if (search) {
    return false
  }
  else {
    return true

  }
}
var ValidateUsername = async (username, usertype) => {

  var search = usertype == 'user' ? await User.findOne({ username: username }) : await Driver.findOne({ username: username });
  if (search) {
    return false
    // res.status(403).send({ status: 'fail', text: 'Username ' + userParam.username + ' is already taken' });
  }
  else {
    return true

  }

}
function validatePhone(phone) {
  var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (phone.match(phoneno)) {
    return true;
  }
  else {
    return false;
  }
}
// Validate for registering main functions
var validateRegisterParams = async (userParams) => {

  var isUsernameAlready = await ValidateUsername(userParams.username, userParams.userType) ? true : 'Kullanıcı adı ' + userParams.username + ' daha önceden alınmış';
  var isUsernameValid = userParams.username.length > 4 && userParams.username.length < 15 ? true : ' Your Username should be at least 5 character and maximum 15 character';
  var isEmailValid = await ValidateEmail(userParams.email) ? true : ' Your email Address is wrong';
  var isAlreadyEmail = await isThereEmailAlready(userParams.email, userParams.userType) ? true : ' Bu email adresi daha önce bir hesaba kayıtlı';
  var isPhone = await userParams.phone.length > 2 ? true : ' Your phone number is not valid.'
  // var isPhone = await validatePhone(userParams.phone) ? true : ' Your phone number is not valid.';
  var isPasswordValid = userParams.password.length > 5 && userParams.password.length < 15 ? true : ' Your password should be at least 6 character and maximum 15 character';
  var isFirstNameValid = userParams.firstName.length > 2 && userParams.firstName.length < 18 ? true : 'Your first name should be at least 3 character and maximum 18 character ';
  var isFLastNameValid = userParams.lastName.length > 2 && userParams.lastName.length < 18 ? true : 'Your last name should be at least 3 character and maximum 18 character ';
  var isGendeValid = userParams.gender == 'male' || userParams.gender == 'female' ? true : 'Your gender ether by male or female';

  // For Drivers
  if (userParams.userType == 'driver') {
    var isvehiclValid = userParams.vehicleTemp.marka.length > 1 && userParams.vehicleTemp.model.length > 1 && userParams.vehicleTemp.plaka.length && userParams.vehicleTemp.yil > 1990 ? true : 'Araç bilgilerinizi kontrol edin'
    var isDriverLicense = userParams.driverLicense == true ? true : 'You should have driver License';

  }



  if (userParams.userType == 'user') {
    if (isUsernameAlready == true && isUsernameValid == true && isEmailValid == true && isAlreadyEmail == true && isPhone == true && isPasswordValid == true && isFirstNameValid == true && isFLastNameValid == true && isGendeValid == true) { return true; }
    else {
      var errorArray = [];
      if (isUsernameAlready != true) errorArray.push(isUsernameAlready);
      if (isUsernameValid != true) errorArray.push(isUsernameValid);
      if (isEmailValid != true) errorArray.push(isEmailValid);
      if (isAlreadyEmail != true) errorArray.push(isAlreadyEmail);
      if (isPhone != true) errorArray.push(isPhone);
      if (isPasswordValid != true) errorArray.push(isPasswordValid);
      if (isFirstNameValid != true) errorArray.push(isFirstNameValid);
      if (isFLastNameValid != true) errorArray.push(isFLastNameValid);
      if (isGendeValid != true) errorArray.push(isGendeValid);
      return { status: 'fail', message: errorArray }

    }

  }
  else {
    if (isvehiclValid == true && isDriverLicense == true && isUsernameValid == true && isEmailValid == true && isAlreadyEmail == true && isPhone == true && isPasswordValid == true && isFirstNameValid == true && isFLastNameValid == true && isGendeValid == true) { return true; }
    else {
      var errorArray = [];
      if (isUsernameAlready != true) errorArray.push(isUsernameAlready);
      if (isUsernameValid != true) errorArray.push(isUsernameValid);
      if (isEmailValid != true) errorArray.push(isEmailValid);
      if (isAlreadyEmail != true) errorArray.push(isAlreadyEmail);
      if (isPhone != true) errorArray.push(isPhone);
      if (isPasswordValid != true) errorArray.push(isPasswordValid);
      if (isFirstNameValid != true) errorArray.push(isFirstNameValid);
      if (isFLastNameValid != true) errorArray.push(isFLastNameValid);
      if (isGendeValid != true) errorArray.push(isGendeValid);
      if (isvehiclValid != true) errorArray.push(isvehiclValid);
      if (isDriverLicense != true) errorArray.push(isDriverLicense);
      return { status: 'fail', message: errorArray }

    }
  }






};
// Register Functions
async function registerUser(userParam, req, res) {

  try {
    var validateObject = {
      username: userParam.username,
      password: userParam.password,
      firstName: userParam.firstName,
      lastName: userParam.lastName,
      email: userParam.email,
      gender: userParam.gender,
      phone: userParam.phone,
      currentPosition: { latitude: null, longitude: null },
      balance: 0,
      creditCards: {},
      createdDate: Date.now(),
      userType: 'user',
    }


    // Cookie Control
    if (!req.cookies.userHash) {

      if (await validateRegisterParams(userParam) == true) {
        const user = new User(validateObject);

        // hash password
        if (validateObject.password) {
          user.hash = bcrypt.hashSync(validateObject.password, 10);
        }

        // save user
        await user.save();
        createHash(validateObject.username, res, 'user');
        res.status(200).send(user)
      }
      else {
        res.send(await validateRegisterParams(userParam))
      }


    }
    else {
      res.status(403).send({ status: 'fail', message: 'You are already logged in' })
    }

  }
  catch (e) {
    e.status = 'fail';
    res.status(403).json(e)
  }

}
async function registerDriver(userParam, req, res) {

  try {
    var validateObject = {
      username: userParam.username,
      password: userParam.password,
      firstName: userParam.firstName,
      lastName: userParam.lastName,
      email: userParam.email,
      gender: userParam.gender,
      phone: userParam.phone,
      currentPosition: { latitude: null, longitude: null },
      balance: 0,
      creditCards: {},
      createdDate: Date.now(),
      userType: 'driver',
      vehicle: { marka: userParam.vehicleTemp.marka, model: userParam.vehicleTemp.model, yil: userParam.vehicleTemp.yil, renk: userParam.vehicleTemp.renk, plaka: userParam.vehicleTemp.plaka },
      iban: userParam.iban,
    }


    // Cookie Control
    if (!req.cookies.userHash) {

      if (await validateRegisterParams(userParam) == true) {
        const driver = new Driver(validateObject);

        // hash password
        if (validateObject.password) {
          driver.hash = bcrypt.hashSync(validateObject.password, 10);
        }

        // save user
        await driver.save();
        createHash(validateObject.username, res, 'driver');
        res.status(200).send(driver)
      }
      else {
        res.send(await validateRegisterParams(userParam))
      }


    }
    else {
      res.status(403).send({ status: 'fail', message: 'You are already logged in' })
    }

  }
  catch (e) {
    e.status = 'fail';
    res.status(403).send(e)
  }

}














/*

  User Functions


*/
async function getProfilePicture(username2, userType, req, res) {
  try {
    if (username2 == 'default' && userType == 'default') { res.sendFile(config.ProfilePictureUrl + 'default.png', { root: './' }); }

    const getProfileUrl = userType == 'user' ? await User.findOne({ username: username2 }) : await Driver.findOne({ username: username2 });
    var profilePicture = getProfileUrl.profilePicture;
    if (profilePicture != null && profilePicture != '') {
      res.sendFile(config.ProfilePictureUrl + profilePicture, { root: './' })
      // res.sendFile(config.ProfilePictureUrl + profilePicture)
    }
    else {
      res.sendFile(config.ProfilePictureUrl + 'default.png', { root: './' })
    }
  }
  catch (e) {
    res.sendFile(config.ProfilePictureUrl + 'default.png', { root: './' })
    // res.send({ status: 'fail', message: 'User bulunamadı',e:e.message });
  }

  /*
      const getProfileUrl = userType == 'user' ? await User.findOne({username:username2}) :  await Driver.findOne({username:username2});
      if(getProfileUrl.profilePicture !=null)
      {
          image(config.ProfilePictureUrl + getProfileUrl.profilePicture);
      }
      else{
        image(config.ProfilePictureUrl + 'default.jpg');
      }
    
    */
}
async function uploadProfilePhoto(req, res) {

  var generalUser = await CheckLogin(req.cookies.userHash);
  var username = generalUser.username;
  var userType = generalUser.userType;
  if (username) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.photo;
    var extention;
    if (sampleFile.mimetype == 'image/jpeg') { extention = '.jpg'; }
    else if (sampleFile.mimetype == 'image/jpeg') { extention = '.png'; }
    else if (sampleFile.mimetype == 'image/gif') { extention = '.gif'; }
    else { return res.send({ status: 'fail', message: 'Hatalı Resim' }); }

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('./images/' + username + extention, async function (err) {
      if (err) { return res.status(500).send(err); }

      const updateUser = userType == 'user' ? await User.findOne({ username: username }) : await Driver.findOne({ username: username });
      updateUser.profilePicture = username + extention;
      updateUser.save();
      res.send({ status: 'ok', message: 'Fotoğraf Yüklendi' });
    });
  }
  else {
    res.send({ status: 'fail', message: 'Giriş Yapılmamış' });
  }





}

async function increase_decreaseBalance(token, req, res, reason = null) {


  var generalUser = await CheckLogin(req.cookies.userHash);
  var username = generalUser.username;
  var userType = generalUser.userType;
  const tokenAlreadyExist = await PaymentLog.exists({ token: token })
  if (username && token != null && tokenAlreadyExist == false) {
    try {
      var tokenResult = jwt.verify(token, config.secret);
      var amount = tokenResult.amount;
      var tokenUsername = tokenResult.username;
      var opearation = tokenResult.operation;

      if (tokenUsername == username) {
        const currentUser = userType == 'user' ? await User.findOne({ username: username }) : await Driver.findOne({ username: username });
        var newBalance = opearation == 'increase' ? currentUser.balance + amount : currentUser.balance - amount
        currentUser.balance = newBalance;
        currentUser.save();
        addPaymentLog(req, opearation, amount, reason, token, newBalance);
        res.status(202).json({ status: 'ok', balance: currentUser.balance });

      }
      else {
        res.json({ status: 'fail', message: 'token parametresindeki username eşleşmedi' })
      }


    }
    catch (e) { res.send({ status: 'fail', message: 'token parametresi yanlış', e: e }) }
  }
  else {
    res.send({ status: 'fail', message: 'token parametresi eksik' })
  }

}

async function getPaymentLog(req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    var oldCurrentPassword = generalUser.hash;
    if (username) {

      try {


        const getPaymentLogsByUsername = await PaymentLog.find({ username: username }).sort({ date: -1 })
        res.status(202).json({ status: 'ok', paymentLog: getPaymentLogsByUsername });

      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e.message }) }


    }
  }
  catch (e) {
    res.send({ status: 'fail' });
  }
}


async function changePassword(newPassword, oldPassword, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    var oldCurrentPassword = generalUser.hash;
    if (username && bcrypt.compareSync(oldPassword, oldCurrentPassword)) {
      try {

        const currentUser = userType == 'user' ? await User.findOne({ username: username }) : await Driver.findOne({ username: username });
        currentUser.hash = bcrypt.hashSync(newPassword, 10);
        currentUser.save();
        res.status(202).json({ status: 'ok', message: 'Şifre değiştirildi' });

      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
    }
    else {
      res.send({ status: 'fail', message: 'Eski şifre yanlış' })
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}

async function changeEmail(newEmail, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    if (username && ValidateEmail(newEmail) && await isThereEmailAlready(newEmail)) {
      try {

        const currentUser = userType == 'user' ? await User.findOne({ username: username }) : await Driver.findOne({ username: username });
        currentUser.email = newEmail;
        currentUser.save();
        res.status(202).json({ status: 'ok', message: 'Email değiştirildi' });

      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
    }
    else {
      res.send({ status: 'fail', message: 'Email Geçersiz veya bir hesap tarafından zaten kullanılıyor.' })
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}
async function deleteIban(iban, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    if (username && iban != null && userType == 'driver') {
      try {

        const currentUser = await Driver.findOne({ username: username });
        var currentIban = currentUser.vehicle;
        var ibanList = [];
        var alreadyExist = false;
        var itemIndex = null;
        if (currentIban) {
          currentIban.map((item) => { ibanList.push(item) })
        }
        else {
          currentUser.iban = [];
        }

        // checks it if already credit card
        currentUser.iban.map((item, index) => { if (item.iban == iban) { alreadyExist = true; itemIndex = index; } });

        if (alreadyExist == false) {

          res.status(202).json({ status: 'fail', message: 'Araç bulunamadı', e: plaka });
        }
        else {


          ibanList.splice(itemIndex, 1);


          currentUser.iban = 'something'; // bu gerekli
          currentUser.iban = ibanList;
          currentUser.save();
          res.status(202).json({ status: 'ok', message: 'Iban Güncellendi', return: currentUser.iban });
        }



      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
    }
    else {
      res.send({ status: 'fail', message: 'Kullanıcı giriş yapmamış veya latitudeveya longitude bilgileri eksik' })
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e.message }) }

}
async function deleteVehicle(plaka, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    if (username && plaka != null && userType == 'driver') {
      try {

        const currentUser = await Driver.findOne({ username: username });
        var currentVehicle = currentUser.vehicle;
        var vehicleList = [];
        var alreadyExist = false;
        var itemIndex = null;
        if (currentVehicle) {
          currentVehicle.map((item) => { vehicleList.push(item) })
        }
        else {
          currentUser.vehicle = [];
        }

        // checks it if already credit card
        currentUser.vehicle.map((item, index) => { if (item.plaka == plaka) { alreadyExist = true; itemIndex = index; } });

        if (alreadyExist == false) {

          res.status(202).json({ status: 'fail', message: 'Araç bulunamadı', e: plaka });
        }
        else {


          vehicleList.splice(itemIndex, 1);


          currentUser.vehicle = 'something'; // bu gerekli
          currentUser.vehicle = vehicleList;
          currentUser.save();
          res.status(202).json({ status: 'ok', message: 'Araç Güncellendi', return: currentUser.vehicle });
        }



      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
    }
    else {
      res.send({ status: 'fail', message: 'Kullanıcı giriş yapmamış veya latitudeveya longitude bilgileri eksik' })
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e.message }) }

}
async function updateLocation(latitude, longitude, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    if (username && latitude != null && longitude != null) {
      try {

        const currentUser = userType == 'user' ? await User.findOne({ username: username }) : await Driver.findOne({ username: username });
        currentUser.currentPosition = { latitude: latitude, longitude: longitude };
        currentUser.save();
        res.status(202).json({ status: 'ok', message: 'Konum Güncellendi' });

      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
    }
    else {
      res.send({ status: 'fail', message: 'Kullanıcı giriş yapmamış veya latitudeveya longitude bilgileri eksik' })
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}
async function deleteCard(cardNumber, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    if (username && cardNumber != null && userType == 'user') {
      try {

        const currentUser = await User.findOne({ username: username });
        var currentCard = currentUser.creditCards;
        var creditCardList = [];
        var alreadyExist = false;
        var itemIndex = null;
        if (currentCard) {
          currentCard.map((item) => { creditCardList.push(item) })
        }
        else {
          currentUser.creditCards = [];
        }

        // checks it if already credit card
        currentUser.creditCards.map((item, index) => { if (item.cardNumber == cardNumber) { alreadyExist = true; itemIndex = index; } });

        if (alreadyExist == false) {

          res.status(202).json({ status: 'fail', message: 'Kredi Kartı bulunamadı', e: cardNumber });
        }
        else {


          creditCardList.splice(itemIndex, 1);


          currentUser.creditCards = 'something'; // bu gerekli
          currentUser.creditCards = creditCardList;
          currentUser.save();
          res.status(202).json({ status: 'ok', message: 'Kredi Kartı Güncellendi', return: currentUser.creditCards });
        }



      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
    }
    else {
      res.send({ status: 'fail', message: 'Kullanıcı giriş yapmamış veya latitudeveya longitude bilgileri eksik' })
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e.message }) }

}
async function saveLocation(latitude, longitude, req, res) {
  try {
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    if (username && latitude != null && longitude != null && latitude > 0 && longitude > 0) {
      try {

        const currentUser = userType == 'user' ? await User.findOne({ username: username }) : await Driver.findOne({ username: username });
        currentUser.currentPosition = { latitude: latitude, longitude: longitude };
        currentUser.save();
        res.status(202).json({ status: 'ok', message: 'Konum Güncellendi', return: currentUser.currentPosition });
      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
    }
    else {
      res.send({ status: 'fail', message: 'Parametreler Yanlış' });
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }

}

async function addCard(cardNumber, expireDate, cc, placeHolder, type, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    if (username && cardNumber != null && expireDate != null && type != null && cc != null && placeHolder != null && userType == 'user') {
      try {

        const currentUser = await User.findOne({ username: username });
        var currentCard = currentUser.creditCards;
        var creditCardList = [];
        var alreadyExist = false;
        var itemIndex = null;
        if (currentCard) {
          currentCard.map((item) => { creditCardList.push(item) })
        }
        else {
          currentUser.creditCards = [];
        }

        // checks it if already credit card
        currentUser.creditCards.map((item, index) => { if (item.cardNumber == cardNumber) { alreadyExist = true; itemIndex = index; } });

        if (alreadyExist == false) {
          creditCardList.push({ cardNumber: cardNumber, expireDate: expireDate, cc: cc, placeHolder: placeHolder, type: type });
          currentUser.creditCards = creditCardList;
          currentUser.save();
          res.status(202).json({ status: 'ok', message: 'Kredi Kartı Eklendi', return: currentUser.creditCards });
        }
        else {


          creditCardList[itemIndex].cardNumber = cardNumber;
          creditCardList[itemIndex].expireDate = expireDate;
          creditCardList[itemIndex].cc = cc;
          creditCardList[itemIndex].placeHolder = placeHolder;
          creditCardList[itemIndex].type = type;


          currentUser.creditCards = 'something'; // bu gerekli
          currentUser.creditCards = creditCardList;
          currentUser.save();
          res.status(202).json({ status: 'ok', message: 'Kredi Kartı Güncellendi', return: currentUser.creditCards });
        }



      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
    }
    else {
      res.send({ status: 'fail', message: 'Kullanıcı giriş yapmamış veya latitudeveya longitude bilgileri eksik' })
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}

async function addIban(iban, placeHolder, bank, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    if (username && iban != null && bank != null && placeHolder != null && userType == 'driver') {
      try {

        const currentUser = await Driver.findOne({ username: username });
        var currentIban = currentUser.iban;
        var ibanList = [];
        var alreadyExist = false;
        var itemIndex = null;
        if (currentIban) {

          currentIban.map((item) => { ibanList.push(item) })
        }
        else {

          currentUser.iban = [];
        }

        // checks it if already credit card
        currentUser.iban.map((item, index) => { if (item.iban == iban) { alreadyExist = true; itemIndex = index; } });

        if (alreadyExist == false) {
          ibanList.push({ iban: iban, bank: bank, placeHolder: placeHolder });
          currentUser.iban = ibanList;
          currentUser.save();
          res.status(202).json({ status: 'ok', message: 'Kredi Kartı Eklendi', return: currentUser.iban });
        }
        else {


          ibanList[itemIndex].iban = iban;
          ibanList[itemIndex].bank = bank;
          ibanList[itemIndex].placeHolder = placeHolder;

          currentUser.iban = 'something'; // bu gerekli
          currentUser.iban = ibanList;
          currentUser.save();
          res.status(202).json({ status: 'ok', message: 'iban Güncellendi', return: currentUser.iban });
        }



      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
    }
    else {
      res.send({ status: 'fail', message: 'Kullanıcı giriş yapmamış veya bilgiler eksik' })
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}
async function addVehicle(plaka, marka, model, yil, renk, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    if (username && marka != null && model != null && yil != null && renk != null && userType == 'driver') {
      try {

        const currentUser = await Driver.findOne({ username: username });
        var currentVehicle = currentUser.vehicle;
        var vehiclList = [];
        var alreadyExist = false;
        var itemIndex = null;
        if (currentVehicle) {

          currentVehicle.map((item) => { vehiclList.push(item) })
        }
        else {

          currentUser.vehicle = [];
        }

        // checks it if already credit card
        currentUser.vehicle.map((item, index) => { if (item.plaka == plaka) { alreadyExist = true; itemIndex = index; } });

        if (alreadyExist == false) {
          vehiclList.push({ plaka: plaka, renk: renk, model: model, marka: marka, yil: yil });
          currentUser.vehicle = vehiclList;
          currentUser.save();
          res.status(202).json({ status: 'ok', message: 'Araç Eklendi', return: currentUser.vehicle });
        }
        else {


          vehiclList[itemIndex].plaka = plaka;
          vehiclList[itemIndex].marka = marka;
          vehiclList[itemIndex].model = model;
          vehiclList[itemIndex].yil = yil;
          vehiclList[itemIndex].renk = renk;

          currentUser.vehicle = 'something'; // bu gerekli
          currentUser.vehicle = vehiclList;
          currentUser.save();
          res.status(202).json({ status: 'ok', message: 'iban Güncellendi', return: currentUser.vehicle });
        }



      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
    }
    else {
      res.send({ status: 'fail', message: 'Kullanıcı giriş yapmamış veya birşeyler yanlış gitti' })
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}
async function getCreditCards(req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    if (username && userType == 'user') {
      try {

        const currentUser = await User.findOne({ username: username });
        var creditCards = currentUser.creditCards;

        res.status(202).json({ status: 'ok', creditCards: creditCards, creditCardsNumber: creditCards.length });




      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
    }
    else {
      res.send({ status: 'fail', message: 'Kullanıcı giriş yapmamış veya birşeyler yanlış gitti' })
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}
async function addPaymentLog(req, operation, amount, reason = null, token, finishedBalance) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;

    if (username && operation != null && amount != null) {
      try {

        const currentUser = userType == 'user' ? await User.findOne({ username: username }) : await Driver.findOne({ username: username });

        var paymentLog = new PaymentLog({ username: currentUser.username, operation: operation, amount: amount, reason: reason, token: token, finishedBalance: finishedBalance });
        paymentLog.save();
        return true;



      }
      catch (e) { return false; }
    }
    else {
      return false;
    }
  }
  catch (e) { return false; }
}







/*
 
  Other Tables
 
*/





async function getAll() {
  return await User.find().select('-hash');
}

async function getById(id) {
  return await User.findById(id).select('-hash');
}
