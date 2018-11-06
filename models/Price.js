const mongoose = require('mongoose');

const { Schema } = mongoose;
const priceSchema = new Schema({
  marketPrice: String,
  price: String,
  name: String
});

mongoose.model('prices', priceSchema);
