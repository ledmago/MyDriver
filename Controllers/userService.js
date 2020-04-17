const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Db/UserLoginSchema');

module.exports = {
  authenticate,
  getAll,
  getById,
  create,
  update,
  delete: _delete
};


findUserByCookie = async (userHash) => {
  if (userHash) {
    var result = jwt.verify(userHash, config.secret);
    return await User.findOne({ username: result.username });
  }
}


async function authenticate({ username, password } = null, req, res) {

  if (!req.cookies.userHash) {

    if (username != null && password != null) {
      const user = await User.findOne({ username });
      if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const userHashToken = jwt.sign({ username: username }, config.secret);
        res.cookie('userHash', userHashToken)
        return {
          ...userWithoutHash,
          userHashToken
        };
      }
      else{res.send('username or password is wrong')}


    }
    else { res.send('username or password is wrong') }
  }
  else {
    res.send(await findUserByCookie(req.cookies.userHash));
  }
}

async function getAll() {
  return await User.find().select('-hash');
}

async function getById(id) {
  return await User.findById(id).select('-hash');
}

async function create(userParam, req, res) {
  // Cookie Control
  if (!req.cookies.userHash) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
      return { status: 'fail', text: 'Username ' + userParam.username + ' is already taken' };
      //  throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
      user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
    var userHashToken = jwt.sign({ username: userParam.username }, config.secret);
    res.cookie('userHash', userHashToken)
    return { status: 'ok', username: userParam.username, firstName: userParam.firstName, lastName: userParam.lastName };

  }
  else {
    res.send('You are logged in').status(404)
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