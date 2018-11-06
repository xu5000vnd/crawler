const mongoose = require('mongoose');

const { Schema } = mongoose;
const mappingSchema = new Schema({
  activityId: String,
  productId: String
});

mongoose.model('mappings', mappingSchema);
