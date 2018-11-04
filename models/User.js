const mongoose = require('mongoose');

const { Schema } = mongoose;
const userSchame = new Schema({
});

mongoose.model('users', userSchame);
