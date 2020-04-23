const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const {usePromotionCode} = require('../Controllers/PromotionCode');

route.post('/usePromotionCode', async (req, res) => {
 const {code} = req.body;
 await usePromotionCode(code,req, res);

});

  
module.exports = route;