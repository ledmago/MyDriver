const express = require('express');
const mongoose = require('mongoose');
const User = require('../Db/UserSchema');
const route = express.Router();
const {startTrip,CheckAlreadyCurrentTripExist,changeStatus} = require('../Controllers/TripService');

route.get('/checkCurrentTrip', async (req, res) => {
  const status = await CheckAlreadyCurrentTripExist(req,res);
  res.send({status:status});

});

route.post('/startTrip', async (req, res) => {

const {startedTime, distance,duration,startCordinate,finishCordinate,passangerNumber,preferences} = req.body;
    await startTrip(startedTime, distance,duration,startCordinate,finishCordinate,passangerNumber,preferences,req,res);
  
  });

  route.post('/changeStatus', async (req, res) => {

    const {tripId,newStatus} = req.body;
        await changeStatus(tripId,newStatus,req,res);
      
      });
module.exports = route;