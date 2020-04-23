const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PromotionCodes = new Schema({
  code:{type:String,required:true,unique:true},
  amount:{type:Number,required:true},
  used:{type:Boolean,required:true},
  username:{type:String,required:false,default:null}
});

PromotionCodes.set('toJSON', { virtuals: true });
module.exports = Driver = mongoose.model('promotioncodes', PromotionCodes);