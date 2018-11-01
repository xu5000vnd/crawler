const mongoose = require('mongoose');
const packageSchema = require('./Package');

const { Schema } = mongoose;
const productSchema = new Schema({
  productId: String,
  packages: [packageSchema],
  saved: { type: Number, default: 0 }
});

mongoose.model('products', productSchema);
