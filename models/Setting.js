const mongoose = require('mongoose');

const { Schema } = mongoose;
const settingSchema = new Schema({
  name: String,
  value: String
});

mongoose.model('settings', settingSchema);
