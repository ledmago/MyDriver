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
  checkDriverisFree,
  listDriverByNearAndFree
};


async function checkDriverisFree(driverUsername, req, res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;


    if (username) // Only can access drivers
    {
      const trip = await Trip.exists({ driverUsername: driverUsername, status: { $gt: 0, $lt: 4 } });
      if (trip) {
        res.send({ status: 'ok', message: 'driver dolu' });

      }
      else {
        res.send({ status: 'ok', message: 'driver boşta' })
      }

    }
    else {
      res.send({ status: 'fail', message: 'Atamaya izin yok' });
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}


async function checkDriverisFree_LOCAL(driverUsername, req, res) {

  try {
  


    if (driverUsername !=null)
    {
      const trip = await Trip.exists({ driverUsername: driverUsername, status: { $gt: 0, $lt: 4 } });
      if (trip) {
        return false; // Driver Dolu
      }
      else {
        return true; // Driver Boş
      }

    }
    else {
      return false;
    }
  }
  catch (e) { console.log({ status: 'fail', message: 'Bir hata oluştu', e: e.message });return false; }
}

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
      res.send({ status: 'ok', message: 'driver atandı', trip: trip });
    }
    else {
      res.send({ status: 'fail', message: 'Atamaya izin yok' });
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}

// ONLY for user NOT driver
async function listDriverByNearAndFree(username,req,res) {
var resultObject = [];
  try {
    const user = await User.findOne({ username: username });
    if (user) {
     var latitudeCriteriaLT = user.currentPosition.latitude + 0.05;
     var latitudeCriteriaGT = user.currentPosition.latitude - 0.05;
     var longitudeCriteriaLT = user.currentPosition.longitude + 0.05;
     var longitudeCriteriaGT = user.currentPosition.longitude - 0.05;
      const NearDrivers = await Driver.find({'currentPosition.latitude':{$gt:latitudeCriteriaGT,$lt:latitudeCriteriaLT},'currentPosition.longitude':{$gt:longitudeCriteriaGT,$lt:longitudeCriteriaLT}});
      //kontrol et isFree diye YAPILDI

      // kontrol et ACIK MI DIYE


      const islem = NearDrivers.map(async (item)=>{
        const isDriverFree = await checkDriverisFree_LOCAL(item.username);
        if(isDriverFree == true){
          resultObject.push(item);
        }
      })
    
Promise.all(islem).then(() => res.send(resultObject) );
     
    }
    else {
      console.log('Kullanıcı Bulunamadı')
      return false;
    }


  }
  catch (e) { console.log({ e: e.message }); return false; }
}



async function resetTriptoDefaults(tripId) {

  try {
    const trip = await Trip.findById(tripId);
    if (trip) // Only can access drivers
    {
      trip.driverUsername = null;
      trip.status = 0;
      trip.save();
      return true;
    }
    else {
      return false;
    }
  }
  catch (e) { return false; }
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
    if (username) {
      const IsAlready = await Trip.findOne({ username: username, status: { $lt: 4 } }) // les than 4 of status of trip
      if (IsAlready) {
        res.send({ status: 'ok', return: IsAlready });
      }
      else {
        res.send({ status: 'fail', message: 'yok' });
      }
    }
  }
  catch (e) { res.send({ status: 'fail', e: e.message }) }




}

async function CheckAlreadyCurrentTripExist_LOCAL(req, res) {


  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    if (username) {
      const IsAlready = await Trip.findOne({ username: username, status: { $lt: 4 } }) // les than 4 of status of trip
      if (IsAlready) {
        return true;
      }
      else {
        return false;
      }
    }
  }
  catch (e) { res.send({ status: 'fail', e: e.message }) }




}
async function startTrip(startedTime, distance, duration, startCordinate, finishCordinate, passangerNumber, preferences, price, extraDetail, kalkisAddress, varisAddress, req, res) {

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

          const trip = new Trip({ username: username, status: 0, driverUsername: null, startedTime: startedTime, distance: parseFloat(distance), duration: parseFloat(duration), startCordinate: startCordinate, finishCordinate: finishCordinate, passangerNumber: parseFloat(passangerNumber), preferences: preferences, price: priceNumber, extraDetail: extraDetail, kalkisAddress: kalkisAddress, varisAddress: varisAddress });
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
