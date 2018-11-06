const mongoose = require('mongoose');
const priceSchema = require('./Price');

const { Schema } = mongoose;
const packageSchema = new Schema({
  packageId: String,
  packageName: String,
  prices: [priceSchema],
  date: Date
});

mongoose.model('packages', packageSchema);
