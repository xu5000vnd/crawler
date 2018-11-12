const mongoose = require('mongoose');

const { Schema } = mongoose;
const logSchema = new Schema({
  error: String,
  datetimeStart: Date
});

mongoose.model('logs', logSchema);
