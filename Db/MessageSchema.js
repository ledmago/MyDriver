const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MessageSchema = new Schema({
  senderUsername:{type:String, required:true},
  receiverUsername: { type: String, required: true },
  date: { type: Date, required: true,Default:Date.now()},
  message: {type:String,required:true},
  readed:{type:Boolean,required:true,default:false}
});

MessageSchema.set('toJSON', { virtuals: true });
module.exports = Driver = mongoose.model('messages', MessageSchema);