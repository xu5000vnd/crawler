const mongoose = require('mongoose');

const { Schema } = mongoose;

const packageSchema = new Schema({
  title: String,
  marketPriceAdult: String,
  priceAdult: String,
  marketPriceChild: String,
  priceChild: String,
  marketPriceElderly: String,
  priceElderly: String,
  time: String,
  date: Date
});

mongoose.model('package', packageSchema);
