const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const paymentsSchema = new Schema({
  startedTime:{type:Date, required:true},
  distance: { type: Number, required: true },
  duration: { type: Number, required: true },
  username: {type:String,required:true},
  status: { type: Number, required: true },
  startCordinate:{type:Object,required:true},
  finishCordinate:{type:Object,required:true},
  passangerNumber:{type:Number,required:true},
  preferences:{type:Object,required:true},
  driverUsername:{type:String,required:true},
});

paymentsSchema.set('toJSON', { virtuals: true });
module.exports = Driver = mongoose.model('paymentLog', paymentsSchema);