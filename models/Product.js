const mongoose = require('mongoose');
const packageSchema = require('./Package');

const { Schema } = mongoose;
const productSchema = new Schema({
  id: String,
  name: String,
  packages: [packageSchema],
  dateTime: String
});

mongoose.model('products', productSchema);
