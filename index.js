const express = require('express');
const { exec } = require('child_process');
const Utils = require('./utils/utils');
const mongoose = require('mongoose');
const keys = require('./config/keys');
require('./models/Product');
require('./models/Mapping');
require('./models/Setting');
require('./models/Log');

mongoose.connect(keys.mongoURI);

const MappingModel = mongoose.model('mappings');
const ProductioModel = mongoose.model('products');
const SettingModel = mongoose.model('settings');
const LogModel = mongoose.model('logs');

const app = express();


const handleCallCrawler = (req, res, next) => {
  if (//req.headers.origin === 'https://singbui.com'
    1) {
    next();
  } else {
    const resAPI = Utils.resAPI();
    resAPI.error.message = 'forbidden page';
    res.send(resAPI);
  }
};

// Add headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


app.get('/api/klook/posts/:postId', async (req, res) => {
  const postId = req.params.postId;
  const mapping = await MappingModel.findOne({ productId: postId });
  const resAPI = Utils.resAPI();
  if (mapping) {
    const activity = await ProductioModel.findOne({ id: mapping.activityId });
    if (activity) {
      resAPI.success = true;
      resAPI.result.push(activity);
      res.send(resAPI);
    } else {
      resAPI.error.message = 'Not found Activity ID';
      res.send(resAPI);
    }
  } else {
    resAPI.error.message = 'Not found Post ID';
    res.send(resAPI);
  }
});

app.post('/api/klook/crawler', handleCallCrawler, async (req, res) => {
  try {
    console.log('run /api/klook/crawler');
    await SettingModel.findOneAndUpdate({ name: 'state' }, { $set: { value: 1 } });
    console.log('run cmd');
    exec('node crawler.js', (err, stdout, stderr) => { //eslint-disable-line
      if (err) {
        console.log(err);
      }
      //do stuff
      console.log('finished cmd');
    });

    const resAPI = Utils.resAPI();
    resAPI.success = true;
    res.send(resAPI);
  } catch (error) {
    throw error;
  }
});

app.get('/api/klook/state', async (req, res) => {
  const state = await SettingModel.findOne({ name: 'state' });
  const resAPI = Utils.resAPI();
  if (state) {
    resAPI.result.push(state);
  }
  resAPI.success = true;
  res.send(resAPI);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
