const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Db/UserSchema');
const Driver = require('../Db/DriverSchema');

module.exports = {
  authenticateUser,
  authenticateDriver,
  getAll,
  getById,
  registerUser,
  registerDriver,
  update,
  delete: _delete
};


var createHash = (username, res, userType) => {
  var userHashToken = jwt.sign({ username: username, userType: userType }, config.secret);
  res.cookie('userHash', userHashToken);

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

          this.authenticate(username, password)
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

async function getAll() {
  return await User.find().select('-hash');
}

async function getById(id) {
  return await User.findById(id).select('-hash');
}



// Validating Functions for Registering User


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
// Validate For User
var validateRegisterParams = async (userParams) => {

  var isUsernameAlready = await ValidateUsername(userParams.username, userParams.userType) ? true : 'the username ' + userParams.username + ' is already taken.';
  var isUsernameValid = userParams.username.length > 4 && userParams.username.length < 15 ? true : ' Your Username should be at least 5 character and maximum 15 character';
  var isEmailValid = await ValidateEmail(userParams.email) ? true : ' Your email Address is wrong';
  var isAlreadyEmail = await isThereEmailAlready(userParams.email, userParams.userType) ? true : ' Your email address is registered by another account.';
  var isPhone = await validatePhone(userParams.phone) ? true : ' Your phone number is not valid.';
  var isPasswordValid = userParams.password.length > 5 && userParams.password.length < 15 ? true : ' Your password should be at least 6 character and maximum 15 character';
  var isFirstNameValid = userParams.firstName.length > 2 && userParams.firstName.length < 18 ? true : 'Your first name should be at least 3 character and maximum 18 character ';
  var isFLastNameValid = userParams.lastName.length > 2 && userParams.lastName.length < 18 ? true : 'Your last name should be at least 3 character and maximum 18 character ';
  var isGendeValid = userParams.gender == 'male' || userParams.gender == 'female' ? true : 'Your gender ether by male or female';

  // For Drivers
  if (userParams.userType == 'driver') {
    var isvehiclValid = userParams.vehicleTemp.marka.length > 1 && userParams.vehicleTemp.model.length > 1 && userParams.vehicleTemp.plaka.length > 1 ? true : 'Check your vehicle informations';
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
      return { status: 'false', message: errorArray }

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
      return { status: 'false', message: errorArray }

    }
  }






};


//Validate For Driver




// Register User Function

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


async function update(id, userParam) {
  const user = await User.findById(id);

  // validate
  if (!user) throw 'User not found';
  if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
    throw 'Username "' + userParam.username + '" is already taken';
  }

  // hash password if it was entered
  if (userParam.password) {
    userParam.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // copy userParam properties to user
  Object.assign(user, userParam);

  await user.save();
}

async function _delete(id) {
  await User.findByIdAndRemove(id);
}