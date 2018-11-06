const mongoose = require('mongoose');

const { Schema } = mongoose;

const mappingSchema = new Schema({
  productId: String,
  activityId: String,
});

mongoose.model('mappings', mappingSchema);
