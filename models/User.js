const mongoose = require('mongoose');

const { Schema } = mongoose;
const userSchame = new Schema({
  username: String,
  password: String
});

mongoose.model('users', userSchame);
