const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {CheckLogin} = require('./UserService')
const User = require('../Db/UserSchema');
const Driver = require('../Db/DriverSchema');
const Trip = require('../Db/TripSchema');

module.exports = {
 startTrip,
 CheckAlreadyCurrentTripExist,
 changeStatus,

};

async function changeStatus(tripId,newStatus,req,res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;
    
    const trip = await Trip.findById(tripId);
    if(trip.username == username || trip.driverUsername == username) // Only can access owner of trip or driver
    {
      trip.status = newStatus;
      trip.save();
      res.send({ status: 'ok', message: 'status değiştirildi', tripStatus:trip.status })
    }
    else{
      res.send({ status: 'fail',message:'Değiştirmeye izin yok'});
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}


async function CheckAlreadyCurrentTripExist(req,res,user = null)
{
  if(user == null){ user = await CheckLogin(req.cookies.userHash)}
  return await Trip.exists({username:user.username,status:{$lt : 4}}) // les than 4 of status of trip

}

async function startTrip(startedTime, distance,duration,startCordinate,finishCordinate,passangerNumber,preferences,req,res) {

  try {
    var generalUser = await CheckLogin(req.cookies.userHash);
    var username = generalUser.username;
    var userType = generalUser.userType;

    const alreadyExist = await CheckAlreadyCurrentTripExist(req,res,generalUser)


    if (username && userType == 'user' && alreadyExist == false && startedTime != null && distance != null && duration != null && startCordinate.latitude != null && startCordinate.longitude != null && finishCordinate != null && passangerNumber >0) {
      try {

        const trip = new Trip({username:username,status:0,driverUsername:null,startedTime:startedTime, distance:distance,duration:duration,startCordinate:startCordinate,finishCordinate:finishCordinate,passangerNumber:passangerNumber,preferences:preferences});
        trip.save();
        res.send({ status: 'ok', message: 'Trip Oluşturuldu', return:trip })
        
      }
      catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
    }
    else {
      paramError =  startedTime != null && distance != null && duration != null && startCordinate.latitude != null && startCordinate.longitude != null && finishCordinate != null && passangerNumber > 0;
      res.send({ status: 'fail', alreadyExist:alreadyExist,param:paramError, message: 'Kullanıcı giriş yapmamış veya aktif yolculuğu var veya parametreler eksik' })
    }
  }
  catch (e) { res.send({ status: 'fail', message: 'Bir hata oluştu', e: e }) }
}
