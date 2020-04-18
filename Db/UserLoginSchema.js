const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  hash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email : {type:String,required:true},
  phone : {type:String,required:true},
  gender : {type:String,required:true},
  createdDate: { type: Date, default: Date.now }
});

userSchema.set('toJSON', { virtuals: true });


module.exports = User = mongoose.model('users', userSchema);