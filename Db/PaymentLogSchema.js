const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const paymentsSchema = new Schema({
  token:{type:String, required:true,unique:true},
  operation: { type: String, required: true },
  username: { type: String, required: true },
  amount: {type:Number,required:true},
  reason: { type: String, required: false },
  creditCard:{type:Object,required:false,default:null},
  finishedBalance:{type:Number,required:true},
  date:{ type: Date, required: true,default:Date.now() },
});

paymentsSchema.set('toJSON', { virtuals: true });
module.exports = Driver = mongoose.model('paymentLog', paymentsSchema);