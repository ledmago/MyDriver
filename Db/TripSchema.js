const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tripSchema = new Schema({
  startedTime:{type:Date, required:true},
  distance: { type: Number, required: true },
  duration: { type: Number, required: true },
  username: {type:String,required:true},
  status: { type: Number, required: true },
  startCordinate:{type:Object,required:true},
  finishCordinate:{type:Object,required:true},
  passangerNumber:{type:Number,required:true},
  preferences:{type:Object,required:false},
  driverUsername:{type:String,required:false,default:null},
});

tripSchema.set('toJSON', { virtuals: true });
module.exports = Driver = mongoose.model('Trips', tripSchema);