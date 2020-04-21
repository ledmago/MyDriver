const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const driverSchema = new Schema({
  username: { type: String, unique: true, required: true },
  hash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email : {type:String,required:true},
  gender : {type:String,required:true},
  phone : {type:String,required:true},
  currentPosition:{type:Object,required:false},
  balance:{type:Number,default:0,required:false},
  vehicle:{type:Object,required:true},
  driverLicense:{type:Boolean,default:true,required:true},
  iban:{type:Object,required:false},
  profilePicture:{type:String,required:false,default:null},
  createdDate: { type: Date, default: Date.now },
  userType:{type:String,default:'driver',required:true}
});

driverSchema.set('toJSON', { virtuals: true });


module.exports = Driver = mongoose.model('drivers', driverSchema);