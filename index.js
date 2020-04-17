

const express = require('express');
const connectDB = require('./Db/Connection');
const app = express();

var jwt = require('jsonwebtoken');
var privateKey = 'ledmagoDevelopmentServerPrivateKey';

var token = jwt.sign({ foo: 'bar' }, privateKey);

connectDB();
app.use(express.json({ extended: false }));
app.get('/',(req,res)=>{res.send('okey')})
app.use('/api/userModel', require('./Api/User'));
const Port = process.env.Port || 1337;

app.listen(Port, () => console.log('Server started'));