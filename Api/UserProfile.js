const express = require('express');
const config = require('../config.json');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const route = express.Router();
const fileUpload = require('express-fileupload');
route.use(fileUpload()); // Resim Yüklemek İçin
var image = require('express-image');
const { saveLocation,getPaymentLog,increase_decreaseBalance,changePassword, changeEmail, updateLocation, addCard,deleteCard, addIban,deleteIban, addVehicle,uploadProfilePhoto,getProfilePicture,getCreditCards,deleteVehicle } = require('../Controllers/UserService');


route.post('/increaseBalance', async (req, res) => {
    await increase_decreaseBalance(req.body.token, req, res);
});
route.post('/decreaseBalance', async (req, res) => {
    await increase_decreaseBalance(req.body.token, req, res);
});
route.post('/ChangePassword', async (req, res) => {
    await changePassword(req.body.newPassword, req.body.password, req, res);
});
route.post('/ChangeEmail', async (req, res) => {
    await changeEmail(req.body.email, req, res);
});
route.post('/updateLocation', async (req, res) => {
    await updateLocation(req.body.latitude, req.body.longitude, req, res);
});
route.post('/addCard', async (req, res) => {
    await addCard(req.body.cardNumber, req.body.expireDate, req.body.cc, req.body.placeHolder,req.body.type, req, res);
});
route.post('/deleteCard', async (req, res) => {
    await deleteCard(req.body.cardNumber, req, res);
});
route.post('/addIban', async (req, res) => {
    await addIban(req.body.iban, req.body.placeHolder, req.body.bank, req, res);
});
route.post('/deleteIban', async (req, res) => {
    await deleteIban(req.body.iban,req, res);
});
route.post('/addVehicle', async (req, res) => {
    await addVehicle(req.body.plaka, req.body.marka, req.body.model, req.body.yil, req.body.renk, req, res);
});
route.post('/deleteVehicle', async (req, res) => {
    await deleteVehicle(req.body.plaka, req, res);
});
route.post('/uploadProfilePhoto',async (req, res) => {
    
    await uploadProfilePhoto(req,res);

  
});
route.post('/getCreditCards',async (req, res) => {
    await getCreditCards(req,res);
});

route.get('/getProfilePicture/:username/:userType',async (req, res) => {
    await getProfilePicture(req.params.username,req.params.userType,req,res);
});
route.post('/getPaymentLog',async (req, res) => {
    await getPaymentLog(req,res);
});
route.post('/saveLocation',async (req, res) => {
    await saveLocation(req.body.latitude,req.body.longitude,req,res);
});



route.get('/jwt', async (req, res) => {
    const jwt2 = await jwt.sign({
        username: 'ledmago2',
        amount:50,
        operation:'decrease',
    }, 'secretKey00009', { expiresIn: 7 });
    res.json(jwt2);
});


route.get('/jwtverify/:jwt', async (req, res) => {
    res.send(await jwt.verify(req.params.jwt, 'data'));
});



// const Storage = multer.diskStorage({
//     destination(req, file, callback) {
//       callback(null, './images')
//     },
//     filename(req, file, callback) {
//       callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
//     },
//   })
//   const upload = multer({ storage: Storage})


//   route.post('/uploadProfilePhoto',upload.single('photo'), (req, res) => {
    
//     console.log('file', req.files)
//     console.log('body', req.body)
//     res.status(200).json({
//       message: 'success!',
//       file:req.file,
//     })
//   })
module.exports = route;