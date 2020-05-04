

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
const {CheckLogin} = require('./Controllers/UserService');
const server = require('http').Server(app);
const io = require('socket.io')(server);
// var token = jwt.sign({ foo: 'bar' }, config.secret);

connectDB();
app.use(express.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }))


app.use('/api/LoginUser', require('./Api/LoginUser'));
app.use('/api/LoginDriver', require('./Api/LoginDriver'));
app.use('/api/RegisterUser', require('./Api/RegisterUser'));
app.use('/api/RegisterDriver', require('./Api/RegisterDriver'));
app.use('/api/Logout', require('./Api/Logout'));



app.use('/api/UserProfile', require('./Api/UserProfile'));
app.use('/api/Trip', require('./Api/Trip'));
app.use('/api/PromotionCode', require('./Api/PromotionCode'));
app.use('/api/Message', require('./Api/Message'));

app.use('/api/userModel', require('./Api/User'));




app.post('/Api/LoginByCookie', async (req, res) => {
    var result = await CheckLogin(req.cookies.userHash)
    if(result)
    {
        res.send(result);
    }
    else{
        res.send({status:'fail'})
    }
    // try {
    //     if (userHash) {
    //       var result = jwt.verify(userHash, config.secret);
    
    //       const user = result.userType == 'user' ? await User.findOne({ username: result.username }) : await Driver.findOne({ username: result.username })
    //       if (user) {
    //         userWithoutHash = user;
    //         // user.hash = ''
    //         res.send(userWithoutHash);
    //       }
    //       else {
    //         res.send({status:'fail'})
    //       }
    //     }
    //     else {
    //         res.send({status:'fail'})
    //     }
    //   }
    //   catch (e) {
    //     res.send({status:'fail'})
    //   }

//    if(req.cookies.userHash)
//    {
//        try{
//            const result = jwt.verify(req.cookies.userHash,config.secret);
//             if(result.userType != null)
//             {
//                 result.userType == 'user' ? await 
//                 res.json(result)
//             }
//             else{
//                 res.send({status:'fail'})
//             }
//     }   
//     catch(e)
//     {
//         res.send({status:'fail'})
//     }
        
//    }
//    else{
//        res.send({status:'fail'})
//    }
 });

// global error handler
app.use(errorHandler);

app.get('/sendMessage', function (req, res){
    io.emit('selamlar',{as:'as'});
   });



app.get('/', function (req, res){
    res.sendFile(__dirname + '/SocketIO//index.html');
   });


const Port = process.env.Port || 1337;

io.on('connection', socket => {
    console.log('client connected ' + socket.id)
    socket.on('update', () => {
        console.log('update request');
        io.emit('update')
    
    });

  
    // client.on('event', data => { /* … */ });
    // client.on('disconnect', () => { /* … */ });
  });

server.listen(Port, () => console.log('Server started'));