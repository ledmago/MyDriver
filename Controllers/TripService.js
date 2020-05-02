const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { CheckLogin } = require('./UserService')
const User = require('../Db/UserSchema');
const Driver = require('../Db/DriverSchema');
const Trip = require('../Db/TripSchema');
const UserService = require('./UserService');
module.exports = {
  startTrip,
  CheckAlreadyCurrentTripExist,
  changeStatus,
  assignDriver,

};

async function assignDriver(tripId, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;

    const trip = await Trip.findById(tripId);
    if (userType == 'driver' && trip) // Only can access drivers
    {
      trip.driverUsername = username;
      trip.status = 1;
      trip.save();
      res.send({ status: 'ok', message: 'driver atandı', trip: trip })
    }
    else {
      res.send({ status: 'fail', message: 'Atamaya izin yok' });
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}

async function changeStatus(tripId, newStatus, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;

    const trip = await Trip.findById(tripId);
    if (trip.username == username || trip.driverUsername == username) // Only can access owner of trip or driver
    {
      trip.status = newStatus;
      trip.save();
      res.send({ status: 'ok', message: 'status değiştirildi', tripStatus: trip.status })
    }
    else {
      res.send({ status: 'fail', message: 'Değiştirmeye izin yok' });
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}

async function CheckAlreadyCurrentTripExist(req, res) {


  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    if(username)
    {
      const IsAlready = await Trip.findOne({ username: username, status: { $lt: 4 } }) // les than 4 of status of trip
      if(IsAlready)
      {
        res.send({status:'ok',return:IsAlready});
      }
      else
      {
        res.send({status:'fail',message:'yok'});
      }
    }
  }
  catch (e) { res.send({ status: 'fail',e: e.message }) }




}

async function CheckAlreadyCurrentTripExist_LOCAL(req, res) {


  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    if(username)
    {
      const IsAlready = await Trip.findOne({ username: username, status: { $lt: 4 } }) // les than 4 of status of trip
      if(IsAlready)
      {
    return true;
      }
      else
      {
       return false;
      }
    }
  }
  catch (e) { res.send({ status: 'fail',e: e.message }) }




}
async function startTrip(startedTime, distance, duration, startCordinate, finishCordinate, passangerNumber, preferences, price, extraDetail,kalkisAddress,varisAddress, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    var userBalance = parseFloat(generalUser.balance);
    var priceNumber = parseFloat(price);

    const alreadyExist = await CheckAlreadyCurrentTripExist_LOCAL(req, res, generalUser)
    if (userBalance >= priceNumber) {
      if (username && userType == 'user' && alreadyExist == false && startedTime != null && distance != null && duration != null && startCordinate.latitude != null && startCordinate.longitude != null && finishCordinate != null && passangerNumber > 0) {
        try {
          const token = await jwt.sign({ amount: priceNumber, username: username, operation: 'decrease', time: Date.now() }, config.secret);

          const trip = new Trip({ username: username, status: 0, driverUsername: null, startedTime: startedTime, distance: parseFloat(distance), duration: parseFloat(duration), startCordinate: startCordinate, finishCordinate: finishCordinate, passangerNumber: parseFloat(passangerNumber), preferences: preferences, price: priceNumber, extraDetail: extraDetail,kalkisAddress:kalkisAddress,varisAddress:varisAddress });
          trip.save();
          await UserService.increase_decreaseBalance(token, req, res, 'Yolculuk Ücreti') // balanceDüş

          res.send({ status: 'ok', message: 'Trip Oluşturuldu', return: trip })

        }
        catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e.message }) }
      }
      else {
        paramError = startedTime != null && distance != null && duration != null && startCordinate.latitude != null && startCordinate.longitude != null && finishCordinate != null && passangerNumber > 0;
        res.send({ status: 'fail', alreadyExist: alreadyExist, param: paramError, message: 'activeTripError' })
      }
    }
    else {
      res.send({ status: 'fail', alreadyExist: alreadyExist, message: 'noSufficientMoney', price: priceNumber, balance: userBalance })
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e.message }) }
}
