const mongoose = require('mongoose');

const { Schema } = mongoose;

const mappingSchema = new Schema({
  productId: String,
  linkId: String,
});

mongoose.model('mappings', mappingSchema);
