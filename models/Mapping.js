const mongoose = require('mongoose');

const { Schema } = mongoose;

const mappingSchema = new Schema({
  productId: String,
  linkId: String,
  link: String
});

mongoose.model('mapping', mappingSchema);
