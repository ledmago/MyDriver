const express = require('express');
const mongoose = require('mongoose');
const User = require('../Db/UserSchema');
const route = express.Router();
const { startTrip, CheckAlreadyCurrentTripExist, changeStatus,assignDriver} = require('../Controllers/TripService');

route.post('/checkCurrentTrip', async (req, res) => {
  const status = await CheckAlreadyCurrentTripExist(req, res);
});

route.post('/startTrip', async (req, res) => {

  const { startedTime, distance, duration, startCordinate, finishCordinate, passangerNumber, preferences,price,extraDetail,kalkisAddress,varisAddress} = req.body;
  await startTrip(startedTime, distance, duration, startCordinate, finishCordinate, passangerNumber, preferences,price,extraDetail,kalkisAddress,varisAddress, req, res);

});

route.post('/changeStatus', async (req, res) => {

  const { tripId, newStatus } = req.body;
  await changeStatus(tripId, newStatus, req, res);

});
route.post('/assignDriver', async (req, res) => {

  const {tripId} = req.body;
      await assignDriver(tripId,req,res);
    
    });
  
module.exports = route;