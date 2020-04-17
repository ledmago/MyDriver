

const express = require('express');
const connectDB = require('./Db/Connection');
const app = express();
const errorHandler = require('./Api/errors');
const config = require('./config.json');

var jwt = require('jsonwebtoken');
var privateKey = 'ledmagoDevelopmentServerPrivateKey';
var cookieParser = require('cookie-parser');
app.use(cookieParser());
// var token = jwt.sign({ foo: 'bar' }, config.secret);

connectDB();
app.use(express.json({ extended: false }));
app.get('/',(req,res)=>{res.send('okey')})
app.use('/api/Login', require('./Api/Login'));
app.use('/api/Register', require('./Api/Register'));
app.use('/api/Logout', require('./Api/Logout'));
app.use('/api/userModel', require('./Api/User'));
// global error handler
app.use(errorHandler);
const Port = process.env.Port || 1337;

app.listen(Port, () => console.log('Server started'));