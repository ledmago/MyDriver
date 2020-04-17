const mongoose = require('mongoose');

const URI ="mongodb+srv://ledmago:Ledmago11@ledmago-jyscr.azure.mongodb.net/General?retryWrites=true&w=majority";

const connectDB = async () => {
  await mongoose.connect(URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
  console.log('db connected..!');
};

module.exports = connectDB;