

const express = require('express');
const connectDB = require('./Db/Connection');
const app = express();
const errorHandler = require('./Api/errors');
const config = require('./config.json');

var jwt = require('jsonwebtoken');
var privateKey = 'ledmagoDevelopmentServerPrivateKey';
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
app.use(cookieParser());
// var token = jwt.sign({ foo: 'bar' }, config.secret);

connectDB();
app.use(express.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }))


app.get('/',(req,res)=>{res.send('okey')})
app.use('/api/LoginUser', require('./Api/LoginUser'));
app.use('/api/LoginDriver', require('./Api/LoginDriver'));
app.use('/api/RegisterUser', require('./Api/RegisterUser'));
app.use('/api/RegisterDriver', require('./Api/RegisterDriver'));
app.use('/api/Logout', require('./Api/Logout'));



app.use('/api/UserProfile', require('./Api/UserProfile'));
app.use('/api/Trip', require('./Api/Trip'));
app.use('/api/PromotionCode', require('./Api/PromotionCode'));

app.use('/api/userModel', require('./Api/User'));
// global error handler
app.use(errorHandler);
const Port = process.env.Port || 1337;

app.listen(Port, () => console.log('Server started'));